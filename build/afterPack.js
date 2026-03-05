const fs = require('fs');
const path = require('path');

exports.default = async function (context) {
  const appName = context.packager.appInfo.productFilename;
  const frameworkResources = path.join(
    context.appOutDir,
    `${appName}.app`,
    'Contents/Frameworks/Electron Framework.framework/Versions/A/Resources'
  );

  if (!fs.existsSync(frameworkResources)) return;

  const keep = new Set(['en.lproj', 'en_US.lproj']);
  let removed = 0;

  for (const entry of fs.readdirSync(frameworkResources)) {
    if (entry.endsWith('.lproj') && !keep.has(entry)) {
      fs.rmSync(path.join(frameworkResources, entry), { recursive: true });
      removed++;
    }
  }

  console.log(`  • stripped ${removed} unused locale dirs`);
};
