import { supabase } from './supabase';
import { PayPalProduct } from '../types/payment';

export const loadPayPalScript = (clientId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.getElementById('paypal-sdk')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.body.appendChild(script);
  });
};

export const createPurchaseRecord = async (
  userId: string,
  product: PayPalProduct
): Promise<string> => {
  const { data, error } = await supabase
    .from('purchases')
    .insert({
      user_id: userId,
      purchase_type: product.type,
      amount: product.price,
      quantity: product.quantity,
      status: 'pending'
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};

export const updatePurchaseStatus = async (
  purchaseId: string,
  status: 'completed' | 'failed',
  paypalOrderId?: string,
  paypalTransactionId?: string
) => {
  const updates: any = {
    status,
    completed_at: status === 'completed' ? new Date().toISOString() : null
  };

  if (paypalOrderId) updates.paypal_order_id = paypalOrderId;
  if (paypalTransactionId) updates.paypal_transaction_id = paypalTransactionId;

  const { error } = await supabase
    .from('purchases')
    .update(updates)
    .eq('id', purchaseId);

  if (error) throw error;
};

export const addStarCredits = async (userId: string, credits: number) => {
  const { data: existing } = await supabase
    .from('user_credits')
    .select('star_credits')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('user_credits')
      .update({ star_credits: existing.star_credits + credits })
      .eq('user_id', userId);

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_credits')
      .insert({ user_id: userId, star_credits: credits });

    if (error) throw error;
  }
};

export const getUserCredits = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('user_credits')
    .select('star_credits')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.star_credits || 0;
};

export const deductStarCredit = async (userId: string): Promise<boolean> => {
  const { data: existing } = await supabase
    .from('user_credits')
    .select('star_credits')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing || existing.star_credits < 1) {
    return false;
  }

  const { error } = await supabase
    .from('user_credits')
    .update({ star_credits: existing.star_credits - 1 })
    .eq('user_id', userId);

  if (error) throw error;
  return true;
};
