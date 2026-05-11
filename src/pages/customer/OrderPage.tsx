import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Order } from '../../types';
import SizeTag from '../../components/common/SizeTag';
import { toast } from 'react-toastify';

const TABS = [
    { state: 'PENDING_PAYMENT', label: 'Chờ xác nhận' },
    { state: 'CONFIRMED', label: 'Đã xác nhận' },
    { state: 'SHIPPING', label: 'Đang vận chuyển' },
    { state: 'DELIVERING', label: 'Đang giao' },
    { state: 'COMPLETED', label: 'Hoàn thành' },
    { state: 'CANCELED', label: 'Đã hủy' },
];

export default function OrderPage() {
    const [active, setActive] = useState('PENDING_PAYMENT');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { load(active); }, [active]);

    const load = async (state: string) => {
        setLoading(true);
        const data: any = await axiosClient.get('/order/get-orders-by-state?state=' + state).catch(() => null);
        setOrders(data?.content || []);
        setLoading(false);
    };

    const cancel = async (orderId: number) => {
        const reason = prompt('Lý do hủy đơn:');
        if (!reason?.trim()) return;
        try { await axiosClient.post('/order/cancel', { orderId, reason }); toast.success('Đã hủy'); load(active); }
        catch (e: any) { toast.error(e.message); }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', justifyContent: 'center' }}>
                {TABS.map(t => (
                    <button key={t.state} onClick={() => setActive(t.state)}
                        style={{ padding: '10px 18px', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, background: active === t.state ? '#8B4513' : '#fff', color: active === t.state ? '#fff' : '#333' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {loading && <p style={{ textAlign: 'center' }}>Đang tải...</p>}
            {!loading && orders.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Không có đơn hàng</p>}

            {orders.map(order => (
                <div key={order.orderId} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '16px', marginBottom: '16px', background: '#fff' }}>
                    {order.productOrderOutputs?.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: i < order.productOrderOutputs.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <img src={p.image || ''} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '12px' }} />
                            <div style={{ flex: 1 }}>{p.productName} {p.size && <SizeTag size={p.size} />}</div>
                            <div style={{ width: '80px', textAlign: 'right' }}>{p.price?.toLocaleString('vi-VN')}₫</div>
                            <div style={{ width: '50px', textAlign: 'center' }}>x{p.quantityOrder}</div>
                            <div style={{ width: '100px', textAlign: 'right', fontWeight: 600 }}>{p.totalPrice?.toLocaleString('vi-VN')}₫</div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {(active === 'PENDING_PAYMENT' || active === 'CONFIRMED') && (
                                <button onClick={() => cancel(order.orderId)} style={{ padding: '6px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px' }}>Hủy đơn</button>
                            )}
                            {(active === 'SHIPPING' || active === 'DELIVERING') && (
                                <span style={{ background: '#3498db', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '15px' }}>
                                    {active === 'DELIVERING' ? 'Shipper đang giao' : 'Đang vận chuyển'}
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#e74c3c', margin: 0 }}>Tổng: {order.totalPrice?.toLocaleString('vi-VN')}₫</p>
                    </div>
                    {active === 'CANCELED' && order.cancelOrderOutput?.reason && (
                        <div style={{ marginTop: '8px', padding: '10px', background: '#f8f9fa', borderRadius: '6px', fontSize: '15px' }}>
                            <strong>Lý do hủy:</strong> {order.cancelOrderOutput.reason} | <strong>Người hủy:</strong> {order.cancelOrderOutput.name}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
