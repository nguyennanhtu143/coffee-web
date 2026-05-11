import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import styles from './LoginPage.module.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const resp = await axios.post(process.env.REACT_APP_API_BASE_URL + '/user/log-in', { username, password });
            const data = resp.data;
            if (data.accessToken) {
                login(data.accessToken, data.isShop);
                toast.success('Đăng nhập thành công!');
                navigate(data.isShop ? '/shop/products' : '/');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className={styles.container}>
            <h2>Đăng nhập</h2>
            <form onSubmit={handleSubmit}>
                <label>Tên tài khoản:</label>
                <input value={username} onChange={e => setUsername(e.target.value)} required />
                <label>Mật khẩu:</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit">Đăng nhập</button>
            </form>
            <p className={styles.link}><Link to="/forgot-password">Quên mật khẩu?</Link></p>
            <p className={styles.link}>Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}
