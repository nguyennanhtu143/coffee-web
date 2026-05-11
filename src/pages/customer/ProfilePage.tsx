import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { axiosUpload } from '../../api/axiosClient';
import { toast } from 'react-toastify';

export default function ProfilePage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        axiosClient.get('/user/get-information').then((d: any) => {
            if (d) {
                setName(d.fullName || '');
                setEmail(d.email || '');
                setPhone(d.phoneNumber || '');
                setGender(d.gender || '');
                setImageUrl(d.imageUrl || '');
            }
        }).catch(() => {});
    }, []);

    const update = async () => {
        const form = new FormData();
        form.append('changeInfoUser', JSON.stringify({ fullName: name, gender, email, phoneNumber: phone }));
        if (file) form.append('image', file);
        try {
            await axiosUpload.post('/user/change-information', form);
            toast.success('Cập nhật thành công!');
            const d: any = await axiosClient.get('/user/get-information');
            if (d) setImageUrl(d.imageUrl || '');
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
        marginBottom: '14px',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '6px',
        fontWeight: 500,
        fontSize: '14px',
    };
    const buttonStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        background: '#8B4513',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        cursor: 'pointer',
    };

    return (
        <div style={{ maxWidth: '520px', margin: '0 auto', padding: '30px' }}>
            <section style={{ padding: '24px', background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Thông tin cá nhân</h2>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <img src={imageUrl || '/assets/img/logo.webp'} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ddd' }} />
                </div>
                <label style={labelStyle}>Họ tên:</label>
                <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Số điện thoại:</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Giới tính:</label>
                <select value={gender} onChange={e => setGender(e.target.value)} style={inputStyle}>
                    <option value="">-- Chọn --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                </select>
                <label style={labelStyle}>Đổi ảnh:</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ marginBottom: '20px' }} />
                <button onClick={update} style={buttonStyle}>Cập nhật</button>
                <button
                    onClick={() => navigate('/change-password')}
                    style={{ ...buttonStyle, marginTop: '10px', background: '#f0f0f0', color: '#333' }}
                >
                    Đổi mật khẩu
                </button>
            </section>
        </div>
    );
}
