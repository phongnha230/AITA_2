'use client';

import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../../../lib/errors';
import { adminUserService } from '../services/admin-user.service';
import type { AdminUser, PageMeta, UserQuery } from '../types/admin.types';

const DEFAULT_QUERY: UserQuery = { page: 1, limit: 8 };

export const useAdminUsers = () => {
  const [query, setQuery] = useState<UserQuery>(DEFAULT_QUERY);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const updateFilter = (patch: Partial<UserQuery>) => setQuery((q) => ({ ...q, ...patch, page: patch.page ?? 1 }));

  const replaceUser = (updated: AdminUser) => setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));

  return { query, users, meta, loading, error, reload: load, updateFilter, replaceUser };
};
