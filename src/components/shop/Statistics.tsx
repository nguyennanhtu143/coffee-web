import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { StatisticOverview, RevenueData } from '../../types';

const LABELS: Record<string, string> = { PENDING_PAYMENT: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận', SHIPPING: 'Đang vận chuyển', DELIVERING: 'Đang giao', COMPLETED: 'Hoàn thành', CANCELED: 'Đã hủy' };

export default function Statistics() {
    const [overview, setOverview] = useState<StatisticOverview | null>(null);
    const [revenue, setRevenue] = useState<RevenueData[]>([]);

    useEffect(() => {
        axiosClient.get('/statistic/overview').then((d: any) => setOverview(d)).catch(() => {});
        axiosClient.get('/statistic/revenue-by-days?days=30').then((d: any) => setRevenue(d || [])).catch(() => {});
    }, []);

    if (!overview) return <p>Đang tải...</p>;
    const maxRev = Math.max(...revenue.map(r => r.totalRevenue), 1);

    return (
        <div>
            <h2>Thống kê Shop</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Tổng doanh thu', value: overview.totalRevenue?.toLocaleString('vi-VN') + '₫' },
                    { label: 'Tổng đơn', value: overview.totalOrders },
                    { label: 'Đơn hoàn thành', value: overview.totalCompletedOrders },
                    { label: 'Đơn đã hủy', value: overview.totalCanceledOrders },
                ].map((c, i) => (
                    <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px' }}>{c.label}</p>
                        <p style={{ color: '#8B4513', fontSize: '24px', fontWeight: 700, margin: 0 }}>{c.value}</p>
                    </div>
                ))}
            </div>

            <h3>Đơn theo trạng thái</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {overview.ordersByState?.map(s => (
                    <span key={s.state} style={{ background: '#f0f0f0', padding: '4px 12px', borderRadius: '12px', fontSize: '15px' }}>
                        {LABELS[s.state] || s.state}: {s.count}
                    </span>
                ))}
            </div>

            <h3>Top sản phẩm bán chạy</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
                <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: '8px' }}>#</th><th style={{ padding: '8px', textAlign: 'left' }}>Sản phẩm</th><th style={{ padding: '8px' }}>Đã bán</th><th style={{ padding: '8px' }}>Doanh thu</th></tr></thead>
                <tbody>{overview.topProducts?.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{i + 1}</td>
                        <td style={{ padding: '8px' }}>{p.image && <img src={p.image} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px', verticalAlign: 'middle', marginRight: '8px' }} />}{p.productName} {p.size && <span style={{ fontSize: '14px', color: '#888' }}>({p.size})</span>}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{p.totalQuantitySold}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{p.totalRevenue?.toLocaleString('vi-VN')}₫</td>
                    </tr>
                ))}</tbody>
            </table>

            <h3>Doanh thu 30 ngày</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '200px', borderBottom: '1px solid #ddd', padding: '0 4px', overflowX: 'auto' }}>
                {revenue.map((r, i) => (
                    <div key={i} title={r.period + ': ' + r.totalRevenue?.toLocaleString('vi-VN') + '₫'}
                        style={{ flex: 1, minWidth: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                        <div style={{ width: '100%', background: '#8B4513', borderRadius: '2px 2px 0 0', minHeight: '2px', height: (r.totalRevenue / maxRev * 100) + '%', transition: 'height 0.3s' }}></div>
                        <span style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>{r.period?.substring(8)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
