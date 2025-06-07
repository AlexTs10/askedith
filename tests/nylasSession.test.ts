import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ensureNylasSession } from '../client/src/lib/nylasSession';

class LocalStorageMock {
  store: Record<string,string> = {};
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = value; }
  clear() { this.store = {}; }
}

const localStorage = new LocalStorageMock();
(global as any).localStorage = localStorage;

function createFetchMock(responses: Record<string, any>) {
  return async (url: string, options?: any) => {
    const key = Object.keys(responses).find(k => url.endsWith(k));
    if (!key) throw new Error('Unexpected fetch ' + url);
    const handler = responses[key];
    const result = typeof handler === 'function' ? handler(options) : handler;
    return { json: async () => result, ok: true } as any;
  };
}

test('restores session from server when localStorage empty', async () => {
  localStorage.clear();
  let calledSet = false;
  (global as any).fetch = createFetchMock({
    '/api/nylas/grant-id': { grantId: 'abc' },
    '/api/nylas/connection-status': { connected: false },
    '/api/nylas/set-grant-id': () => { calledSet = true; return {}; }
  });

  await ensureNylasSession();
  assert.equal(localStorage.getItem('nylas_grant_id'), 'abc');
  assert.ok(calledSet);
});

test('skips restore when session already active', async () => {
  localStorage.clear();
  localStorage.setItem('nylas_grant_id', 'stored');
  let calledSet = false;
  (global as any).fetch = createFetchMock({
    '/api/nylas/connection-status': { connected: true },
    '/api/nylas/set-grant-id': () => { calledSet = true; return {}; }
  });

  await ensureNylasSession();
  assert.equal(localStorage.getItem('nylas_grant_id'), 'stored');
  assert.ok(!calledSet);
});
