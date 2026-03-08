'use client';

const MOCK_DRIVERS = [
  { id: '1', name: 'สมชาย มีน้ำใจ', phone: '081 234 5678', vehicle: 'Honda PCX', status: 'active', orders: 45 },
  { id: '2', name: 'สมศักดิ์ รวยเงิน', phone: '081 234 5679', vehicle: 'Yamaha NMAX', status: 'active', orders: 38 },
  { id: '3', name: 'สมหมาย ขยัน', phone: '081 234 5680', vehicle: 'Honda Click', status: 'offline', orders: 22 },
];

export default function DriversPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Drivers Management</h1>

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
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Phone</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Vehicle</th>
              <th style={{ textAlign: 'center', padding: '12px', color: '#666' }}>Orders</th>
              <th style={{ textAlign: 'center', padding: '12px', color: '#666' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DRIVERS.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{d.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{d.name}</td>
                <td style={{ padding: '12px' }}>{d.phone}</td>
                <td style={{ padding: '12px' }}>{d.vehicle}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{d.orders}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: d.status === 'active' ? '#4CAF50' : '#999',
                    color: '#fff',
                  }}>
                    {d.status}
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
