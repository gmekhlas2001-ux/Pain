export interface UserCredits {
  user_id: string;
  star_credits: number;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  purchase_type: 'star_credits' | 'music';
  amount: number;
  quantity: number;
  paypal_order_id: string | null;
  paypal_transaction_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  completed_at: string | null;
}

export interface SkyMusic {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  duration: number | null;
  file_size: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayPalProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  type: 'star_credits' | 'music';
  quantity: number;
}

export const PRODUCTS: Record<string, PayPalProduct> = {
  STAR_CREDITS: {
    id: 'star_credits_3',
    name: '3 Star Credits',
    description: 'Purchase 3 star creation credits',
    price: 5.00,
    currency: 'EUR',
    type: 'star_credits',
    quantity: 3
  },
  SKY_MUSIC: {
    id: 'sky_music_1',
    name: 'Sky Music Upload',
    description: 'Upload custom music to your sky',
    price: 5.00,
    currency: 'EUR',
    type: 'music',
    quantity: 1
  }
};
