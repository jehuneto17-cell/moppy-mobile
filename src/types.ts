export type OrderStatus = "draft" | "open" | "confirmed" | "in_progress" | "completed" | "disputed" | "cancelled";

export type Order = {
  order_id: string;
  client_id: string;
  cleaner_id: string | null;
  cleaner_name?: string;
  cleaner_rating?: number;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    postal_code: string;
    lat?: number;
    lng?: number;
  };
  service: {
    type: "standard" | "heavy" | "laundry";
    size: "studio" | "1q" | "2q" | "3q" | "4q+";
    extras: { id: string; count: number; unit_price: number }[];
  };
  scheduled_at: string;
  pricing: {
    base_price: number;
    extras_price: number;
    subtotal: number;
    urgency_fee: number;
    gross_total: number;
    net_total_client: number;
  };
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};
