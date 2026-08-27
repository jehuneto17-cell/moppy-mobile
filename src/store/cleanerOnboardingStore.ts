import { create } from "zustand";

type DocKey = "id_document" | "cpf_document" | "selfie" | "address_proof";

type CleanerOnboardingState = {
  documents: Partial<Record<DocKey, { storage_url: string }>>;
  cpfNumber: string;
  setDocument: (key: DocKey, storageUrl: string) => void;
  setCpfNumber: (v: string) => void;
  reset: () => void;
};

export const useCleanerOnboardingStore = create<CleanerOnboardingState>((set) => ({
  documents: {},
  cpfNumber: "",
  setDocument: (key, storage_url) => set((s) => ({ documents: { ...s.documents, [key]: { storage_url } } })),
  setCpfNumber: (cpfNumber) => set({ cpfNumber }),
  reset: () => set({ documents: {}, cpfNumber: "" }),
}));
