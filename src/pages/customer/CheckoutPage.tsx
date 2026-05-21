import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import useShippingAddress from '../../hooks/useShippingAddress';
import { ApplyCouponResult, UserAddress } from '../../types';
import SizeTag from '../../components/common/SizeTag';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
    const [sp] = useSearchParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const shipping = useShippingAddress();
    const { calculateFee, loadProvinces } = shipping;
    const provinceRef = useRef<HTMLSelectElement>(null);
    const districtRef = useRef<HTMLSelectElement>(null);
    const wardRef = useRef<HTMLSelectElement>(null);

    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [addressMode, setAddressMode] = useState<'saved' | 'manual'>('manual');
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [saveManualAddress, setSaveManualAddress] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [method, setMethod] = useState('cash');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupons, setAppliedCoupons] = useState<ApplyCouponResult[]>([]);

    const products = sp.getAll('products[]').map(p => JSON.parse(p));
    const selectedAddress = addresses.find(a => String(a.addressId) === selectedAddressId);
    const productTotal = products.reduce((s: number, p: any) => s + p.totalPrice, 0);
    const totalProductDiscount = appliedCoupons.filter(c => !c.freeShip).reduce((sum, c) => sum + c.discountAmount, 0);
    const finalProduct = Math.max(0, productTotal - totalProductDiscount);
    const freeShipCoupon = appliedCoupons.find(c => c.freeShip);
    let actualShippingFee = shipping.shippingFee;
    if (freeShipCoupon) {
        actualShippingFee = freeShipCoupon.maxShippingDiscount && freeShipCoupon.maxShippingDiscount < shipping.shippingFee
            ? shipping.shippingFee - freeShipCoupon.maxShippingDiscount
            : 0;
    }
    const shippingDiscount = shipping.shippingFee - actualShippingFee;
    const grand = finalProduct + actualShippingFee;

    const loadAddresses = useCallback(async () => {
        const data: any = await axiosClient.get('/user-address/get-addresses').catch(() => []);
        const list: UserAddress[] = data || [];
        setAddresses(list);
        if (list.length > 0) {
            const defaultAddress = list.find(a => a.isDefault) || list[0];
            setAddressMode('saved');
            setSelectedAddressId(String(defaultAddress.addressId));
            calculateFee(defaultAddress.toDistrictId, defaultAddress.toWardCode);
        }
    }, [calculateFee]);

    // Initial checkout bootstrap only: load profile, provinces, and saved addresses once.
    useEffect(() => {
        loadProvinces();
        axiosClient.get('/user/get-information').then((d: any) => {
            if (d) { setName(d.fullName || ''); setEmail(d.email || ''); setPhone(d.phoneNumber || ''); }
        }).catch(() => {});
        loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const chooseSavedAddress = (addressId: string) => {
        setSelectedAddressId(addressId);
        const nextAddress = addresses.find(a => String(a.addressId) === addressId);
        if (nextAddress) {
            calculateFee(nextAddress.toDistrictId, nextAddress.toWardCode);
        }
    };

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        if (appliedCoupons.some(c => c.code.toUpperCase() === couponCode.trim().toUpperCase())) {
            toast.error('Mã này đã được áp dụng');
            return;
        }
        try {
            const r: any = await axiosClient.post('/coupon/apply?code=' + couponCode + '&orderTotal=' + productTotal);
            if (r.freeShip && appliedCoupons.some(c => c.freeShip)) {
                toast.error('Chỉ được áp dụng 1 mã miễn phí ship');
                return;
            }
            setAppliedCoupons([...appliedCoupons, r]);
            setCouponCode('');
            toast.success('Áp dụng mã ' + r.code + ' thành công!');
        } catch (e: any) { toast.error(e.message); }
    };

    const removeCoupon = (code: string) => {
        setAppliedCoupons(appliedCoupons.filter(c => c.code !== code));
        toast.success('Đã xóa mã ' + code);
    };

    const createManualAddress = async () => {
        // Tìm tên tỉnh/huyện/xã từ danh sách GHN đã load
        const province = shipping.provinces.find(p => p.ProvinceID === shipping.selectedProvinceId);
        const district = shipping.districts.find(d => d.DistrictID === shipping.selectedDistrictId);
        const ward     = shipping.wards.find(w => w.WardCode === shipping.selectedWardCode);

        const body = {
            fullName:     name,
            phoneNumber:  phone,
            email,
            address,
            provinceId:   shipping.selectedProvinceId ?? 0,
            provinceName: province?.ProvinceName ?? '',
            toDistrictId: shipping.selectedDistrictId!,
            districtName: district?.DistrictName ?? '',
            toWardCode:   shipping.selectedWardCode!,
            wardName:     ward?.WardName ?? '',
            isDefault:    addresses.length === 0,
        };
        const created: any = await axiosClient.post('/user-address/create', body);
        if (created?.addressId) return created.addressId;

        const reloaded: any = await axiosClient.get('/user-address/get-addresses').catch(() => []);
        const match = (reloaded || []).find((a: UserAddress) =>
            a.address === body.address &&
            a.toDistrictId === body.toDistrictId &&
            a.toWardCode === body.toWardCode
        );
        return match?.addressId;
    };

    const buildManualFullAddress = () => {
        return address + ', ' + (wardRef.current?.selectedOptions[0]?.text || '') + ', ' + (districtRef.current?.selectedOptions[0]?.text || '') + ', ' + (provinceRef.current?.selectedOptions[0]?.text || '');
    };

    const submit = async () => {
        let orderAddressId: number | undefined;

        if (addressMode === 'saved') {
            if (!selectedAddress) {
                toast.error('Chọn địa chỉ giao hàng');
                return;
            }
            orderAddressId = selectedAddress.addressId;
        } else {
            if (!shipping.selectedDistrictId || !shipping.selectedWardCode) { toast.error('Chọn đầy đủ địa chỉ!'); return; }
            if (!address.trim()) { toast.error('Nhập địa chỉ chi tiết!'); return; }
            if (!name.trim() || !phone.trim() || !email.trim()) { toast.error('Nhập đầy đủ thông tin người nhận!'); return; }
            if (saveManualAddress) {
                try {
                    orderAddressId = await createManualAddress();
                    if (!orderAddressId) {
                        toast.error('Không thể lưu địa chỉ mới');
                        return;
                    }
                } catch (e: any) {
                    toast.error(e.message || 'Không thể lưu địa chỉ mới');
                    return;
                }
            }
        }

        const orderInput: any = {
            paymentMethod: method,
            totalPrice: grand,
            shippingFee: shipping.shippingFee,
            productOrderInputs: products.map((p: any) => ({ cartId: p.cartId, productSizeId: p.productSizeId, nameProduct: p.nameProduct, size: p.size || '', price: p.price, image: p.imageUrl, quantityOrder: p.quantityOrder, totalPrice: p.totalPrice })),
        };

        if (orderAddressId) {
            orderInput.addressId = orderAddressId;
        } else {
            orderInput.fullName = name;
            orderInput.phoneNumber = phone;
            orderInput.email = email;
            orderInput.address = buildManualFullAddress();
            orderInput.toDistrictId = shipping.selectedDistrictId;
            orderInput.toWardCode = shipping.selectedWardCode;
        }

        try {
            const data: any = await axiosClient.post('/order', orderInput);
            if (!data) return;
            const orderId = data.orderId;
            const payResp = await fetch(process.env.REACT_APP_API_BASE_URL + '/payment?orderId=' + orderId + '&method=' + method, {
                method: 'POST',
                headers: { Authorization: 'Bearer ' + token },
            });

            if (!payResp.ok) {
                const errText = await payResp.text();
                toast.error('Lỗi thanh toán: ' + errText);
                return;
            }

            let payResult = await payResp.text();
            if (payResult.startsWith('"') && payResult.endsWith('"')) {
                try { payResult = JSON.parse(payResult); } catch (e) {}
            }

            if (method === 'sepay') {
                localStorage.setItem('bankTransferInfo', payResult);
                navigate('/bank-transfer');
            } else {
                toast.success('Đặt hàng thành công!');
                setTimeout(() => navigate('/orders'), 1500);
            }
        } catch (e: any) {
            toast.error('Lỗi: ' + e.message);
        }
    };

    const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' };
    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' };

    return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '24px' }}>Thanh Toán</h1>

            <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Địa chỉ giao hàng</h2>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <button onClick={() => setAddressMode('saved')} disabled={addresses.length === 0} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: addressMode === 'saved' ? '#8B4513' : '#fff', color: addressMode === 'saved' ? '#fff' : '#333', cursor: addresses.length ? 'pointer' : 'not-allowed' }}>Dùng địa chỉ đã lưu</button>
                    <button onClick={() => setAddressMode('manual')} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: addressMode === 'manual' ? '#8B4513' : '#fff', color: addressMode === 'manual' ? '#fff' : '#333', cursor: 'pointer' }}>Nhập địa chỉ mới</button>
                </div>

                {addressMode === 'saved' && (
                    <div>
                        <label style={labelStyle}>Chọn địa chỉ:</label>
                        <select value={selectedAddressId} onChange={e => chooseSavedAddress(e.target.value)} style={inputStyle}>
                            {addresses.map(a => {
                                const fullLoc = [a.wardName, a.districtName, a.provinceName].filter(Boolean).join(', ');
                                return (
                                    <option key={a.addressId} value={a.addressId}>
                                        {a.fullName} - {a.phoneNumber} - {a.address}{fullLoc ? ', ' + fullLoc : ''}{a.isDefault ? ' (Mặc định)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                        {selectedAddress && (
                            <div style={{ padding: '12px', background: '#fff', border: '1px solid #eee', borderRadius: '8px', marginBottom: '14px' }}>
                                <strong>{selectedAddress.fullName}</strong>
                                <p style={{ margin: '6px 0' }}>{selectedAddress.phoneNumber} | {selectedAddress.email}</p>
                                <p style={{ margin: 0 }}>
                                    📍 {selectedAddress.address}
                                    {selectedAddress.wardName     && `, ${selectedAddress.wardName}`}
                                    {selectedAddress.districtName && `, ${selectedAddress.districtName}`}
                                    {selectedAddress.provinceName  && `, ${selectedAddress.provinceName}`}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {addressMode === 'manual' && (
                    <>
                        <label style={labelStyle}>Họ tên:</label><input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                        <label style={labelStyle}>Email:</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                        <label style={labelStyle}>Số điện thoại:</label><input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                        <label style={labelStyle}>Tỉnh / Thành phố:</label>
                        <select
                            ref={provinceRef}
                            onChange={e => shipping.onProvinceChange(e.target.value)}
                            style={inputStyle}
                        >
                            <option value="">-- Chọn --</option>
                            {shipping.provinces.map(p => (
                                <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                            ))}
                        </select>
                        <label style={labelStyle}>Khu vực:</label>
                        <select ref={districtRef} disabled={!shipping.districts.length} onChange={e => shipping.onDistrictChange(e.target.value)} style={inputStyle}>
                            <option value="">-- Chọn --</option>
                            {shipping.districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
                        </select>
                        <label style={labelStyle}>Phường / Xã:</label>
                        <select ref={wardRef} disabled={!shipping.wards.length} onChange={e => shipping.onWardChange(e.target.value)} style={inputStyle}>
                            <option value="">-- Chọn --</option>
                            {shipping.wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
                        </select>
                        <label style={labelStyle}>Địa chỉ chi tiết:</label><input value={address} onChange={e => setAddress(e.target.value)} placeholder="Số nhà, tên đường..." style={inputStyle} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', fontSize: '14px' }}>
                            <input type="checkbox" checked={saveManualAddress} onChange={e => setSaveManualAddress(e.target.checked)} />
                            Lưu địa chỉ này
                        </label>
                    </>
                )}

                {shipping.shippingFee > 0 && <p style={{ background: '#f0f8ff', padding: '10px', borderRadius: '6px' }}>Phí vận chuyển: <strong>{shipping.shippingFee.toLocaleString('vi-VN')}₫</strong></p>}
                {shipping.loadingFee && <p style={{ color: '#999' }}>Đang tính phí...</p>}
            </section>

            <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Sản phẩm</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
                    <thead><tr style={{ backgroundColor: '#f8f9fa', fontSize: '15px' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Sản phẩm</th>
                        <th style={{ padding: '8px' }}>Giá</th><th style={{ padding: '8px' }}>SL</th><th style={{ padding: '8px' }}>Tổng</th>
                    </tr></thead>
                    <tbody>{products.map((p: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '8px' }}>{p.nameProduct} {p.size && <SizeTag size={p.size} />}</td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>{p.price?.toLocaleString('vi-VN')}₫</td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>{p.quantityOrder}</td>
                            <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600 }}>{p.totalPrice?.toLocaleString('vi-VN')}₫</td>
                        </tr>
                    ))}</tbody>
                </table>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Mã giảm giá" style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    <button onClick={applyCoupon} style={{ padding: '8px 16px', background: '#8B4513', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Áp dụng</button>
                </div>
                {appliedCoupons.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                        {appliedCoupons.map(c => (
                            <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', marginBottom: '6px', border: '1px solid #bbf7d0' }}>
                                <div>
                                    <strong style={{ color: '#166534' }}>{c.code}</strong>
                                    {c.freeShip
                                        ? <span style={{ color: '#3498db', marginLeft: '8px' }}>Miễn phí ship{c.maxShippingDiscount ? ' (tối đa ' + c.maxShippingDiscount.toLocaleString('vi-VN') + '₫)' : ''}</span>
                                        : <span style={{ color: '#166534', marginLeft: '8px' }}>-{c.discountAmount?.toLocaleString('vi-VN')}₫</span>
                                    }
                                </div>
                                <button onClick={() => removeCoupon(c.code)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '16px' }}>×</button>
                            </div>
                        ))}
                    </div>
                )}
                <div style={{ fontSize: '15px', marginTop: '8px' }}>
                    <p>Tiền SP: <strong>{productTotal.toLocaleString('vi-VN')}₫</strong>{totalProductDiscount > 0 && <span style={{ color: 'green', marginLeft: '8px' }}>(-{totalProductDiscount.toLocaleString('vi-VN')}₫)</span>}</p>
                    <p>Phí ship: <strong>{shipping.shippingFee > 0 ? shipping.shippingFee.toLocaleString('vi-VN') + '₫' : '0₫'}</strong>{shippingDiscount > 0 && <span style={{ color: '#3498db', marginLeft: '8px' }}>(-{shippingDiscount.toLocaleString('vi-VN')}₫)</span>}</p>
                    <p style={{ fontSize: '18px', fontWeight: 700, marginTop: '8px' }}>Tổng: {grand.toLocaleString('vi-VN')}₫</p>
                </div>
            </section>

            <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Phương thức thanh toán</h2>
                <select value={method} onChange={e => setMethod(e.target.value)} style={inputStyle}>
                    <option value="cash">Tiền mặt (COD)</option>
                    <option value="sepay">Chuyển khoản / QR Code</option>
                </select>
            </section>

            <button onClick={submit} style={{ width: '100%', padding: '14px', fontSize: '16px', background: '#8B4513', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Xác nhận đơn hàng
            </button>
        </div>
    );
}
