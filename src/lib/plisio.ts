import crypto from 'crypto';

export async function createPlisioInvoice(order: { id: string, amount: number, currency: string }) {
  const apiKey = process.env.PLISIO_SECRET_KEY;
  if (!apiKey) {
    throw new Error('Plisio secret key is not configured');
  }

  // Create query string
  const params = new URLSearchParams({
    source_currency: order.currency,
    source_amount: order.amount.toString(),
    order_name: `Order #${order.id}`,
    order_number: order.id,
    api_key: apiKey
  });

  const response = await fetch(`https://api.plisio.net/api/v1/invoices/new?${params.toString()}`, {
    method: 'GET'
  });

  const resData = await response.json();

  if (resData.status !== 'success') {
    console.error('Plisio Error:', resData);
    throw new Error(resData.data?.message || 'Failed to create Plisio invoice');
  }

  return resData.data.invoice_url;
}

export function verifyPlisioSignature(body: Record<string, any>) {
  const apiKey = process.env.PLISIO_SECRET_KEY;
  if (!apiKey) return false;

  const verifyHash = body.verify_hash;
  if (!verifyHash) return false;

  // Plisio signature validation: Sort keys alphabetically, concat values, HMAC SHA1
  let stringToHash = '';
  const keys = Object.keys(body).sort();
  for (const key of keys) {
    if (key !== 'verify_hash') {
      stringToHash += body[key];
    }
  }

  const hash = crypto.createHmac('sha1', apiKey).update(stringToHash).digest('hex');
  return hash === verifyHash;
}
