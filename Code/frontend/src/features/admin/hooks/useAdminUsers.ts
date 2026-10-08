'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../../lib/errors';
import { adminUserService } from '../services/admin-user.service';
import type { AdminUser, PageMeta, UserQuery, UserStats } from '../types/admin.types';

const DEFAULT_QUERY: UserQuery = { page: 1, limit: 6 };

export const useAdminUsers = () => {
  const [query, setQuery] = useState<UserQuery>(DEFAULT_QUERY);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setStats(await adminUserService.stats());
    } catch {
      // KPI row is decorative; the table surfaces real errors.
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminUserService.list(query);
      setUsers(result.users);
      setMeta(result.meta);
    } catch (e) {
      setError(getErrorMessage(e, 'Không tải được danh sách người dùng.'));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const updateFilter = useCallback(
    (patch: Partial<UserQuery>) => setQuery((q) => ({ ...q, ...patch, page: patch.page ?? 1 })),
    [],
  );

  const replaceUser = (updated: AdminUser) => {
    setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
    void loadStats();
  };

  const reloadAll = useCallback(async () => {
    await Promise.all([load(), loadStats()]);
  }, [load, loadStats]);

  return { query, users, meta, stats, loading, error, reload: reloadAll, updateFilter, replaceUser };
};
