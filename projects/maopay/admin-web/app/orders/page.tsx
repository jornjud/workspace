'use client';

import { useState } from 'react';

const MOCK_ORDERS = [
  { id: '001', customer: 'สมชาย', restaurant: 'ก๋วยเตี๋ยวลุงชาติ', driver: 'สมชาย มีน้ำใจ', status: 'completed', total: 120, date: '2026-02-23' },
  { id: '002', customer: 'สมศักดิ์', restaurant: 'ข้าวมันไก่ป้าสมศรี', driver: '-', status: 'pending', total: 85, date: '2026-02-23' },
  { id: '003', customer: 'สมหมาย', restaurant: 'น้ำปังเจ๊แป๋ม', driver: '-', status: 'preparing', total: 65, date: '2026-02-23' },
  { id: '004', customer: 'สมศรี', restaurant: 'ก๋วยเตี๋ยวไก่', driver: 'สมศักดิ์ รวยเงิน', status: 'on_the_way', total: 55, date: '2026-02-22' },
  { id: '005', customer: 'สมปอง', restaurant: 'ข้าวมันไก่', driver: 'สมชาย มีน้ำใจ', status: 'cancelled', total: 45, date: '2026-02-22' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: '#F7C548',
  preparing: '#FF6B35',
  on_the_way: '#2196F3',
  completed: '#4CAF50',
  cancelled: '#E74C3C',
};

export default function OrdersPage() {
  const [filter, setFilter] = useState('all');

  const filteredOrders = filter === 'all' 
    ? MOCK_ORDERS 
    : MOCK_ORDERS.filter(o => o.status === filter);

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Orders Management</h1>

      {/* Filters */}
      <div style={{ marginBottom: '20px' }}>
        {['all', 'pending', 'preparing', 'on_the_way', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: filter === status ? '#FF6B35' : '#fff',
              color: filter === status ? '#fff' : '#666',
              cursor: 'pointer',
            }}
          >
            {status === 'all' ? 'ทั้งหมด' : status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee' }}>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Restaurant</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Driver</th>
              <th style={{ textAlign: 'left', padding: '12px', color: '#666' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px', color: '#666' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>#{order.id}</td>
                <td style={{ padding: '12px' }}>{order.date}</td>
                <td style={{ padding: '12px' }}>{order.customer}</td>
                <td style={{ padding: '12px' }}>{order.restaurant}</td>
                <td style={{ padding: '12px' }}>{order.driver}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: STATUS_COLORS[order.status],
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
