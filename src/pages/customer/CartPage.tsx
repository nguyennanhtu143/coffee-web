import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { CartItem } from '../../types';
import SizeTag from '../../components/common/SizeTag';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';

export default function CartPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<CartItem[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selected, setSelected] = useState<Set<number>>(new Set());

    useEffect(() => { load(page); }, [page]);

    const load = async (p: number) => {
        const data: any = await axiosClient.get('/cart/get?page=' + p + '&size=10').catch(() => null);
        if (data?.content) { setItems(data.content); setTotalPages(data.totalPages); }
    };

    const toggle = (id: number) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const remove = async (id: number) => {
        await axiosClient.delete('/cart/delete?cartId=' + id).catch(() => null);
        toast.success('Đã xoá'); load(page);
    };

    const order = async () => {
        if (selected.size === 0) { toast.error('Chọn ít nhất 1 sản phẩm!'); return; }
        const data: any = await axiosClient.get('/cart/get-product-before-ordering?cartIds=' + Array.from(selected).join(','));
        const params = new URLSearchParams();
        data.forEach((p: any) => params.append('products[]', JSON.stringify(p)));
        navigate('/checkout?' + params.toString());
    };

    const thStyle: React.CSSProperties = { padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #eee' };
    const tdStyle: React.CSSProperties = { padding: '12px 8px', borderBottom: '1px solid #f0f0f0' };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Giỏ hàng</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ ...thStyle, width: '40px' }}></th>
                        <th style={thStyle}>Hình ảnh</th>
                        <th style={thStyle}>Sản phẩm</th>
                        <th style={thStyle}>Size</th>
                        <th style={thStyle}>Đơn giá</th>
                        <th style={thStyle}>SL</th>
                        <th style={thStyle}>Thành tiền</th>
                        <th style={thStyle}></th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Giỏ hàng trống</td></tr>}
                    {items.map(i => (
                        <tr key={i.cartId}>
                            <td style={tdStyle}><input type="checkbox" checked={selected.has(i.cartId)} onChange={() => toggle(i.cartId)} /></td>
                            <td style={tdStyle}><img src={i.imageUrl} alt="" style={{ width: '60px', borderRadius: '4px' }} /></td>
                            <td style={{ ...tdStyle, fontWeight: 500 }}>{i.nameProduct}</td>
                            <td style={tdStyle}><SizeTag size={i.size} /></td>
                            <td style={{ ...tdStyle, color: '#e74c3c' }}>{i.price?.toLocaleString('vi-VN')}₫</td>
                            <td style={tdStyle}>{i.quantityOrder}</td>
                            <td style={{ ...tdStyle, fontWeight: 600 }}>{i.totalPrice?.toLocaleString('vi-VN')}₫</td>
                            <td style={tdStyle}>
                                <button onClick={() => remove(i.cartId)} style={{ padding: '6px 12px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' }}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button onClick={order} disabled={selected.size === 0}
                    style={{ padding: '14px 50px', fontSize: '16px', background: selected.size === 0 ? '#ccc' : '#4CAF50', color: '#fff', border: 'none', borderRadius: '6px', cursor: selected.size === 0 ? 'not-allowed' : 'pointer' }}>
                    Đặt hàng
                </button>
            </div>
        </div>
    );
}
