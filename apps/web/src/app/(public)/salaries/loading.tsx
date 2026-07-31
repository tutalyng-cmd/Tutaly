import React from 'react';

export default function SalariesLoading() {
  return (
    <div className="page-shell">
      {/* ── HEADER SKELETON ───────────────────────────────────────── */}
      <header className="page-header" style={{ padding: '64px 0 48px' }}>
        <div className="container">
          <div style={{
            height: '14px', width: '120px', background: 'var(--c-700)',
            borderRadius: 'var(--r-pill)', marginBottom: '16px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
          <div style={{
            height: '48px', width: '60%', maxWidth: '400px', background: 'var(--c-700)',
            borderRadius: 'var(--r-md)', marginBottom: '16px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
          <div style={{
            height: '24px', width: '40%', maxWidth: '300px', background: 'var(--c-700)',
            borderRadius: 'var(--r-sm)', marginBottom: '32px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
            <div style={{
              height: '52px', flex: 1, maxWidth: '600px', background: 'var(--c-800)',
              borderRadius: 'var(--r-pill)', border: '1px solid var(--c-700)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
            <div style={{
              height: '52px', width: '160px', background: 'var(--c-800)',
              borderRadius: 'var(--r-pill)', border: '1px solid var(--c-700)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT SKELETON ─────────────────────────────────── */}
      <div className="container" style={{ padding: '32px 0 80px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{
            height: '24px', width: '200px', background: 'var(--c-800)',
            borderRadius: 'var(--r-sm)', marginBottom: '20px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} style={{
                height: '76px', background: 'var(--c-800)',
                border: '1px solid var(--c-700)', borderRadius: 'var(--r-lg)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
