import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import styles from './LoginPage.module.css';

type RegisterStep = 'register' | 'otp';

const OTP_TTL_SECONDS = 5 * 60;

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', password: '', fullName: '', phoneNumber: '', email: '' });
    const [step, setStep] = useState<RegisterStep>('register');
    const [pendingEmail, setPendingEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [expiresIn, setExpiresIn] = useState(OTP_TTL_SECONDS);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const navigate = useNavigate();

    useEffect(() => {
        if (step !== 'otp') return;

        const timer = window.setInterval(() => {
            setExpiresIn(current => Math.max(0, current - 1));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [step]);

    const validateField = (name: string, value: string) => {
        let fieldError = '';

        switch (name) {
            case 'fullName':
                if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
                    fieldError = 'Họ tên không được chứa số và ký tự đặc biệt';
                }
                break;
            case 'username':
                if (!/^[a-zA-Z0-9]+$/.test(value)) {
                    fieldError = 'Tên đăng nhập không được chứa ký tự đặc biệt';
                }
                break;
            case 'password':
                if (value.length < 6) {
                    fieldError = 'Mật khẩu phải có ít nhất 6 ký tự';
                }
                break;
            case 'phoneNumber':
                if (!/^\d{10}$/.test(value)) {
                    fieldError = 'Số điện thoại phải có đúng 10 chữ số';
                }
                break;
            case 'email':
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                    fieldError = 'Email không đúng định dạng';
                }
                break;
        }

        return fieldError;
    };

    const getErrorMessage = (err: any, fallback: string) => {
        return err.message || err.response?.data?.message || err.response?.data || fallback;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        const fieldError = validateField(name, value);
        setValidationErrors(prev => ({
            ...prev,
            [name]: fieldError,
        }));
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        Object.keys(form).forEach(key => {
            const fieldError = validateField(key, form[key as keyof typeof form]);
            if (fieldError) {
                errors[key] = fieldError;
            }
        });

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/user/sign-up', form);
            setPendingEmail(form.email);
            setOtp('');
            setExpiresIn(OTP_TTL_SECONDS);
            setStep('otp');
            toast.success('OTP đã được gửi tới email của bạn');
        } catch (err: any) {
            setError(getErrorMessage(err, 'Đăng ký thất bại'));
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Vui lòng nhập OTP gồm 6 chữ số');
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post('/user/verify-register-otp', { email: pendingEmail, otp });
            toast.success('Đăng ký thành công, vui lòng đăng nhập');
            navigate('/login');
        } catch (err: any) {
            setError(getErrorMessage(err, 'Xác thực OTP thất bại'));
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setResending(true);
        try {
            await axiosClient.post('/user/resend-register-otp', { email: pendingEmail });
            setOtp('');
            setExpiresIn(OTP_TTL_SECONDS);
            toast.success('OTP mới đã được gửi');
        } catch (err: any) {
            const message = getErrorMessage(err, 'Không thể gửi lại OTP');
            setError(message);
            if (message.includes('REGISTER_OTP_EXPIRED')) {
                setStep('register');
                setPendingEmail('');
                setOtp('');
            }
        } finally {
            setResending(false);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainSeconds = seconds % 60;
        return `${minutes}:${remainSeconds.toString().padStart(2, '0')}`;
    };

    if (step === 'otp') {
        return (
            <div className={styles.container}>
                <h2>Xác thực OTP</h2>
                <p className={styles.description}>Nhập mã OTP đã được gửi tới {pendingEmail}</p>
                <form onSubmit={handleVerifyOtp}>
                    <label>Mã OTP:</label>
                    <input
                        value={otp}
                        onChange={handleOtpChange}
                        inputMode="numeric"
                        maxLength={6}
                        required
                        className={styles.otpInput}
                    />
                    <p className={styles.countdown}>Thời gian còn lại: {formatTime(expiresIn)}</p>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Đang xác thực...' : 'Xác thực'}
                    </button>
                </form>
                <div className={styles.secondaryActions}>
                    <button type="button" onClick={handleResendOtp} disabled={resending}>
                        {resending ? 'Đang gửi...' : 'Gửi lại OTP'}
                    </button>
                    <button type="button" onClick={() => setStep('register')}>
                        Quay lại đăng ký
                    </button>
                </div>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h2>Đăng ký</h2>
            <form onSubmit={handleSubmit}>
                <label>Tên tài khoản:</label>
                <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className={validationErrors.username ? styles.inputError : ''}
                />
                {validationErrors.username && <p className={styles.validationError}>{validationErrors.username}</p>}

                <label>Mật khẩu:</label>
                <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className={validationErrors.password ? styles.inputError : ''}
                />
                {validationErrors.password && <p className={styles.validationError}>{validationErrors.password}</p>}

                <label>Họ và tên:</label>
                <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className={validationErrors.fullName ? styles.inputError : ''}
                />
                {validationErrors.fullName && <p className={styles.validationError}>{validationErrors.fullName}</p>}

                <label>Số điện thoại:</label>
                <input
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    required
                    className={validationErrors.phoneNumber ? styles.inputError : ''}
                />
                {validationErrors.phoneNumber && <p className={styles.validationError}>{validationErrors.phoneNumber}</p>}

                <label>Email:</label>
                <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={validationErrors.email ? styles.inputError : ''}
                />
                {validationErrors.email && <p className={styles.validationError}>{validationErrors.email}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Đang gửi OTP...' : 'Đăng ký'}
                </button>
            </form>
            <p className={styles.link}>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
            {error && <p className={styles.error}>{error}</p>}
        </div>
    );
}
