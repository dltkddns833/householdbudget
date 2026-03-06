const store = new Map<string, string>();

export class MMKV {
  set(key: string, value: string | number | boolean) {
    store.set(key, String(value));
  }
  getString(key: string): string | undefined {
    return store.get(key);
  }
  getNumber(key: string): number | undefined {
    const v = store.get(key);
    return v !== undefined ? Number(v) : undefined;
  }
  getBoolean(key: string): boolean | undefined {
    const v = store.get(key);
    return v !== undefined ? v === 'true' : undefined;
  }
  delete(key: string) {
    store.delete(key);
  }
  contains(key: string): boolean {
    return store.has(key);
  }
}
