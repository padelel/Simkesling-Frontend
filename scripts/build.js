// Patch Node fs with graceful-fs to mitigate EMFILE on Windows
const gfs = require('graceful-fs');
gfs.gracefulify(require('fs'));
// Also patch fs.promises so modules using fs/promises benefit from graceful-fs
try {
  require('fs').promises = gfs.promises;
} catch (_) {}

// Reduce libuv FS concurrency to avoid too many simultaneous file opens
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '2';

const build = require('next/dist/build').default;

build(process.cwd())
  .then(() => {
    console.log('Next build completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Next build failed:', err);
    process.exit(1);
  });