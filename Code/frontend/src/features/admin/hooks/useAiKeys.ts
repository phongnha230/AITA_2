'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../../lib/errors';
import { adminAiKeyService } from '../services/admin-ai-key.service';
import type { AiApiKey } from '../types/admin.types';

export const useAiKeys = () => {
  const [keys, setKeys] = useState<AiApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setKeys(await adminAiKeyService.list());
    } catch (e) {
      setError(getErrorMessage(e, 'Không tải được kho khóa API.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    await adminAiKeyService.remove(id);
    setKeys((list) => list.filter((k) => k.id !== id));
  };

  const setActive = async (id: string, isActive: boolean) => {
    await adminAiKeyService.setActive(id, isActive);
    setKeys((list) => list.map((k) => (k.id === id ? { ...k, isActive } : k)));
  };

  return { keys, loading, error, reload: load, remove, setActive };
};
