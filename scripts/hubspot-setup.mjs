// One-time setup: creates the "HoloDock" contact property group and the custom
// properties the site writes to. Safe to run more than once.
//   HUBSPOT_ACCESS_TOKEN=pat-… npm run hubspot:setup
const token = process.env.HUBSPOT_ACCESS_TOKEN;
if (!token) {
  console.error('Set HUBSPOT_ACCESS_TOKEN first.');
  process.exit(1);
}

const API = 'https://api.hubapi.com/crm/v3/properties/contacts';
const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const GROUP = { name: 'holodock', label: 'HoloDock', displayOrder: -1 };
const PROPS = [
  ['persona', 'HoloDock: what brings them here'],
  ['phone_platform', 'HoloDock: phone platform'],
  ['wants_reservation', 'HoloDock: wants to reserve'],
  ['units', 'HoloDock: units'],
  ['edition', 'HoloDock: edition'],
  ['use_case', 'HoloDock: use case'],
  ['deposit_status', 'HoloDock: deposit status'],
  ['source', 'HoloDock: sign-up source'],
  ['order_type', 'HoloDock: order type (deposit or full)'],
];

async function call(url, body) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (res.ok) return 'created';
  if (res.status === 409) return 'exists';
  throw new Error(`${res.status} ${await res.text()}`);
}

console.log('group holodock:', await call(`${API}/groups`, GROUP));
for (const [name, label] of PROPS) {
  const result = await call(API, {
    name: `holodock_${name}`,
    label,
    groupName: 'holodock',
    type: 'string',
    fieldType: name === 'use_case' ? 'textarea' : 'text',
  });
  console.log(`holodock_${name}:`, result);
}
