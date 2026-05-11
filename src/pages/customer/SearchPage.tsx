import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Product } from '../../types';
import ProductCard from '../../components/product/ProductCard';
import Pagination from '../../components/common/Pagination';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        if (query) {
            axiosClient.get('/product/get-products-by-search?search=' + encodeURIComponent(query) + '&page=' + page + '&site=user')
                .then((data: any) => { if (data?.content) { setProducts(data.content); setTotalPages(data.totalPages); } })
                .catch(() => {});
        }
    }, [query, page]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '32px', color: '#f7b634', textAlign: 'center', margin: '20px 0' }}>
                Kết quả tìm kiếm: "{query}"
            </h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {products.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#999' }}>Không tìm thấy sản phẩm nào</p>}
                {products.map(p => <ProductCard key={p.productId} product={p} />)}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
