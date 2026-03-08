export default function DashboardPage() {
  const stats = [
    { label: 'Total Orders', value: '1,234', icon: '📦', color: '#FF6B35' },
    { label: 'Active Users', value: '567', icon: '👥', color: '#2E4057' },
    { label: 'Merchants', value: '89', icon: '🏪', color: '#4CAF50' },
    { label: 'Drivers', value: '45', icon: '🚗', color: '#F7C548' },
  ];

  const recentOrders = [
    { id: '001', customer: 'สมชาย', restaurant: 'ก๋วยเตี๋ยวลุงชาติ', status: 'completed', total: 120 },
    { id: '002', customer: 'สมศักดิ์', restaurant: 'ข้าวมันไก่ป้าสมศรี', status: 'pending', total: 85 },
    { id: '003', customer: 'สมหมาย', restaurant: 'น้ำปังเจ๊แป๋ม', status: 'preparing', total: 65 },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Dashboard</h1>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {stats.map((stat, index) => (
          <div key={index} style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            <div style={{ color: '#666' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Recent Orders</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Restaurant</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px', color: '#666' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>#{order.id}</td>
                <td style={{ padding: '12px' }}>{order.customer}</td>
                <td style={{ padding: '12px' }}>{order.restaurant}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: order.status === 'completed' ? '#4CAF50' : order.status === 'pending' ? '#F7C548' : '#FF6B35',
                    color: '#fff',
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>฿{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
