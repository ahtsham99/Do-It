// Runs after `expo export --platform web`: stamps the service worker with a
// unique build id so every deploy invalidates the old offline cache.
const fs = require('fs');
const path = require('path');

const sw = path.join(__dirname, '..', 'dist', 'sw.js');
if (fs.existsSync(sw)) {
  const id = process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF || Date.now().toString(36);
  fs.writeFileSync(sw, fs.readFileSync(sw, 'utf8').replace('__BUILD_ID__', id.slice(0, 12)));
  console.log('[postexport] service worker stamped', id.slice(0, 12));
}
