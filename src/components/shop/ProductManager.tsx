import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { axiosUpload } from '../../api/axiosClient';
import { Product } from '../../types';
import SizeManager from './SizeManager';
import { toast } from 'react-toastify';

export default function ProductManager() {
    const [products, setProducts] = useState<Product[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [editProd, setEditProd] = useState<any>(null);
    const [sizeProdId, setSizeProdId] = useState<number | null>(null);
    const [sizeProdName, setSizeProdName] = useState('');

    useEffect(() => { load(page); }, [page]);

    const load = async (p: number) => {
        const d: any = await axiosClient.get('/product/get-products?page=' + p + '&site=admin').catch(() => null);
        if (d?.content) { setProducts(d.content); setTotalPages(d.totalPages); }
    };

    const del = async (id: number) => {
        if (!window.confirm('Xoá sản phẩm?')) return;
        await axiosClient.delete('/product/delete?productId=' + id).catch(() => null);
        toast.success('Đã xoá'); load(page);
    };

    const update = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData();
        form.append('productInput', new Blob([JSON.stringify({ name: editProd.name, description: editProd.description })], { type: 'application/json' }));
        if (editProd.file) form.append('image', editProd.file);
        await axiosUpload.post('/product/update?productId=' + editProd.productId, form).catch((err: any) => toast.error(err.message));
        toast.success('Đã cập nhật'); setEditProd(null); load(page);
    };

    return (
        <div>
            <h2>Danh sách sản phẩm</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {products.map(p => (
                    <div key={p.productId} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '12px', background: '#fff' }}>
                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px' }} />
                        <h4 style={{ margin: '8px 0 4px' }}>{p.name}</h4>
                        <p style={{ fontSize: '14px', color: '#666' }}>{p.sizes?.map(s => s.size + ': ' + s.price?.toLocaleString('vi-VN') + '₫').join(' | ') || 'Chưa có size'}</p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            <button onClick={() => setEditProd({ ...p, file: null })} style={{ padding: '4px 10px', fontSize: '14px', cursor: 'pointer' }}>Sửa</button>
                            <button onClick={() => { setSizeProdId(p.productId); setSizeProdName(p.name); }} style={{ padding: '4px 10px', fontSize: '14px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Size</button>
                            <button onClick={() => del(p.productId)} style={{ padding: '4px 10px', fontSize: '14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xoá</button>
                        </div>
                    </div>
                ))}
            </div>
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
                            <button type="button" onClick={() => setEditProd(null)} style={{ padding: '8px 20px', cursor: 'pointer' }}>Huỷ</button>
                        </div>
                    </form>
                </div>
            )}
            {sizeProdId && <SizeManager productId={sizeProdId} productName={sizeProdName} onClose={() => { setSizeProdId(null); load(page); }} />}
        </div>
    );
}
