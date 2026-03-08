'use client';

const MOCK_MERCHANTS = [
  { id: '1', name: 'ก๋วยเตี๋ยวลุงชาติ', address: 'ต.เขาค่าย อ.สะเดา', status: 'active', orders: 156 },
  { id: '2', name: 'ข้าวมันไก่ป้าสมศรี', address: 'ต.เขาค่าย อ.สะเดา', status: 'active', orders: 89 },
  { id: '3', name: 'น้ำปังเจ๊แป๋ม', address: 'ต.สะเดา อ.สะเดา', status: 'inactive', orders: 45 },
];

export default function MerchantsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Merchants Management</h1>

      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Restaurant Name</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Address</th>
              <th style={{ textAlign: 'center', padding: '12px', color: '#666' }}>Orders</th>
              <th style={{ textAlign: 'center', padding: '12px', color: '#666' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_MERCHANTS.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{m.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{m.name}</td>
                <td style={{ padding: '12px' }}>{m.address}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{m.orders}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: m.status === 'active' ? '#4CAF50' : '#E74C3C',
                    color: '#fff',
                  }}>
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
