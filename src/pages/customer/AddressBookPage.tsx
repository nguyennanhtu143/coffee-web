import React, { useCallback, useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import useShippingAddress from '../../hooks/useShippingAddress';
import { UserAddress } from '../../types';
import { toast } from 'react-toastify';

const emptyForm = {
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    toDistrictId: 0,
    toWardCode: '',
    isDefault: false,
};

export default function AddressBookPage() {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [editing, setEditing] = useState<UserAddress | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [showForm, setShowForm] = useState(false);
    const shipping = useShippingAddress();
    const { loadProvinces } = shipping;

    const loadAddresses = useCallback(async () => {
        const data: any = await axiosClient.get('/user-address/get-addresses').catch(() => []);
        setAddresses(data || []);
    }, []);

    useEffect(() => {
        loadAddresses();
        loadProvinces();
    }, [loadAddresses, loadProvinces]);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (address: UserAddress) => {
        setEditing(address);
        setForm({
            fullName: address.fullName,
            phoneNumber: address.phoneNumber,
            email: address.email,
            address: address.address,
            toDistrictId: address.toDistrictId,
            toWardCode: address.toWardCode,
            isDefault: address.isDefault,
        });
        setShowForm(true);
    };

    const onDistrictChange = async (value: string) => {
        await shipping.onDistrictChange(value);
        setForm(prev => ({ ...prev, toDistrictId: value ? parseInt(value) : 0, toWardCode: '' }));
    };

    const onWardChange = (value: string) => {
        setForm(prev => ({ ...prev, toWardCode: value }));
    };

    const validate = () => {
        if (!form.fullName.trim()) return 'Nhập họ tên người nhận';
        if (!/^\d{10}$/.test(form.phoneNumber)) return 'Số điện thoại phải có đúng 10 chữ số';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) return 'Email không đúng định dạng';
        if (!form.address.trim()) return 'Nhập địa chỉ chi tiết';
        if (!form.toDistrictId || !form.toWardCode) return 'Chọn đầy đủ quận/huyện và phường/xã';
        return '';
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validate();
        if (error) {
            toast.error(error);
            return;
        }

        try {
            if (editing) {
                await axiosClient.post('/user-address/update?addressId=' + editing.addressId, form);
                toast.success('Đã cập nhật địa chỉ');
            } else {
                await axiosClient.post('/user-address/create', form);
                toast.success('Đã thêm địa chỉ');
            }
            setShowForm(false);
            setEditing(null);
            setForm(emptyForm);
            loadAddresses();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const remove = async (addressId: number) => {
        if (!window.confirm('Xóa địa chỉ này?')) return;
        await axiosClient.delete('/user-address/delete?addressId=' + addressId).catch((err: any) => toast.error(err.message));
        toast.success('Đã xóa địa chỉ');
        loadAddresses();
    };

    const setDefault = async (addressId: number) => {
        await axiosClient.post('/user-address/set-default?addressId=' + addressId).catch((err: any) => toast.error(err.message));
        toast.success('Đã đặt làm mặc định');
        loadAddresses();
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' };
    const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' };
    const buttonStyle: React.CSSProperties = { padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <h2>Sổ địa chỉ</h2>
                <button onClick={openCreate} style={{ ...buttonStyle, background: '#8B4513', color: '#fff' }}>Thêm địa chỉ</button>
            </div>

            {showForm && (
                <form onSubmit={submit} style={{ padding: '18px', marginBottom: '20px', background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '14px' }}>{editing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                    <label style={labelStyle}>Họ tên:</label>
                    <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} style={inputStyle} />
                    <label style={labelStyle}>Số điện thoại:</label>
                    <input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} style={inputStyle} />
                    <label style={labelStyle}>Email:</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                    <label style={labelStyle}>Tỉnh / Thành phố:</label>
                    <select onChange={e => shipping.onProvinceChange(e.target.value)} style={inputStyle}>
                        <option value="">-- Chọn --</option>
                        {shipping.provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                    </select>
                    <label style={labelStyle}>Quận / Huyện:</label>
                    <select value={form.toDistrictId || ''} disabled={!shipping.districts.length} onChange={e => onDistrictChange(e.target.value)} style={inputStyle}>
                        <option value="">-- Chọn --</option>
                        {shipping.districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
                    </select>
                    <label style={labelStyle}>Phường / Xã:</label>
                    <select value={form.toWardCode} disabled={!shipping.wards.length} onChange={e => onWardChange(e.target.value)} style={inputStyle}>
                        <option value="">-- Chọn --</option>
                        {shipping.wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
                    </select>
                    <label style={labelStyle}>Địa chỉ chi tiết:</label>
                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} style={inputStyle} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '14px' }}>
                        <input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />
                        Đặt làm địa chỉ mặc định
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" style={{ ...buttonStyle, background: '#27ae60', color: '#fff' }}>Lưu</button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ ...buttonStyle, background: '#f0f0f0', color: '#333' }}>Hủy</button>
                    </div>
                </form>
            )}

            {addresses.length === 0 && <p style={{ color: '#999' }}>Bạn chưa có địa chỉ nào.</p>}
            <div style={{ display: 'grid', gap: '12px' }}>
                {addresses.map(a => (
                    <div key={a.addressId} style={{ padding: '16px', background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                            <strong>{a.fullName}</strong>
                            {a.isDefault && <span style={{ color: '#27ae60', fontWeight: 600 }}>Mặc định</span>}
                        </div>
                        <p style={{ margin: '4px 0' }}>{a.phoneNumber} | {a.email}</p>
                        <p style={{ margin: '4px 0' }}>{a.address}</p>
                        <p style={{ margin: '4px 0', color: '#777' }}>District: {a.toDistrictId} | Ward: {a.toWardCode}</p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                            <button onClick={() => openEdit(a)} style={{ ...buttonStyle, background: '#f0f0f0', color: '#333' }}>Sửa</button>
                            {!a.isDefault && <button onClick={() => setDefault(a.addressId)} style={{ ...buttonStyle, background: '#3498db', color: '#fff' }}>Đặt mặc định</button>}
                            <button onClick={() => remove(a.addressId)} style={{ ...buttonStyle, background: '#e74c3c', color: '#fff' }}>Xóa</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
