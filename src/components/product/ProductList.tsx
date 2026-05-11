import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Product } from '../../types';
import ProductCard from './ProductCard';
import Pagination from '../common/Pagination';

interface Props {
    apiUrl: string;
    pageSize?: number;
    site?: 'user' | 'admin';
}

export default function ProductList({ apiUrl, pageSize, site = 'user' }: Props) {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const pageParam = (apiUrl.includes('?') ? '&' : '?') + 'page=' + currentPage;
        const siteParam = '&site=' + site;
        const sizeParam = pageSize ? '&size=' + pageSize : '';
        const url = apiUrl + pageParam + siteParam + sizeParam;
        axiosClient.get(url)
            .then((data: any) => {
                if (data?.content) { setProducts(data.content); setTotalPages(data.totalPages); }
            })
            .catch(() => {});
    }, [currentPage, apiUrl, pageSize, site]);

    return (
        <div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px', maxWidth: '1200px', margin: '0 auto'
            }}>
                {products.map(p => <ProductCard key={p.productId} product={p} />)}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
}
