import { chromium } from 'playwright';

const server = await chromium.launchServer({
  headless: true,
  host: '0.0.0.0',
  port: 3000,
  proxy: { server: 'http://aita-browser-egress:3128' },
  // Docker provides the outer isolation boundary. The official Playwright image
  // runs as pwuser; Chromium user namespaces are disabled by some Docker hosts.
  chromiumSandbox: false,
  args: ['--disable-dev-shm-usage'],
});

console.log(`PLAYWRIGHT_WS_ENDPOINT=${server.wsEndpoint()}`);

const stop = async () => {
  try {
    await server.close();
    process.exit(0);
  } catch (error) {
    console.error('PLAYWRIGHT_SERVER_SHUTDOWN_FAILED', error);
    process.exit(1);
  }
};

process.once('SIGTERM', () => void stop());
process.once('SIGINT', () => void stop());
