import { ValidationError } from '../../../../shared/domain/exceptions/app.error.js';

export const validateGitHubRepositoryUrl = (value: string): string => {
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new ValidationError('Đường dẫn GitHub repository không hợp lệ.');
  }
  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'github.com' ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.search ||
    parsed.hash
  ) {
    throw new ValidationError('Chỉ chấp nhận URL HTTPS công khai từ github.com.');
  }
  if (!/^\/[A-Za-z0-9-]+\/[A-Za-z0-9._-]+(?:\.git)?$/.test(parsed.pathname)) {
    throw new ValidationError('URL phải có dạng https://github.com/{owner}/{repo}[.git].');
  }
  return parsed.toString();
};
