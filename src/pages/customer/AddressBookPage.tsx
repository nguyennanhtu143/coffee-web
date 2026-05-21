import React, { useCallback, useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import useShippingAddress from '../../hooks/useShippingAddress';
import { UserAddress } from '../../types';
import { toast } from 'react-toastify';

// ─── Form state ───────────────────────────────────────────────────────────────

const emptyForm = {
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    provinceId: 0,
    provinceName: '',
    toDistrictId: 0,
    districtName: '',
    toWardCode: '',
    wardName: '',
    isDefault: false,
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AddressBookPage() {
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [editing, setEditing]     = useState<UserAddress | null>(null);
    const [form, setForm]           = useState(emptyForm);
    const [showForm, setShowForm]   = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);

    const shipping = useShippingAddress();
    const { loadProvinces, loadDistrictsAndWards } = shipping;

    const loadAddresses = useCallback(async () => {
        const data: any = await axiosClient.get('/user-address/get-addresses').catch(() => []);
        setAddresses(data || []);
    }, []);

    useEffect(() => {
        loadAddresses();
        loadProvinces();
    }, [loadAddresses, loadProvinces]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    /** Khi user chọn tỉnh: cập nhật form + load districts */
    const onProvinceChange = async (value: string) => {
        await shipping.onProvinceChange(value);
        const province = shipping.provinces.find(p => p.ProvinceID === parseInt(value));
        setForm(prev => ({
            ...prev,
            provinceId:   value ? parseInt(value) : 0,
            provinceName: province?.ProvinceName ?? '',
            toDistrictId: 0,
            districtName: '',
            toWardCode:   '',
            wardName:     '',
        }));
    };

    /** Khi user chọn quận/huyện: cập nhật form + load wards */
    const onDistrictChange = async (value: string) => {
        await shipping.onDistrictChange(value);
        const district = shipping.districts.find(d => d.DistrictID === parseInt(value));
        setForm(prev => ({
            ...prev,
            toDistrictId: value ? parseInt(value) : 0,
            districtName: district?.DistrictName ?? '',
            toWardCode:   '',
            wardName:     '',
        }));
    };

    /** Khi user chọn phường/xã: cập nhật form */
    const onWardChange = (value: string) => {
        const ward = shipping.wards.find(w => w.WardCode === value);
        setForm(prev => ({
            ...prev,
            toWardCode: value,
            wardName:   ward?.WardName ?? '',
        }));
    };

    // ── Open create / edit ────────────────────────────────────────────────────

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    /**
     * Mở form edit: populate form đầy đủ rồi auto-load
     * dropdown districts + wards từ GHN để đúng với dữ liệu đã lưu.
     */
    const openEdit = async (address: UserAddress) => {
        setEditing(address);
        setForm({
            fullName:     address.fullName,
            phoneNumber:  address.phoneNumber,
            email:        address.email,
            address:      address.address,
            provinceId:   address.provinceId   ?? 0,
            provinceName: address.provinceName  ?? '',
            toDistrictId: address.toDistrictId,
            districtName: address.districtName  ?? '',
            toWardCode:   address.toWardCode,
            wardName:     address.wardName      ?? '',
            isDefault:    address.isDefault,
        });
        setShowForm(true);

        // Auto-load districts và wards nếu có provinceId
        if (address.provinceId && address.toDistrictId) {
            setLoadingEdit(true);
            try {
                await loadDistrictsAndWards(address.provinceId, address.toDistrictId);
            } finally {
                setLoadingEdit(false);
            }
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
    };

    // ── Validation ────────────────────────────────────────────────────────────

    const validate = () => {
        if (!form.fullName.trim())                            return 'Nhập họ tên người nhận';
        if (!/^\d{10}$/.test(form.phoneNumber))              return 'Số điện thoại phải có đúng 10 chữ số';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email không đúng định dạng';
        if (!form.address.trim())                             return 'Nhập địa chỉ chi tiết';
        if (!form.provinceId)                                 return 'Chọn tỉnh / thành phố';
        if (!form.toDistrictId)                               return 'Chọn quận / huyện';
        if (!form.toWardCode)                                 return 'Chọn phường / xã';
        return '';
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validate();
        if (error) { toast.error(error); return; }

        try {
            if (editing) {
                await axiosClient.post('/user-address/update?addressId=' + editing.addressId, form);
                toast.success('Đã cập nhật địa chỉ');
            } else {
                await axiosClient.post('/user-address/create', form);
                toast.success('Đã thêm địa chỉ mới');
            }
            closeForm();
            loadAddresses();
        } catch (err: any) {
            toast.error(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    // ── Actions ───────────────────────────────────────────────────────────────

    const remove = async (addressId: number) => {
        if (!window.confirm('Xóa địa chỉ này?')) return;
        await axiosClient.delete('/user-address/delete?addressId=' + addressId)
            .catch((err: any) => toast.error(err.message));
        toast.success('Đã xóa địa chỉ');
        loadAddresses();
    };

    const setDefault = async (addressId: number) => {
        await axiosClient.post('/user-address/set-default?addressId=' + addressId)
            .catch((err: any) => toast.error(err.message));
        toast.success('Đã đặt làm mặc định');
        loadAddresses();
    };

    // ── Styles ────────────────────────────────────────────────────────────────

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px', border: '1px solid #ddd',
        borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px',
    };
    const buttonStyle: React.CSSProperties = {
        padding: '8px 14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px',
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <h2>Sổ địa chỉ</h2>
                <button onClick={openCreate} style={{ ...buttonStyle, background: '#8B4513', color: '#fff' }}>
                    Thêm địa chỉ
                </button>
            </div>

            {/* ── Form tạo / sửa ── */}
            {showForm && (
                <form onSubmit={submit} style={{ padding: '18px', marginBottom: '20px', background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '14px' }}>
                        {editing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                    </h3>

                    <label style={labelStyle}>Họ tên người nhận:</label>
                    <input
                        value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                        style={inputStyle}
                        placeholder="Nguyễn Văn A"
                    />

                    <label style={labelStyle}>Số điện thoại:</label>
                    <input
                        value={form.phoneNumber}
                        onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                        style={inputStyle}
                        placeholder="0901234567"
                    />

                    <label style={labelStyle}>Email:</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        style={inputStyle}
                        placeholder="example@email.com"
                    />

                    {/* Tỉnh / Thành phố */}
                    <label style={labelStyle}>Tỉnh / Thành phố:</label>
                    <select
                        value={form.provinceId || ''}
                        onChange={e => onProvinceChange(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">-- Chọn tỉnh / thành phố --</option>
                        {shipping.provinces.map(p => (
                            <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                        ))}
                    </select>

                    {/* Quận / Huyện */}
                    <label style={labelStyle}>Quận / Huyện:</label>
                    <select
                        value={form.toDistrictId || ''}
                        disabled={!shipping.districts.length && !loadingEdit}
                        onChange={e => onDistrictChange(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">
                            {loadingEdit ? 'Đang tải...' : '-- Chọn quận / huyện --'}
                        </option>
                        {shipping.districts.map(d => (
                            <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                        ))}
                    </select>

                    {/* Phường / Xã */}
                    <label style={labelStyle}>Phường / Xã:</label>
                    <select
                        value={form.toWardCode}
                        disabled={!shipping.wards.length && !loadingEdit}
                        onChange={e => onWardChange(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">
                            {loadingEdit ? 'Đang tải...' : '-- Chọn phường / xã --'}
                        </option>
                        {shipping.wards.map(w => (
                            <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                        ))}
                    </select>

                    {/* Địa chỉ chi tiết */}
                    <label style={labelStyle}>Địa chỉ chi tiết (số nhà, tên đường, thôn/xóm...):</label>
                    <input
                        value={form.address}
                        onChange={e => setForm({ ...form, address: e.target.value })}
                        style={inputStyle}
                        placeholder="VD: Số 12, Ngõ 5, Đường Nguyễn Trãi"
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '14px' }}>
                        <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={e => setForm({ ...form, isDefault: e.target.checked })}
                        />
                        Đặt làm địa chỉ mặc định
                    </label>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" style={{ ...buttonStyle, background: '#27ae60', color: '#fff' }}>
                            {editing ? 'Cập nhật' : 'Lưu địa chỉ'}
                        </button>
                        <button type="button" onClick={closeForm} style={{ ...buttonStyle, background: '#f0f0f0', color: '#333' }}>
                            Hủy
                        </button>
                    </div>
                </form>
            )}

            {/* ── Danh sách địa chỉ ── */}
            {addresses.length === 0 && (
                <p style={{ color: '#999' }}>Bạn chưa có địa chỉ nào. Thêm địa chỉ để đặt hàng nhanh hơn!</p>
            )}

            <div style={{ display: 'grid', gap: '12px' }}>
                {addresses.map(a => (
                    <div key={a.addressId} style={{ padding: '16px', background: '#fff', border: `1px solid ${a.isDefault ? '#27ae60' : '#eee'}`, borderRadius: '8px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '15px' }}>{a.fullName}</strong>
                            {a.isDefault && (
                                <span style={{ color: '#27ae60', fontWeight: 600, fontSize: '13px', background: '#eafaf1', padding: '2px 10px', borderRadius: '12px' }}>
                                    Mặc định
                                </span>
                            )}
                        </div>
                        <p style={{ margin: '4px 0', color: '#555' }}>📞 {a.phoneNumber} &nbsp;|&nbsp; ✉️ {a.email}</p>
                        {/* Hiển thị địa chỉ đầy đủ bằng tên, không phải mã số */}
                        <p style={{ margin: '4px 0', color: '#333' }}>
                            📍 {a.address}
                            {a.wardName     && `, ${a.wardName}`}
                            {a.districtName && `, ${a.districtName}`}
                            {a.provinceName  && `, ${a.provinceName}`}
                        </p>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                            <button
                                onClick={() => openEdit(a)}
                                style={{ ...buttonStyle, background: '#f0f0f0', color: '#333' }}
                            >
                                Sửa
                            </button>
                            {!a.isDefault && (
                                <button
                                    onClick={() => setDefault(a.addressId)}
                                    style={{ ...buttonStyle, background: '#3498db', color: '#fff' }}
                                >
                                    Đặt mặc định
                                </button>
                            )}
                            <button
                                onClick={() => remove(a.addressId)}
                                style={{ ...buttonStyle, background: '#e74c3c', color: '#fff' }}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
