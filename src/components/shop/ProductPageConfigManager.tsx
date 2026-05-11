import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';
import { ProductPageConfig } from '../../types';

const defaultConfig: ProductPageConfig = {
    userPageSize: 20,
    adminPageSize: 20,
};

const cardStyle: React.CSSProperties = {
    maxWidth: '560px',
    padding: '24px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
};

export default function ProductPageConfigManager() {
    const [config, setConfig] = useState<ProductPageConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadConfig = async () => {
            setLoading(true);
            setError('');
            try {
                const data: ProductPageConfig = await axiosClient.get('/product/page-config');
                setConfig(data);
            } catch (e: any) {
                const message = e.message || 'Không thể tải cấu hình phân trang';
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        loadConfig();
    }, []);

    const updateField = (field: keyof ProductPageConfig, value: string) => {
        setConfig(prev => ({
            ...prev,
            [field]: Number(value),
        }));
    };

    const validate = () => {
        if (!Number.isInteger(config.userPageSize) || config.userPageSize < 1 || config.userPageSize > 100) {
            return 'Số sản phẩm mỗi trang ở user site phải từ 1 đến 100';
        }
        if (!Number.isInteger(config.adminPageSize) || config.adminPageSize < 1 || config.adminPageSize > 100) {
            return 'Số sản phẩm mỗi trang ở admin site phải từ 1 đến 100';
        }
        return '';
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setSaving(true);
        setError('');
        try {
            const data: ProductPageConfig = await axiosClient.post('/product/page-config', config);
            setConfig(data);
            toast.success('Đã lưu cấu hình phân trang');
        } catch (err: any) {
            const message = err.message || 'Không thể lưu cấu hình phân trang';
            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '16px' }}>Cấu hình phân trang sản phẩm</h2>
            <form onSubmit={save} style={cardStyle}>
                {loading ? (
                    <p>Đang tải cấu hình...</p>
                ) : (
                    <>
                        {error && <p style={{ marginBottom: '16px', color: '#e74c3c' }}>{error}</p>}
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="userPageSize" style={labelStyle}>Số sản phẩm mỗi trang ở user site</label>
                            <input
                                id="userPageSize"
                                type="number"
                                min={1}
                                max={100}
                                value={config.userPageSize}
                                onChange={e => updateField('userPageSize', e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="adminPageSize" style={labelStyle}>Số sản phẩm mỗi trang ở admin site</label>
                            <input
                                id="adminPageSize"
                                type="number"
                                min={1}
                                max={100}
                                value={config.adminPageSize}
                                onChange={e => updateField('adminPageSize', e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: '4px',
                                backgroundColor: saving ? '#999' : '#27ae60',
                                color: '#fff',
                                cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
