import { AsyncLocalStorage } from 'async_hooks';

export interface TenantInfo {
  userId?: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantInfo>();
