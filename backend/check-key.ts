
import * as dotenv from 'dotenv';

dotenv.config();

function checkKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
    return;
  }

  try {
    const payloadPart = key.split('.')[1];
    if (!payloadPart) {
      console.error('Invalid key format (not a JWT)');
      return;
    }

    const payloadStr = Buffer.from(payloadPart, 'base64').toString('utf-8');
    const payload = JSON.parse(payloadStr);

    console.log('Key Role:', payload.role);
    if (payload.role === 'service_role') {
      console.log('✅ Key is a valid Service Role Key.');
    } else {
      console.error('❌ Key is NOT a Service Role Key. It looks like an:', payload.role, 'key.');
    }
  } catch (e) {
    console.error('Error decoding key:', e.message);
  }
}

checkKey();
