import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { ProductSize } from '../../types';
import { toast } from 'react-toastify';

interface Props { productId: number; productName: string; onClose: () => void; }

export default function SizeManager({ productId, productName, onClose }: Props) {
    const [sizes, setSizes] = useState<ProductSize[]>([]);
    const [s, setS] = useState(''); const [price, setPrice] = useState(''); const [desc, setDesc] = useState('');

    useEffect(() => { load(); }, [productId]);
    const load = async () => { const d: any = await axiosClient.get('/product-size/get?productId=' + productId).catch(() => []); setSizes(d || []); };

    const add = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!s || !price) { toast.error('Chọn size và nhập giá'); return; }
        await axiosClient.post('/product-size/create', { productId, size: s, price: parseInt(price), description: desc }).catch((err: any) => toast.error(err.message));
        toast.success('Thêm thành công!'); setS(''); setPrice(''); setDesc(''); load();
    };

    const del = async (id: number) => {
        if (!window.confirm('Xoá?')) return;
        await axiosClient.delete('/product-size/delete?sizeId=' + id); toast.success('Đã xoá'); load();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                <h3>Quản lý size - {productName}</h3>
                {sizes.length === 0 ? <p style={{ color: '#999' }}>Chưa có size</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                        <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: '8px', textAlign: 'left' }}>Size</th><th style={{ padding: '8px' }}>Giá</th><th style={{ padding: '8px' }}>Mô tả</th><th></th></tr></thead>
                        <tbody>{sizes.map(sz => (
                            <tr key={sz.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px', fontWeight: 600 }}>{sz.size}</td><td style={{ padding: '8px' }}>{sz.price?.toLocaleString('vi-VN')}₫</td><td style={{ padding: '8px', color: '#666' }}>{sz.description || '-'}</td>
                                <td style={{ padding: '8px' }}><button onClick={() => del(sz.id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Xoá</button></td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
                <h4>Thêm size</h4>
                <form onSubmit={add} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <select value={s} onChange={e => setS(e.target.value)} required style={{ padding: '8px' }}><option value="">Size</option><option>S</option><option>M</option><option>L</option><option>XL</option></select>
                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá" required style={{ padding: '8px', width: '100px' }} />
                    <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Mô tả" style={{ padding: '8px', width: '150px' }} />
                    <button type="submit" style={{ padding: '8px 16px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Thêm</button>
                </form>
                <button onClick={onClose} style={{ marginTop: '16px', padding: '8px 20px', background: '#999', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Đóng</button>
            </div>
        </div>
    );
}
