'use client';

const MOCK_USERS = [
  { id: '1', name: 'สมชาย', phone: '081 234 5678', role: 'customer', joined: '2026-01-15' },
  { id: '2', name: 'สมศักดิ์', phone: '081 234 5679', role: 'customer', joined: '2026-01-20' },
  { id: '3', name: 'สมหมาย', phone: '081 234 5680', role: 'driver', joined: '2026-01-10' },
  { id: '4', name: 'ลุงชาติ', phone: '081 234 5681', role: 'merchant', joined: '2025-12-01' },
];

export default function UsersPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Users Management</h1>

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
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_USERS.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{user.id}</td>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{user.phone}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: user.role === 'customer' ? '#2196F3' : user.role === 'driver' ? '#4CAF50' : '#FF6B35',
                    color: '#fff',
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{user.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
