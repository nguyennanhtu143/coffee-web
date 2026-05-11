import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { BankTransferInfo } from '../../types';
import { toast } from 'react-toastify';

export default function BankTransferPage() {
    const navigate = useNavigate();
    const [info, setInfo] = useState<BankTransferInfo | null>(null);
    const [paid, setPaid] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const dataRef = useRef<BankTransferInfo | null>(null);

    // Đọc localStorage 1 lần, lưu vào ref (không bị mất khi StrictMode re-mount)
    if (!dataRef.current) {
        const raw = localStorage.getItem('bankTransferInfo');
        if (raw) {
            try {
                dataRef.current = JSON.parse(raw);
                localStorage.removeItem('bankTransferInfo');
            } catch (e) { /* ignore */ }
        }
    }

    useEffect(() => {
        const parsed = dataRef.current;
        if (!parsed) { navigate('/orders'); return; }
        setInfo(parsed);

        const checkPayment = async () => {
            try {
                console.log('[Polling] Checking order #' + parsed.orderId);
                const r: any = await axiosClient.get('/payment/check-status?orderId=' + parsed.orderId);
                console.log('[Polling] Response:', r);
                if (r && r.paid === true) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setPaid(true);
                    toast.success('Thanh toán thành công!');
                    setTimeout(() => navigate('/orders'), 3000);
                }
            } catch (e: any) {
                console.error('[Polling] Error:', e.message);
            }
        };

        checkPayment();
        intervalRef.current = setInterval(checkPayment, 5000);

        const timeout = setTimeout(() => { if (intervalRef.current) clearInterval(intervalRef.current); }, 10 * 60 * 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            clearTimeout(timeout);
        };
    }, [navigate]);

    const cancel = async () => {
        if (!info || paid || !window.confirm('Hủy thanh toán?')) return;
        intervalRef.current && clearInterval(intervalRef.current);
        try {
            await axiosClient.post('/order/cancel', { orderId: info.orderId, reason: 'Khách hủy thanh toán' });
            toast.success('Đã hủy. Giỏ hàng vẫn còn.');
            setTimeout(() => navigate('/cart'), 1500);
        } catch (e: any) { toast.error(e.message); }
    };

    const copy = (text: string) => navigator.clipboard.writeText(text).then(() => toast.success('Đã sao chép: ' + text));

    if (!info) return null;

    const tdLabel: React.CSSProperties = { padding: '12px 8px', color: '#888', fontSize: '14px' };
    const tdValue: React.CSSProperties = { padding: '12px 8px', fontWeight: 600, textAlign: 'right', fontSize: '14px' };
    const copyBtn: React.CSSProperties = { background: 'none', border: '1px solid #8B4513', color: '#8B4513', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', marginLeft: '8px' };

    return (
        <div style={{ maxWidth: '520px', margin: '40px auto', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ background: '#8B4513', color: '#fff', padding: '20px', textAlign: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px' }}>Chuyển khoản thanh toán</h2>
            </div>
            <div style={{ padding: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <img src={info.qrUrl} alt="QR" style={{ width: '240px', height: '240px', border: '2px solid #eee', borderRadius: '8px' }} />
                    <p style={{ color: '#666', fontSize: '15px', marginTop: '8px' }}>Quét mã QR bằng app ngân hàng</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={tdLabel}>Ngân hàng</td><td style={tdValue}>{info.bankName}</td></tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={tdLabel}>Số tài khoản</td><td style={tdValue}>{info.accountNumber} <button style={copyBtn} onClick={() => copy(info.accountNumber)}>Copy</button></td></tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={tdLabel}>Chủ TK</td><td style={tdValue}>{info.accountName}</td></tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f0' }}><td style={tdLabel}>Số tiền</td><td style={{ ...tdValue, color: '#e74c3c', fontSize: '18px' }}>{info.amount?.toLocaleString('vi-VN')} VND</td></tr>
                    <tr><td style={tdLabel}>Nội dung CK</td><td style={tdValue}><span style={{ background: '#fdf2e9', color: '#8B4513', padding: '4px 8px', borderRadius: '4px' }}>{info.transferContent}</span> <button style={copyBtn} onClick={() => copy(info.transferContent)}>Copy</button></td></tr>
                </tbody></table>

                <div style={{ textAlign: 'center', padding: '16px', marginTop: '16px', borderRadius: '8px', background: paid ? '#d4edda' : '#f8f9fa' }}>
                    {paid
                        ? <><span style={{ fontSize: '32px' }}>✔</span><p style={{ color: '#155724', fontWeight: 600, fontSize: '18px' }}>Thanh toán thành công!</p></>
                        : <span style={{ color: '#666' }}>⏳ Đang chờ thanh toán...</span>
                    }
                </div>

                <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '8px', padding: '12px', marginTop: '16px', fontSize: '15px', color: '#856404' }}>
                    <strong>Lưu ý:</strong> Nhập chính xác nội dung CK. Hệ thống tự xác nhận trong vài giây sau khi nhận tiền.
                </div>

                {!paid && (
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <button onClick={cancel} style={{ padding: '12px 24px', background: '#f0f0f0', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Hủy thanh toán</button>
                    </div>
                )}
            </div>
        </div>
    );
}
