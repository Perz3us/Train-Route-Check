import * as tls from 'tls';
import * as dns from 'dns';

const host = 'aws-1-ap-southeast-1.pooler.supabase.com';
const port = 5432;

async function checkDNS() {
  console.log(`Resolving DNS for ${host}...`);
  try {
    const addresses = await dns.promises.resolve(host);
    console.log('IPv4 Addresses:', addresses);
    
    try {
        const ipv6 = await dns.promises.resolve6(host);
        console.log('IPv6 Addresses:', ipv6);
    } catch (e) {
        console.log('No IPv6 addresses found or error resolving IPv6');
    }
  } catch (err) {
    console.error('DNS Resolution failed:', err);
  }
}

function checkSSL() {
  console.log(`\nTesting SSL/TLS connection to ${host}:${port}...`);
  const socket = tls.connect(port, host, { rejectUnauthorized: false }, () => {
    console.log('✅ SSL Connection established!');
    console.log('Authorized:', socket.authorized);
    if (!socket.authorized) {
        console.log('Authorization Error:', socket.authorizationError);
    }
    socket.end();
  });

  socket.on('error', (err) => {
    console.error('❌ SSL Connection failed:', err);
  });

  socket.on('timeout', () => {
    console.error('❌ SSL Connection timed out');
    socket.destroy();
  });

  socket.setTimeout(5000);
}

async function main() {
    await checkDNS();
    checkSSL();
}

main();
