import { create } from "zustand";

import type { Address } from "@/src/hooks/useAddresses";

type ServiceType = "standard" | "heavy" | "laundry";
type Size = "studio" | "1q" | "2q" | "3q" | "4q+";
type UrgencyTier = "normal" | "baixa" | "alta";

type CreateOrderState = {
  address: Address | null;
  serviceType: ServiceType | null;
  size: Size | null;
  addonIds: string[];
  scheduledDate: string | null;
  scheduledTime: string | null;
  urgencyTier: UrgencyTier;
  cardId: string | null;

  setAddress: (a: Address) => void;
  setServiceType: (t: ServiceType) => void;
  setSize: (s: Size) => void;
  toggleAddon: (id: string) => void;
  setSchedule: (date: string, time: string) => void;
  setUrgencyTier: (t: UrgencyTier) => void;
  setCardId: (id: string) => void;
  reset: () => void;
};

const initialState = {
  address: null,
  serviceType: null,
  size: null,
  addonIds: [] as string[],
  scheduledDate: null,
  scheduledTime: null,
  urgencyTier: "normal" as UrgencyTier,
  cardId: null,
};

export const useCreateOrderStore = create<CreateOrderState>((set) => ({
  ...initialState,
  setAddress: (address) => set({ address }),
  setServiceType: (serviceType) => set({ serviceType }),
  setSize: (size) => set({ size }),
  toggleAddon: (id) =>
    set((s) => ({
      addonIds: s.addonIds.includes(id) ? s.addonIds.filter((x) => x !== id) : [...s.addonIds, id],
    })),
  setSchedule: (scheduledDate, scheduledTime) => set({ scheduledDate, scheduledTime }),
  setUrgencyTier: (urgencyTier) => set({ urgencyTier }),
  setCardId: (cardId) => set({ cardId }),
  reset: () => set(initialState),
}));
