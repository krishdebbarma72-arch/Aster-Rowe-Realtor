// Temporary, ignored verification fixture. No production data or routes change.
import { createServer } from "node:http";

const source = await (await fetch("http://localhost:3000/")).text();
const htmlTag = source.match(/<html[^>]*>/)[0];
const head = source.match(/<head>[\s\S]*?<\/head>/)[0]
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
  .replace(/<link\b[^>]*as="script"[^>]*>/g, "")
  .replace("<head>", '<head><base href="http://localhost:3000/">');
const section = source.match(/<section class="neighbourhoods-section"[\s\S]*?<\/section>/)[0]
  .replace('class="neighbourhood-name">Dulwich', 'class="neighbourhood-name">A deliberately long neighbourhood name for layout verification')
  .replace('class="neighbourhood-count">1 property', 'class="neighbourhood-count">2 properties');
const fixture = `<!DOCTYPE html>${htmlTag}${head}<body><main>${section}</main></body></html>`;
createServer((request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(fixture);
}).listen(3001, "127.0.0.1", () => console.log(`Layout fixture at http://localhost:3001/ — process ${process.pid}`));
