import { loadSettings, mockDelay, saveSettings } from '../mocks/mock-db';
import type { AdminSettings } from '../types/admin.types';

/** Router / Sandbox / worker settings. No backend endpoint yet, so these persist in localStorage only. */
export const adminSettingsService = {
  get: (): AdminSettings => loadSettings(),

  async save(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    await mockDelay(200);
    return saveSettings(patch);
  },
};
