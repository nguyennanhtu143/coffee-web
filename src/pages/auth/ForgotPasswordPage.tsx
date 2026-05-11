import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import styles from './LoginPage.module.css';

type ForgotStep = 'email' | 'otp' | 'password';

export default function ForgotPasswordPage() {
    const [step, setStep] = useState<ForgotStep>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const getErrorMessage = (err: any, fallback: string) => {
        return err.message || err.response?.data?.message || err.response?.data || fallback;
    };

    const isValidEmail = (value: string) => {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    };

    const requestOtp = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError('');

        if (!isValidEmail(email)) {
            setError('Email không đúng định dạng');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/user/forgot-password', { email });
            setStep('otp');
            setOtp('');
            toast.success('OTP đã được gửi tới email của bạn');
        } catch (err: any) {
            setError(getErrorMessage(err, 'Không thể gửi OTP'));
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setError('');
        setResending(true);
        try {
            await axiosClient.post('/user/forgot-password', { email });
            setOtp('');
            toast.success('OTP mới đã được gửi');
        } catch (err: any) {
            setError(getErrorMessage(err, 'Không thể gửi lại OTP'));
        } finally {
            setResending(false);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Vui lòng nhập OTP gồm 6 chữ số');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/user/verify-password-reset-otp', { email, otp });
            setStep('password');
            toast.success('OTP đã được xác thực');
        } catch (err: any) {
            setError(getErrorMessage(err, 'Xác thực OTP thất bại'));
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/user/reset-password', { email, newPassword });
            toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập');
            navigate('/login');
        } catch (err: any) {
            setError(getErrorMessage(err, 'Đặt lại mật khẩu thất bại'));
        } finally {
            setLoading(false);
        }
    };

    if (step === 'otp') {
        return (
            <div className={styles.container}>
                <h2>Xác thực OTP</h2>
                <p className={styles.description}>Nhập OTP đã được gửi tới {email}</p>
                <form onSubmit={verifyOtp}>
                    <label>Mã OTP:</label>
                    <input value={otp} onChange={handleOtpChange} inputMode="numeric" maxLength={6} required className={styles.otpInput} />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                    </button>
                </form>
                <div className={styles.secondaryActions}>
                    <button type="button" onClick={resendOtp} disabled={resending}>
                        {resending ? 'Đang gửi...' : 'Gửi lại OTP'}
                    </button>
                    <button type="button" onClick={() => setStep('email')}>
                        Đổi email
                    </button>
                </div>
                <p className={styles.link}><Link to="/login">Quay lại đăng nhập</Link></p>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        );
    }

    if (step === 'password') {
        return (
            <div className={styles.container}>
                <h2>Đặt mật khẩu mới</h2>
                <p className={styles.description}>OTP đã được xác thực. Nhập mật khẩu mới cho {email}</p>
                <form onSubmit={resetPassword}>
                    <label>Mật khẩu mới:</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                    <label>Xác nhận mật khẩu mới:</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>
                <p className={styles.link}><Link to="/login">Quay lại đăng nhập</Link></p>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Quên mật khẩu</h2>
            <p className={styles.description}>Nhập email tài khoản để nhận mã OTP đặt lại mật khẩu.</p>
            <form onSubmit={requestOtp}>
                <label>Email:</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang gửi OTP...' : 'Gửi OTP'}
                </button>
            </form>
            <p className={styles.link}><Link to="/login">Quay lại đăng nhập</Link></p>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}
