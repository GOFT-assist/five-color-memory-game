import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const host = process.env.HOST || '127.0.0.1';
const port = Number.parseInt(process.env.PORT || '4173', 10);
const root = process.cwd();

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function resolvePath(url) {
  const pathname = new URL(url, `http://${host}:${port}`).pathname;
  const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(root, safePath === '/' ? 'index.html' : safePath);
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    return join(filePath, 'index.html');
  }
  return filePath;
}

createServer((req, res) => {
  const filePath = resolvePath(req.url || '/');
  if (!existsSync(filePath)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  res.writeHead(200, {
    'content-type': types.get(extname(filePath)) || 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
}).listen(port, host, () => {
  console.log(`Five Color Memory Game running at http://${host}:${port}`);
});
