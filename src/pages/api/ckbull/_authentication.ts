import * as crypto from 'crypto';

const apiSecret = process.env.CKBULL_API_SECRET!;
const apiKey = process.env.CKBULL_API_KEY!;

export function getAuthentication() {
  const timestamp = Math.floor(Date.now() / 1000);

  const hmac = crypto.createHmac('sha512', apiSecret);
  hmac.update(timestamp.toString());

  return {
    'content-type': 'application/json',
    'x-timestamp': timestamp,
    'x-signature': hmac.digest('base64'),
    'x-api-key': apiKey,
  };
}
