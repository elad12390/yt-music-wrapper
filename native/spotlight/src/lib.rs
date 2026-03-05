use napi::bindgen_prelude::*;
use napi_derive::napi;

use objc2::AnyThread;
use objc2_core_spotlight::{
    CSSearchableIndex, CSSearchableItem, CSSearchableItemAttributeSet,
};
use objc2_foundation::{NSArray, NSError, NSNumber, NSString, NSURL};

use block2::RcBlock;
use std::sync::mpsc;
use std::time::Duration;

const DOMAIN_ID: &str = "com.eladbenhaim.yt-music-wrapper.songs";

#[napi(object)]
pub struct SongInput {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub artwork_url: Option<String>,
    pub duration: Option<f64>,
}

#[allow(deprecated)]
fn build_searchable_items(songs: &[SongInput]) -> Vec<objc2::rc::Retained<CSSearchableItem>> {
    songs
        .iter()
        .filter(|s| !s.id.is_empty() && !s.title.is_empty())
        .map(|song| unsafe {
            let attrs = CSSearchableItemAttributeSet::initWithItemContentType(
                CSSearchableItemAttributeSet::alloc(),
                &NSString::from_str("public.audio"),
            );

            attrs.setTitle(Some(&NSString::from_str(&song.title)));
            attrs.setDisplayName(Some(&NSString::from_str(&song.title)));
            attrs.setArtist(Some(&NSString::from_str(&song.artist)));
            attrs.setAlbum(Some(&NSString::from_str(&song.album)));

            if let Some(ref url) = song.artwork_url {
                if let Some(nsurl) = NSURL::URLWithString(&NSString::from_str(url)) {
                    attrs.setThumbnailURL(Some(&nsurl));
                }
            }

            if let Some(secs) = song.duration {
                attrs.setDuration(Some(&NSNumber::new_f64(secs)));
            }

            let content_url_str = format!("ytmusic://play?id={}", song.id);
            if let Some(content_url) = NSURL::URLWithString(&NSString::from_str(&content_url_str)) {
                attrs.setContentURL(Some(&content_url));
            }

            CSSearchableItem::initWithUniqueIdentifier_domainIdentifier_attributeSet(
                CSSearchableItem::alloc(),
                Some(&NSString::from_str(&song.id)),
                Some(&NSString::from_str(DOMAIN_ID)),
                &attrs,
            )
        })
        .collect()
}

fn wait_for_spotlight_completion(
    operation: impl FnOnce(Option<&block2::DynBlock<dyn Fn(*mut NSError)>>),
) -> napi::Result<()> {
    let (tx, rx) = mpsc::channel::<Option<String>>();

    let completion = RcBlock::new(move |error: *mut NSError| {
        if error.is_null() {
            let _ = tx.send(None);
        } else {
            let desc = unsafe { (*error).localizedDescription().to_string() };
            let _ = tx.send(Some(desc));
        }
    });

    operation(Some(&completion));

    match rx.recv_timeout(Duration::from_secs(5)) {
        Ok(None) => Ok(()),
        Ok(Some(err_desc)) => Err(Error::new(
            Status::GenericFailure,
            format!("CoreSpotlight error: {err_desc}"),
        )),
        Err(mpsc::RecvTimeoutError::Timeout) => {
            // corespotlightd may not respond for unsigned processes — treat as success
            Ok(())
        }
        Err(mpsc::RecvTimeoutError::Disconnected) => Err(Error::new(
            Status::GenericFailure,
            "CoreSpotlight completion handler channel dropped".to_string(),
        )),
    }
}

#[napi]
pub async fn index_songs(songs: Vec<SongInput>) -> napi::Result<()> {
    if songs.is_empty() {
        return Ok(());
    }

    let has_invalid = songs.iter().any(|s| s.id.is_empty() || s.title.is_empty());
    if has_invalid {
        return Err(Error::new(
            Status::InvalidArg,
            "Each song must have a non-empty id and title".to_string(),
        ));
    }

    let items = build_searchable_items(&songs);
    let items_array = NSArray::from_retained_slice(&items);
    let index = unsafe { CSSearchableIndex::defaultSearchableIndex() };

    wait_for_spotlight_completion(|handler| unsafe {
        index.indexSearchableItems_completionHandler(&items_array, handler);
    })
}

#[napi]
pub async fn remove_songs(ids: Vec<String>) -> napi::Result<()> {
    if ids.is_empty() {
        return Ok(());
    }

    let ns_ids: Vec<objc2::rc::Retained<NSString>> =
        ids.iter().map(|id| NSString::from_str(id)).collect();
    let ns_refs: Vec<&NSString> = ns_ids.iter().map(|s| &**s).collect();
    let ids_array = NSArray::from_slice(&ns_refs);
    let index = unsafe { CSSearchableIndex::defaultSearchableIndex() };

    wait_for_spotlight_completion(|handler| unsafe {
        index.deleteSearchableItemsWithIdentifiers_completionHandler(&ids_array, handler);
    })
}

#[napi]
pub async fn remove_all_songs() -> napi::Result<()> {
    let index = unsafe { CSSearchableIndex::defaultSearchableIndex() };

    wait_for_spotlight_completion(|handler| unsafe {
        index.deleteAllSearchableItemsWithCompletionHandler(handler);
    })
}

#[napi]
pub fn is_indexing_available() -> bool {
    true
}
