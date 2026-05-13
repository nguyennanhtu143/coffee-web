import React, { useCallback, useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { axiosUpload } from '../../api/axiosClient';
import { Category, Product } from '../../types';
import SizeManager from './SizeManager';
import { toast } from 'react-toastify';

const PAGE_SIZE = 20;

export default function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [direction, setDirection] = useState('desc');
    const [editProd, setEditProd] = useState<any>(null);
    const [sizeProdId, setSizeProdId] = useState<number | null>(null);
    const [sizeProdName, setSizeProdName] = useState('');

    useEffect(() => {
        axiosClient.get('/category/get-categories')
            .then((data: any) => setCategories(data || []))
            .catch(() => {});
    }, []);

    const buildQuery = useCallback((p: number) => {
        const params = new URLSearchParams();
        params.set('page', String(p));
        // params.set('size', String(PAGE_SIZE));
        params.set('sortBy', sortBy);
        params.set('direction', direction);
        if (search.trim()) params.set('search', search.trim());
        if (categoryId) params.set('categoryId', categoryId);
        return params.toString();
    }, [categoryId, direction, search, sortBy]);

    const load = useCallback(async (p: number) => {
        const d: any = await axiosClient.get('/product/admin-products?' + buildQuery(p)).catch(() => null);
        if (d?.content) {
            setProducts(d.content);
            setTotalPages(d.totalPages);
        } else {
            setProducts([]);
            setTotalPages(0);
        }
    }, [buildQuery]);

    useEffect(() => {
        load(page);
    }, [load, page]);

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        load(0);
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryId('');
        setSortBy('createdAt');
        setDirection('desc');
        setPage(0);
    };

    const del = async (id: number) => {
        if (!window.confirm('Xóa sản phẩm?')) return;
        await axiosClient.delete('/product/delete?productId=' + id).catch(() => null);
        toast.success('Đã xóa');
        load(page);
    };

    const update = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData();
        form.append('productInput', new Blob([JSON.stringify({ name: editProd.name, description: editProd.description })], { type: 'application/json' }));
        if (editProd.file) form.append('image', editProd.file);
        await axiosUpload.post('/product/update?productId=' + editProd.productId, form).catch((err: any) => toast.error(err.message));
        toast.success('Đã cập nhật');
        setEditProd(null);
        load(page);
    };

    const inputStyle: React.CSSProperties = { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' };
    const buttonStyle: React.CSSProperties = { padding: '10px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };

    return (
        <div>
            <h2>Danh sách sản phẩm</h2>
            <form onSubmit={applyFilters} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', padding: '14px', marginTop: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên sản phẩm" style={{ ...inputStyle, minWidth: '220px', flex: 1 }} />
                <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(0); }} style={inputStyle}>
                    <option value="">Tất cả danh mục</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
                </select>
                <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(0); }} style={inputStyle}>
                    <option value="createdAt">Ngày tạo</option>
                    <option value="name">Tên</option>
                    <option value="price">Giá</option>
                </select>
                <select value={direction} onChange={e => { setDirection(e.target.value); setPage(0); }} style={inputStyle}>
                    <option value="desc">Giảm dần</option>
                    <option value="asc">Tăng dần</option>
                </select>
                <button type="submit" style={{ ...buttonStyle, background: '#27ae60', color: '#fff' }}>Lọc</button>
                <button type="button" onClick={resetFilters} style={{ ...buttonStyle, background: '#f0f0f0', color: '#333' }}>Xóa lọc</button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {products.map(p => (
                    <div key={p.productId} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '12px', background: '#fff' }}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px' }} />
                        <h4 style={{ margin: '8px 0 4px' }}>{p.name}</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>{p.sizes?.map(s => s.size + ': ' + s.price?.toLocaleString('vi-VN') + '₫').join(' | ') || 'Chưa có size'}</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            <button onClick={() => setEditProd({ ...p, file: null })} style={{ padding: '4px 10px', fontSize: '14px', cursor: 'pointer' }}>Sửa</button>
                            <button onClick={() => { setSizeProdId(p.productId); setSizeProdName(p.name); }} style={{ padding: '4px 10px', fontSize: '14px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Size</button>
                            <button onClick={() => del(p.productId)} style={{ padding: '4px 10px', fontSize: '14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
            {products.length === 0 && <p style={{ marginTop: '16px', color: '#999' }}>Không có sản phẩm</p>}
            {totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}><button disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button><span>Trang {page + 1}/{totalPages}</span><button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Tiếp</button></div>}

            {editProd && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
                    <form onSubmit={update} style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '400px' }}>
                        <h3>Cập nhật sản phẩm</h3>
                        <input value={editProd.name} onChange={e => setEditProd({ ...editProd, name: e.target.value })} placeholder="Tên" style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box' }} />
                        <textarea value={editProd.description || ''} onChange={e => setEditProd({ ...editProd, description: e.target.value })} placeholder="Mô tả" style={{ width: '100%', padding: '8px', marginBottom: '10px', boxSizing: 'border-box', minHeight: '80px' }} />
                        <input type="file" onChange={e => setEditProd({ ...editProd, file: e.target.files?.[0] })} style={{ marginBottom: '10px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" style={{ padding: '8px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Lưu</button>
                            <button type="button" onClick={() => setEditProd(null)} style={{ padding: '8px 20px', cursor: 'pointer' }}>Hủy</button>
                        </div>
                    </form>
                </div>
            )}
            {sizeProdId && <SizeManager productId={sizeProdId} productName={sizeProdName} onClose={() => { setSizeProdId(null); load(page); }} />}
        </div>
    );
}
