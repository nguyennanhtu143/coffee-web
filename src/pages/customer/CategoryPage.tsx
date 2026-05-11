import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import ProductList from '../../components/product/ProductList';

export default function CategoryPage() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const [name, setName] = useState('');

    useEffect(() => {
        axiosClient.get('/category/get?categoryId=' + categoryId)
            .then((data: any) => setName(data?.name || '')).catch(() => {});
    }, [categoryId]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {name && <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '36px', color: '#f7b634', textAlign: 'center', margin: '20px 0' }}>{name}</h1>}
            <ProductList key={categoryId} apiUrl={'/product/get-products-by-category?categoryId=' + categoryId} />
        </div>
    );
}
