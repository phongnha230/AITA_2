import { describe, expect, it } from 'vitest';
import { validateGitHubRepositoryUrl } from '../../src/modules/submission/infrastructure/storage/git-ingestion.service.js';
import { ValidationError } from '../../src/shared/domain/exceptions/app.error.js';

describe('validateGitHubRepositoryUrl', () => {
  it.each([
    'https://github.com/openai/example',
    'https://github.com/openai/example.git',
    'https://github.com/org-name/repo_name.java',
  ])('accepts a canonical public GitHub URL: %s', (url) => {
    expect(validateGitHubRepositoryUrl(url)).toBe(url);
  });

  it.each([
    'http://github.com/openai/example',
    'https://gitlab.com/openai/example',
    'https://127.0.0.1/openai/example',
    'https://[::1]/openai/example',
    'https://user:secret@github.com/openai/example',
    'https://github.com:8443/openai/example',
    'https://github.com/openai/example?ref=main',
    'https://github.com/openai/example#readme',
    'https://github.com/openai/example/issues',
    'git@github.com:openai/example.git',
  ])('rejects non-canonical or unsafe repository URL: %s', (url) => {
    expect(() => validateGitHubRepositoryUrl(url)).toThrow(ValidationError);
  });
});
