/* eslint-env node */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const thuMucDuAn = path.resolve(__dirname, '..');
const thuMucTam = path.join(thuMucDuAn, '.cache', 'metro');
fs.mkdirSync(thuMucTam, { recursive: true });
const tienTrinh = spawn(
  process.execPath,
  [
    path.join(thuMucDuAn, 'node_modules', 'react-native', 'cli.js'),
    'start',
    '--max-workers',
    '2',
    ...process.argv.slice(2),
  ],
  {
    cwd: thuMucDuAn,
    stdio: 'inherit',
    env: { ...process.env, TEMP: thuMucTam, TMP: thuMucTam, TMPDIR: thuMucTam },
  },
);
tienTrinh.on('error', loi => {
  console.error(loi.message);
  process.exitCode = 1;
});
tienTrinh.on('exit', ma => {
  process.exitCode = ma || 0;
});
