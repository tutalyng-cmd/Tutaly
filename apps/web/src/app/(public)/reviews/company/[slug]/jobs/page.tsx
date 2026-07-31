import React from 'react';

export default function JobsPage() {
  return (
    <div className="container" style={{ padding: '64px 0 120px' }}>
      <div style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '16px' }}>Jobs Coming Soon</h2>
        <p style={{ color: 'var(--c-400)', maxWidth: '480px', margin: '0 auto' }}>
          We are working on integrating active job listings directly into company profiles. Check back later!
        </p>
      </div>
    </div>
  );
}
