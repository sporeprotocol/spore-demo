import { atom } from 'jotai';

type Modal = {
  open(): void;
  close(): void;
};

export const modalStackAtom = atom<Modal[]>([]);
