import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Coupon } from '../../types';
import { toast } from 'react-toastify';

export default function CouponManager() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [form, setForm] = useState({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', maxDiscount: '', minOrderValue: '0', maxUsage: '100', startDate: '', endDate: '' });

    useEffect(() => { load(); }, []);
    const load = async () => { const d: any = await axiosClient.get('/coupon/list').catch(() => []); setCoupons(d || []); };

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        const input = {
            code: form.code,
            description: form.description,
            discountType: form.discountType,
            discountValue: form.discountType === 'FREE_SHIP' ? 0 : (parseInt(form.discountValue) || 0),
            maxDiscount: form.maxDiscount ? parseInt(form.maxDiscount) : null,
            minOrderValue: parseInt(form.minOrderValue) || 0,
            maxUsage: parseInt(form.maxUsage) || 100,
            startDate: form.startDate,
            endDate: form.endDate,
        };
        try { await axiosClient.post('/coupon/create', input); toast.success('Tạo coupon thành công!'); setForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', maxDiscount: '', minOrderValue: '0', maxUsage: '100', startDate: '', endDate: '' }); load(); }
        catch (err: any) { toast.error(err.message); }
    };

    const deactivate = async (id: number) => {
        if (!window.confirm('Vô hiệu hóa?')) return;
        await axiosClient.post('/coupon/deactivate?couponId=' + id); toast.success('Đã vô hiệu hóa'); load();
    };

    const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px', color: '#333' };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' as const };

    return (
        <div>
            <h2>Quản lý khuyến mãi</h2>
            <form onSubmit={create} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '650px', marginTop: '16px', marginBottom: '24px' }}>
                <div>
                    <label style={labelStyle}>Mã coupon *</label>
                    <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="VD: FREESHIP30K" required style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Mô tả</label>
                    <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="VD: Miễn phí ship đơn từ 100k" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Loại giảm giá *</label>
                    <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} style={inputStyle}>
                        <option value="PERCENTAGE">Giảm giá theo %</option>
                        <option value="FIXED">Giảm giá cố định (VND)</option>
                        <option value="FREE_SHIP">Miễn phí vận chuyển</option>
                    </select>
                </div>
                {form.discountType !== 'FREE_SHIP' && (
                    <div>
                        <label style={labelStyle}>Giá trị giảm *</label>
                        <input type="number" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })}
                            placeholder={form.discountType === 'PERCENTAGE' ? 'VD: 20 (= 20%)' : 'VD: 50000'} required style={inputStyle} />
                    </div>
                )}
                <div>
                    <label style={labelStyle}>{form.discountType === 'FREE_SHIP' ? 'Giảm ship tối đa (VND)' : 'Giảm tối đa (VND)'}</label>
                    <input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: e.target.value })}
                        placeholder={form.discountType === 'FREE_SHIP' ? 'Để trống = miễn phí hoàn toàn' : 'Để trống = không giới hạn'} style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Đơn tối thiểu (VND)</label>
                    <input type="number" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} placeholder="0 = không yêu cầu" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Số lượt sử dụng tối đa</label>
                    <input type="number" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} placeholder="100" style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Ngày bắt đầu *</label>
                    <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                    <label style={labelStyle}>Ngày kết thúc *</label>
                    <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required style={inputStyle} />
                </div>
                <button type="submit" style={{ gridColumn: '1/-1', padding: '10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Tạo coupon</button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8f9fa', fontSize: '15px' }}><th style={{ padding: '8px' }}>Mã</th><th style={{ padding: '8px' }}>Loại</th><th style={{ padding: '8px' }}>Giá trị</th><th style={{ padding: '8px' }}>Đã dùng</th><th style={{ padding: '8px' }}>Trạng thái</th><th></th></tr></thead>
                <tbody>{coupons.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{c.code}</td>
                        <td style={{ padding: '8px' }}>{c.discountType === 'PERCENTAGE' ? 'Giảm %' : c.discountType === 'FREE_SHIP' ? 'Free ship' : 'Giảm VND'}</td>
                        <td style={{ padding: '8px' }}>{c.discountType === 'FREE_SHIP' ? (c.maxDiscount ? 'Tối đa ' + c.maxDiscount?.toLocaleString('vi-VN') + '₫' : 'Miễn phí hoàn toàn') : c.discountValue + (c.discountType === 'PERCENTAGE' ? '%' : '₫')}</td>
                        <td style={{ padding: '8px' }}>{c.currentUsage}/{c.maxUsage}</td>
                        <td style={{ padding: '8px', color: c.isActive ? 'green' : 'red' }}>{c.isActive ? 'Hoạt động' : 'Vô hiệu'}</td>
                        <td style={{ padding: '8px' }}>{c.isActive && <button onClick={() => deactivate(c.id)} style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>Tắt</button>}</td>
                    </tr>
                ))}</tbody>
            </table>
        </div>
    );
}
