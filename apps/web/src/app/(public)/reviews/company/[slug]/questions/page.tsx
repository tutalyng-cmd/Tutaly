import React from 'react';

export default function QuestionsPage() {
  return (
    <div className="container" style={{ padding: '64px 0 120px' }}>
      <div style={{ background: 'var(--c-800)', border: '1px solid var(--c-700)', borderRadius: 'var(--r-xl)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--c-100)', marginBottom: '16px' }}>Q&A Coming Soon</h2>
        <p style={{ color: 'var(--c-400)', maxWidth: '480px', margin: '0 auto' }}>
          Have questions about the interview process or daily life here? The Q&A feature is launching soon.
        </p>
      </div>
    </div>
  );
}
