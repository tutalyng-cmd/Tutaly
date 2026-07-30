import React from 'react';

export function ReviewFilterBar() {
  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
      <input 
        type="text" 
        className="input" 
        placeholder="Search reviews..." 
        style={{ flex: 1, minWidth: '200px' }} 
      />
      <select className="input" style={{ width: 'auto', minWidth: '150px' }}>
        <option>All locations</option>
        <option>Lagos</option>
        <option>Abuja</option>
      </select>
      <select className="input" style={{ width: 'auto', minWidth: '150px' }}>
        <option>All job titles</option>
        <option>Software Engineer</option>
        <option>Product Manager</option>
      </select>
      <select className="input" style={{ width: 'auto', minWidth: '150px' }}>
        <option>Sort by: Most recent</option>
        <option>Sort by: Highest rated</option>
        <option>Sort by: Lowest rated</option>
      </select>
    </div>
  );
}
