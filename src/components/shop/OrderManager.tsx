import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Order } from '../../types';
import SizeTag from '../common/SizeTag';
import { toast } from 'react-toastify';

const STATES = ['PENDING_PAYMENT', 'CONFIRMED', 'SHIPPING', 'DELIVERING', 'COMPLETED', 'CANCELED'];
const LABELS: Record<string, string> = { PENDING_PAYMENT: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang vận chuyển', DELIVERING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELED: 'Đã hủy' };

export default function OrderManager() {
    const [state, setState] = useState('PENDING_PAYMENT');
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => { load(); }, [state]);

    const load = async () => {
        const d: any = await axiosClient.get('/shop-order/get-orders?state=' + state + '&page=0&size=20').catch(() => null);
        setOrders(d?.content || []);
    };

    const accept = async (id: number) => { await axiosClient.post('/shop-order/accept-order?orderId=' + id); toast.success('Đã xác nhận'); load(); };
    const createGHN = async (id: number) => {
        if (!window.confirm('Tạo đơn GHN?')) return;
        try { const r: any = await axiosClient.post('/shipping/create?orderId=' + id); toast.success('GHN: ' + (r?.ghnOrderCode || 'OK')); load(); }
        catch (e: any) { toast.error(e.message); }
    };
    const cancelOrder = async (id: number) => {
        const reason = prompt('Lý do hủy:');
        if (!reason?.trim()) return;
        await axiosClient.post('/shop-order/cancel-order', { orderId: id, reason }).catch((e: any) => toast.error(e.message));
        toast.success('Đã hủy'); load();
    };

    return (
        <div>
            <h2>Quản lý đơn hàng</h2>
            <select value={state} onChange={e => setState(e.target.value)} style={{ padding: '10px', marginBottom: '16px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '6px' }}>
                {STATES.map(s => <option key={s} value={s}>{LABELS[s]}</option>)}
            </select>

            {orders.length === 0 && <p style={{ color: '#999' }}>Không có đơn hàng</p>}
            {orders.map(o => (
                <div key={o.orderId} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', marginBottom: '12px', background: '#fff' }}>
                    <h4 style={{ margin: '0 0 8px' }}>Đơn #{o.orderId} - {LABELS[o.state]} - {o.totalPrice?.toLocaleString('vi-VN')}₫</h4>
                    {o.productOrderOutputs?.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0', fontSize: '14px' }}>
                            <img src={p.image || ''} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            <span>{p.productName} {p.size && <SizeTag size={p.size} />}</span>
                            <span>x{p.quantityOrder}</span>
                            <span style={{ marginLeft: 'auto' }}>{p.totalPrice?.toLocaleString('vi-VN')}₫</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        {state === 'PENDING_PAYMENT' && <><button onClick={() => accept(o.orderId)} style={{ padding: '6px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xác nhận</button><button onClick={() => cancelOrder(o.orderId)} style={{ padding: '6px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button></>}
                        {state === 'CONFIRMED' && <><button onClick={() => createGHN(o.orderId)} style={{ padding: '6px 14px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Tạo đơn GHN</button><button onClick={() => cancelOrder(o.orderId)} style={{ padding: '6px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Hủy</button></>}
                    </div>
                </div>
            ))}
        </div>
    );
}
