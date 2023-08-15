import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import superjson from 'superjson';
import z from 'zod';

const walletSchema = z.object({
  address: z.string(),
  connectorType: z.string(),
});

export const defaultWalletValue = {
  address: '',
  connectorType: '',
};

export const walletAtom = atomWithStorage('wallet', defaultWalletValue, {
  getItem(key, initialValue) {
    const storedValue = localStorage.getItem(key);
    try {
      return walletSchema.parse(superjson.parse(storedValue ?? ''));
    } catch {
      return initialValue;
    }
  },
  setItem(key, value) {
    localStorage.setItem(key, superjson.stringify(value));
  },
  removeItem(key) {
    localStorage.removeItem(key);
  },
  subscribe(key, callback, initialValue) {
    if (
      typeof window === 'undefined' ||
      typeof window.addEventListener === 'undefined'
    ) {
      return () => {};
    }
    const subscriber = (e: StorageEvent) => {
      if (e.storageArea === localStorage && e.key === key) {
        let newValue;
        try {
          newValue = walletSchema.parse(JSON.parse(e.newValue ?? ''));
        } catch {
          newValue = initialValue;
        }
        callback(newValue);
      }
    };
    window.addEventListener('storage', subscriber);
    return () => {
      window.removeEventListener('storage', subscriber);
    };
  },
});

export const connectedAtom = atom((get) => !!get(walletAtom).address);
