import dns from 'node:dns/promises';
import net from 'node:net';
import http from 'node:http';

const PORT = 3128;
const CONNECT_TIMEOUT_MS = 5_000;
const MAX_TUNNELS = 32;

const isPublicIpv4 = (address) => {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return false;
  const [a, b, c] = octets;
  return !(
    a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 168 || (b === 0 && c === 0) || (b === 0 && c === 2) || (b === 88 && c === 99)))
    || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
    || (a === 203 && b === 0 && c === 113)
  );
};

const isPublicAddress = (address) => {
  const version = net.isIP(address);
  if (version === 4) return isPublicIpv4(address);
  if (version !== 6) return false;
  const normalized = address.toLowerCase();
  return /^[23][0-9a-f]{3}:/.test(normalized) && !normalized.startsWith('2001:db8:');
};

const rejectTunnel = (client, status, reason) => {
  if (!client.destroyed) {
    client.end(`HTTP/1.1 ${status} ${reason}\r\nConnection: close\r\n\r\n`);
  }
};

const resolvePublicAddress = async (hostname) => {
  if (net.isIP(hostname)) throw new Error('IP literals are not allowed through the browser egress proxy.');
  const records = await dns.lookup(hostname, { all: true, verbatim: true });
  if (records.length === 0 || records.some(({ address }) => !isPublicAddress(address))) {
    throw new Error('Host must resolve exclusively to globally routable addresses.');
  }
  return records[0].address;
};

const server = http.createServer((_request, response) => {
  response.writeHead(405, { connection: 'close' });
  response.end('Only HTTPS CONNECT is supported.');
});

server.on('connect', async (request, client, head) => {
  let remote;
  let countedTunnel = false;
  try {
    if (server.currentTunnels >= MAX_TUNNELS) throw new Error('Browser egress proxy is at capacity.');
    const target = new URL(`https://${request.url}`);
    if ((target.port || '443') !== '443' || target.username || target.password || target.pathname !== '/') {
      throw new Error('Only HTTPS connections on port 443 are allowed.');
    }
    const pinnedAddress = await resolvePublicAddress(target.hostname);
    remote = net.connect({ host: pinnedAddress, port: 443 });
    remote.setTimeout(CONNECT_TIMEOUT_MS, () => remote.destroy(new Error('Upstream connect timed out.')));
    remote.once('connect', () => {
      server.currentTunnels += 1;
      countedTunnel = true;
      remote.setTimeout(0);
      client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      if (head.length > 0) remote.write(head);
      client.pipe(remote);
      remote.pipe(client);
    });
    remote.once('error', () => rejectTunnel(client, 502, 'Bad Gateway'));
    remote.once('close', () => {
      if (countedTunnel) server.currentTunnels = Math.max(0, server.currentTunnels - 1);
      client.destroy();
    });
    client.once('error', () => remote?.destroy());
    client.once('close', () => remote?.destroy());
  } catch {
    remote?.destroy();
    rejectTunnel(client, 403, 'Forbidden');
  }
});

server.currentTunnels = 0;
server.maxConnections = MAX_TUNNELS;
server.headersTimeout = 5_000;
server.requestTimeout = 10_000;
server.listen(PORT, '0.0.0.0');

const stop = () => server.close((error) => {
  if (error) {
    console.error('BROWSER_EGRESS_PROXY_SHUTDOWN_FAILED', error);
    process.exitCode = 1;
  }
});
process.once('SIGTERM', stop);
process.once('SIGINT', stop);
