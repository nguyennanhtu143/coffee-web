import React, { useState, useEffect } from 'react';
import { ProductSize } from '../../types';
import styles from './SizeSelector.module.css';

interface Props {
    sizes: ProductSize[];
    onSelect: (size: ProductSize) => void;
}

export default function SizeSelector({ sizes, onSelect }: Props) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        if (sizes.length > 0 && !selectedId) {
            setSelectedId(sizes[0].id);
            onSelect(sizes[0]);
        }
    }, [sizes]);

    const handleSelect = (s: ProductSize) => { setSelectedId(s.id); onSelect(s); };
    const selected = sizes.find(s => s.id === selectedId);

    if (!sizes || sizes.length === 0) return <p style={{ color: '#999' }}>Chưa có size nào</p>;

    return (
        <div className={styles.container}>
            <label className={styles.label}>Chọn size:</label>
            <div className={styles.options}>
                {sizes.map(s => (
                    <button key={s.id} type="button"
                        className={`${styles.btn} ${selectedId === s.id ? styles.active : ''}`}
                        onClick={() => handleSelect(s)}>
                        {s.size}
                    </button>
                ))}
            </div>
            {selected && <p className={styles.price}>{selected.price.toLocaleString('vi-VN')}₫</p>}
            {selected?.description && <p className={styles.desc}>{selected.description}</p>}
        </div>
    );
}
