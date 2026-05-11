import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }: { product: Product }) {
    const navigate = useNavigate();
    const priceText = product.minPrice ? 'Từ ' + product.minPrice.toLocaleString('vi-VN') + '₫' : 'Liên hệ';

    return (
        <div className={styles.card} onClick={() => navigate('/product/' + product.productId)}>
            <div className={styles.image}>
                <img src={product.image} alt={product.name} />
            </div>
            <div className={styles.info}>
                <h3>{product.name}</h3>
                <p className={styles.price}>{priceText}</p>
            </div>
        </div>
    );
}
