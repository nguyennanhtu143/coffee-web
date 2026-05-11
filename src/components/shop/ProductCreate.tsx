import React, { useState } from 'react';
import { axiosUpload } from '../../api/axiosClient';
import { toast } from 'react-toastify';

export default function ProductCreate() {
    const [name, setName] = useState(''); const [desc, setDesc] = useState(''); const [file, setFile] = useState<File | null>(null);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = new FormData();
        form.append('productInput', new Blob([JSON.stringify({ name, description: desc })], { type: 'application/json' }));
        if (file) form.append('image', file);
        try { await axiosUpload.post('/product/create', form); toast.success('Tạo thành công!'); setName(''); setDesc(''); setFile(null); }
        catch (err: any) { toast.error(err.message); }
    };

    const inputStyle: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' };

    return (
        <div>
            <h2>Tạo sản phẩm mới</h2>
            <form onSubmit={submit} style={{ maxWidth: '500px', marginTop: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Tên sản phẩm:</label>
                <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Mô tả:</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} style={{ ...inputStyle, minHeight: '100px' }} />
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Ảnh sản phẩm:</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} style={{ marginBottom: '14px' }} />
                <button type="submit" style={{ padding: '12px 30px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' }}>Tạo mới</button>
            </form>
        </div>
    );
}
