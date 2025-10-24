const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling', req.url, err);
        res.statusCode = 500;
        res.end('internal server error');
      }
    });

    const port = process.env.PORT || 3000;
    server.listen(port, (err) => {
      if (err) {
        console.error('Server listen error', err);
        process.exit(1);
      }
      console.log(`> Server listening on port ${port} (env=${process.env.NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error('Next app.prepare() failed', err);
    process.exit(1);
  });

