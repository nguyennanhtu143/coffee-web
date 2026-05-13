import React, { useCallback, useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Order } from '../../types';
import SizeTag from '../common/SizeTag';
import { toast } from 'react-toastify';

const PAGE_SIZE = 20;
const STATES = ['PENDING_PAYMENT', 'CONFIRMED', 'SHIPPING', 'DELIVERING', 'COMPLETED', 'CANCELED'];
const LABELS: Record<string, string> = { PENDING_PAYMENT: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang vận chuyển', DELIVERING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELED: 'Đã hủy' };

export default function OrderManager() {
    const [state, setState] = useState('PENDING_PAYMENT');
    const [orderId, setOrderId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);

    const buildQuery = useCallback((p: number) => {
        const params = new URLSearchParams();
        params.set('page', String(p));
        params.set('size', String(PAGE_SIZE));
        if (state) params.set('state', state);
        if (orderId.trim()) params.set('orderId', orderId.trim());
        if (phoneNumber.trim()) params.set('phoneNumber', phoneNumber.trim());
        if (createdFrom) params.set('createdFrom', createdFrom + 'T00:00:00');
        if (createdTo) params.set('createdTo', createdTo + 'T23:59:59');
        return params.toString();
    }, [createdFrom, createdTo, orderId, phoneNumber, state]);

    const load = useCallback(async (p: number) => {
        const d: any = await axiosClient.get('/shop-order/get-orders?' + buildQuery(p)).catch(() => null);
        setOrders(d?.content || []);
        setTotalPages(d?.totalPages || 0);
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
        setState('PENDING_PAYMENT');
        setOrderId('');
        setPhoneNumber('');
        setCreatedFrom('');
        setCreatedTo('');
        setPage(0);
    };

    const accept = async (id: number) => { await axiosClient.post('/shop-order/accept-order?orderId=' + id); toast.success('Đã xác nhận'); load(page); };
    const createGHN = async (id: number) => {
        if (!window.confirm('Tạo đơn GHN?')) return;
        try { const r: any = await axiosClient.post('/shipping/create?orderId=' + id); toast.success('GHN: ' + (r?.ghnOrderCode || 'OK')); load(page); }
        catch (e: any) { toast.error(e.message); }
    };
    const cancelOrder = async (id: number) => {
        const reason = prompt('Lý do hủy:');
        if (!reason?.trim()) return;
        await axiosClient.post('/shop-order/cancel-order', { orderId: id, reason }).catch((e: any) => toast.error(e.message));
        toast.success('Đã hủy');
        load(page);
    };

    const inputStyle: React.CSSProperties = { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' };
    const buttonStyle: React.CSSProperties = { padding: '10px 16px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' };

    return (
        <div>
            <h2>Quản lý đơn hàng</h2>
            <form onSubmit={applyFilters} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', padding: '14px', margin: '16px 0', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
                <select value={state} onChange={e => { setState(e.target.value); setPage(0); }} style={inputStyle}>
                    <option value="">Tất cả trạng thái</option>
                    {STATES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
                </select>
                <input value={orderId} onChange={e => setOrderId(e.target.value.replace(/\D/g, ''))} placeholder="Mã đơn hàng" style={inputStyle} />
                <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="Số điện thoại" style={inputStyle} />
                <input type="date" value={createdFrom} onChange={e => { setCreatedFrom(e.target.value); setPage(0); }} style={inputStyle} />
                <input type="date" value={createdTo} onChange={e => { setCreatedTo(e.target.value); setPage(0); }} style={inputStyle} />
                <button type="submit" style={{ ...buttonStyle, background: '#27ae60', color: '#fff' }}>Lọc</button>
                <button type="button" onClick={resetFilters} style={{ ...buttonStyle, background: '#f0f0f0', color: '#333' }}>Xóa lọc</button>
            </form>

            {orders.length === 0 && <p style={{ color: '#999' }}>Không có đơn hàng</p>}
            {orders.map(o => (
                <div key={o.orderId} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', marginBottom: '12px', background: '#fff' }}>
                    <h4 style={{ margin: '0 0 8px' }}>Đơn #{o.orderId} - {LABELS[o.state] || o.state} - {o.totalPrice?.toLocaleString('vi-VN')}₫</h4>
                    {o.productOrderOutputs?.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0', fontSize: '14px' }}>
                            <img src={p.image || ''} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <span>{p.productName} {p.size && <SizeTag size={p.size} />}</span>
                            <span>x{p.quantityOrder}</span>
                            <span style={{ marginLeft: 'auto' }}>{p.totalPrice?.toLocaleString('vi-VN')}₫</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        {o.state === 'PENDING_PAYMENT' && <><button onClick={() => accept(o.orderId)} style={{ padding: '6px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xác nhận</button><button onClick={() => cancelOrder(o.orderId)} style={{ padding: '6px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button></>}
                        {o.state === 'CONFIRMED' && <><button onClick={() => createGHN(o.orderId)} style={{ padding: '6px 14px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tạo đơn GHN</button><button onClick={() => cancelOrder(o.orderId)} style={{ padding: '6px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button></>}
                    </div>
                </div>
            ))}
            {totalPages > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}><button disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button><span>Trang {page + 1}/{totalPages}</span><button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Tiếp</button></div>}
        </div>
    );
}
