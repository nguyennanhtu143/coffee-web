import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function ChangePasswordPage() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!oldPassword) {
            toast.error('Nhập mật khẩu hiện tại');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                process.env.REACT_APP_API_BASE_URL + '/user/change-password',
                { oldPassword, newPassword },
                { headers: { Authorization: 'Bearer ' + localStorage.getItem('accessToken') } }
            );
            toast.success('Đổi mật khẩu thành công!');
            navigate('/profile');
        } catch (err: any) {
            if (err.response?.status === 400) {
                toast.error(err.response?.data?.message || err.response?.data || 'Mật khẩu hiện tại không đúng');
                return;
            }
            toast.error(err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại');
        } finally {
            setLoading(false);
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

    return (
        <div style={{ maxWidth: '460px', margin: '0 auto', padding: '30px' }}>
            <form onSubmit={changePassword} style={{ padding: '24px', background: '#fff', border: '1px solid #eee', borderRadius: '8px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Đổi mật khẩu</h2>
                <label style={labelStyle}>Mật khẩu hiện tại:</label>
                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Mật khẩu mới:</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
                <label style={labelStyle}>Xác nhận mật khẩu mới:</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '12px', background: loading ? '#aaa' : '#8B4513', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                    {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    style={{ width: '100%', padding: '12px', marginTop: '10px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }}
                >
                    Quay lại hồ sơ
                </button>
            </form>
        </div>
    );
}
