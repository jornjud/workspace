'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    appName: 'Maopay',
    commission: '15',
    deliveryFee: '15',
    minOrder: '40',
    maxDistance: '10',
  });

  return (
    <div>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Settings</h1>

      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '600px',
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#2E4057' }}>General Settings</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>App Name</label>
          <input
            type="text"
            value={settings.appName}
            onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>Commission Rate (%)</label>
          <input
            type="number"
            value={settings.commission}
            onChange={(e) => setSettings({ ...settings, commission: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>Delivery Fee (฿)</label>
          <input
            type="number"
            value={settings.deliveryFee}
            onChange={(e) => setSettings({ ...settings, deliveryFee: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>Minimum Order (฿)</label>
          <input
            type="number"
            value={settings.minOrder}
            onChange={(e) => setSettings({ ...settings, minOrder: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#666' }}>Max Delivery Distance (km)</label>
          <input
            type="number"
            value={settings.maxDistance}
            onChange={(e) => setSettings({ ...settings, maxDistance: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
            }}
          />
        </div>

        <button
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#FF6B35',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
