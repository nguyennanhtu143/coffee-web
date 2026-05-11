import React from 'react';

export default function SizeTag({ size }: { size?: string }) {
    if (!size) return null;
    return (
        <span style={{
            display: 'inline-block', background: '#f0e6d8', color: '#8B4513',
            padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, marginLeft: '4px'
        }}>
            {size}
        </span>
    );
}
