import dns from 'node:dns/promises';
import net from 'node:net';
import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

const isPrivateIpv4 = (address: string): boolean => {
  const octets = address.split('.').map(Number);
  if (octets.length !== 4 || octets.some((part) => !Number.isInteger(part))) return true;
  const [a, b] = octets;
  return a === 0
    || a === 10
    || a === 127
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || a >= 224;
};

export const isPrivateNetworkAddress = (address: string): boolean => {
  const version = net.isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version !== 6) return true;

  const normalized = address.toLowerCase();
  if (normalized === '::' || normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe8')
    || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
    return true;
  }
  const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return mappedIpv4 ? isPrivateIpv4(mappedIpv4) : false;
};

export const parseDeploymentUrl = (value: string): URL => {
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch (error) {
    throw new ValidationError('URL deploy không hợp lệ.', {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  if (
    parsed.protocol !== 'https:'
    || parsed.username
    || parsed.password
    || (parsed.port && parsed.port !== '443')
    || parsed.hostname === 'localhost'
    || parsed.hostname.endsWith('.localhost')
  ) {
    throw new ValidationError('URL deploy phải là HTTPS công khai và không chứa credentials hoặc port tùy chỉnh.');
  }
  if (net.isIP(parsed.hostname) && isPrivateNetworkAddress(parsed.hostname)) {
    throw new ValidationError('URL deploy không được trỏ tới địa chỉ mạng nội bộ.');
  }
  return parsed;
};

export const validatePublicDeploymentUrl = async (value: string): Promise<string> => {
  const parsed = parseDeploymentUrl(value);
  try {
    const addresses = await dns.lookup(parsed.hostname, { all: true, verbatim: true });
    if (addresses.length === 0 || addresses.some(({ address }) => isPrivateNetworkAddress(address))) {
      throw new ValidationError('URL deploy phải phân giải tới địa chỉ IP công khai.');
    }
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Không thể xác minh hostname của URL deploy.', {
      cause: error instanceof Error ? error.message : String(error),
    });
  }
  return parsed.toString();
};
