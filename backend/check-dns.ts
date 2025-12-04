import * as dns from 'dns';

const host = 'aws-1-ap-southeast-1.pooler.supabase.com';

dns.resolve4(host, (err, addresses) => {
  if (err) console.error('IPv4 Error:', err);
  else console.log('IPv4:', addresses);
});

dns.resolve6(host, (err, addresses) => {
  if (err) console.log('IPv6: None (or error)');
  else console.log('IPv6:', addresses);
});
