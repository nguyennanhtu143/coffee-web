import React, { useState } from 'react';
import { ProductSize } from '../../types';
import { axiosUpload } from '../../api/axiosClient';
import StarRating from '../common/StarRating';
import { toast } from 'react-toastify';

interface Props {
    productId: string;
    sizes: ProductSize[];
    onCommentAdded: () => void;
}

export default function CommentForm({ productId, sizes, onCommentAdded }: Props) {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(0);
    const [sizeId, setSizeId] = useState('');
    const [images, setImages] = useState<FileList | null>(null);

    const handleSubmit = async () => {
        if (!sizeId) { toast.error('Vui lòng chọn size!'); return; }
        if (!comment.trim()) { toast.error('Vui lòng nhập bình luận!'); return; }
        if (rating <= 0) { toast.error('Vui lòng chọn số sao!'); return; }

        const formData = new FormData();
        formData.append('commentInput', JSON.stringify({ productId: parseInt(productId), productSizeId: parseInt(sizeId), comment, rating }));
        if (images) { for (let i = 0; i < images.length; i++) formData.append('images', images[i]); }

        try {
            await axiosUpload.post('/comment/create', formData);
            toast.success('Đánh giá đã được thêm!');
            setComment(''); setRating(0); setSizeId(''); setImages(null);
            onCommentAdded();
        } catch (err: any) { toast.error(err.message || 'Lỗi'); }
    };

    return (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '14px' }}>Chọn size đánh giá:</label>
                <select value={sizeId} onChange={e => setSizeId(e.target.value)} style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}>
                    <option value="">-- Chọn size --</option>
                    {sizes.map(s => <option key={s.id} value={s.id}>{s.size} - {s.price.toLocaleString('vi-VN')}₫</option>)}
                </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Viết bình luận..."
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px', boxSizing: 'border-box', fontSize: '14px' }} />
            </div>
            <div style={{ marginBottom: '12px' }}>
                <label style={{ marginRight: '8px', fontSize: '14px', fontWeight: 500 }}>Đánh giá:</label>
                <StarRating value={rating} onChange={setRating} />
            </div>
            <div style={{ marginBottom: '12px' }}>
                <input type="file" accept="image/*" multiple onChange={e => setImages(e.target.files)} />
            </div>
            <button onClick={handleSubmit}
                style={{ padding: '10px 24px', background: '#8B4513', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                Thêm bình luận
            </button>
        </div>
    );
}
