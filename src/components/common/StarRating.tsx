import React, { useState } from 'react';

interface Props {
    value?: number;
    onChange?: (val: number) => void;
    readonly?: boolean;
}

export default function StarRating({ value = 0, onChange, readonly = false }: Props) {
    const [hover, setHover] = useState(0);
    const rating = hover || value;

    return (
        <div style={{ display: 'inline-flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(star => (
                <span key={star}
                    style={{ cursor: readonly ? 'default' : 'pointer', fontSize: '24px', color: star <= rating ? '#f0a500' : '#ddd' }}
                    onClick={() => !readonly && onChange?.(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}>
                    &#9733;
                </span>
            ))}
        </div>
    );
}
