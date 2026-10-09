import { DEFAULT_ADMIN_SETTINGS, type AdminSettings } from '../types/admin.types';

let currentSettings: AdminSettings = { ...DEFAULT_ADMIN_SETTINGS };

export const adminSettingsService = {
  get: (): AdminSettings => ({ ...currentSettings }),

  async save(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    currentSettings = { ...currentSettings, ...patch };
    return { ...currentSettings };
  },
};
