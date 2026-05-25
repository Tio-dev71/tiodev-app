import crypto from 'crypto';

export async function createCryptomusInvoice(order: { id: string, amount: number, currency: string }) {
  const merchantId = process.env.CRYPTOMUS_MERCHANT_ID;
  const paymentKey = process.env.CRYPTOMUS_PAYMENT_KEY;

  if (!merchantId || !paymentKey) {
    throw new Error('Cryptomus credentials are not configured');
  }

  const payload = {
    amount: order.amount.toString(),
    currency: order.currency,
    order_id: order.id,
    url_callback: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/crypto`,
    url_return: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${order.id}`,
    is_payment_multiple: true,
    lifetime: '3600',
  };

  const dataString = JSON.stringify(payload);
  const base64Data = Buffer.from(dataString).toString('base64');
  const sign = crypto.createHash('md5').update(base64Data + paymentKey).digest('hex');

  const response = await fetch('https://api.cryptomus.com/v1/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'merchant': merchantId,
      'sign': sign
    },
    body: dataString
  });

  const resData = await response.json();
  if (!resData.result || !resData.result.url) {
    console.error('Cryptomus Error:', resData);
    throw new Error(resData.message || 'Failed to create Cryptomus invoice');
  }

  return resData.result.url;
}

export function verifyCryptomusSignature(bodyText: string, signature: string) {
  const paymentKey = process.env.CRYPTOMUS_PAYMENT_KEY;
  if (!paymentKey) return false;

  let data;
  try {
    data = JSON.parse(bodyText);
  } catch (e) {
    return false;
  }

  // Remove the 'sign' key if present before stringifying, but usually webhook body doesn't include 'sign' in payload.
  if (data.sign) {
    delete data.sign;
  }

  const cleanBody = JSON.stringify(data).replace(/\//g, '\\/'); // cryptomus sometimes expects escaped slashes
  const cleanBase64 = Buffer.from(cleanBody).toString('base64');
  const hash = crypto.createHash('md5').update(cleanBase64 + paymentKey).digest('hex');

  const directBase64 = Buffer.from(bodyText).toString('base64');
  const directHash = crypto.createHash('md5').update(directBase64 + paymentKey).digest('hex');

  return signature === hash || signature === directHash;
}
