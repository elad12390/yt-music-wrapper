import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const SCRIPTS_DIR = path.resolve(__dirname, '..', '..', 'scripts');
const INSTALL_SCRIPT = path.join(SCRIPTS_DIR, 'install.sh');

export class InstallerHelpers {
  parseMountPointRaw(hdiutilOutput: string): string {
    const pipeline = this.extractMountParseCommand();
    try {
      const result = execSync(
        `printf '%s' ${this.shellEscape(hdiutilOutput)} | ${pipeline}`,
        { encoding: 'utf-8', shell: '/bin/bash' },
      );
      return result.replace(/\n$/, '');
    } catch {
      return '';
    }
  }

  parseMountPoint(hdiutilOutput: string): string {
    return this.parseMountPointRaw(hdiutilOutput).trim();
  }

  private extractMountParseCommand(): string {
    const scriptContent = fs.readFileSync(INSTALL_SCRIPT, 'utf-8');

    const mountLine = scriptContent
      .split('\n')
      .find((line: string) => line.includes('MOUNT_POINT='));

    if (!mountLine) {
      throw new Error('Could not find MOUNT_POINT= line in install.sh');
    }

    const pipelineMatch = mountLine.match(/\|\s*(.+?)\)$/);
    if (!pipelineMatch) {
      throw new Error(
        `Could not extract pipeline from MOUNT_POINT line: ${mountLine}`,
      );
    }

    return pipelineMatch[1].trim();
  }

  buildAppSourcePath(mountPoint: string, appName: string): string {
    return `${mountPoint}/${appName}.app`;
  }

  validateMountPoint(mountPoint: string): string | null {
    if (!mountPoint || mountPoint.trim() === '') {
      return 'Failed to mount DMG — could not determine mount point';
    }
    if (!mountPoint.startsWith('/Volumes/')) {
      return `Invalid mount point: ${mountPoint}`;
    }
    return null;
  }

  private shellEscape(s: string): string {
    return (
      "$'" +
      s
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\t/g, '\\t')
        .replace(/\n/g, '\\n') +
      "'"
    );
  }
}
