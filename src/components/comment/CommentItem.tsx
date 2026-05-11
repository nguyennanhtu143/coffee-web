import React from 'react';
import { Comment } from '../../types';
import SizeTag from '../common/SizeTag';

interface Props {
    comment: Comment;
    currentUserId?: number;
    onDelete?: (id: number) => void;
}

export default function CommentItem({ comment, currentUserId, onDelete }: Props) {
    const isOwner = currentUserId != null && comment.userId === currentUserId;

    return (
        <div style={{ borderBottom: '1px solid #eee', padding: '16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <img src={comment.image || '/assets/img/logo.webp'} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                    <strong style={{ fontSize: '14px' }}>{comment.nameUser}</strong>
                    {comment.size && <SizeTag size={'Size ' + comment.size} />}
                    <div style={{ color: '#f0a500', fontSize: '14px' }}>
                        {'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}
                    </div>
                    <span style={{ fontSize: '12px', color: '#999' }}>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                {isOwner && onDelete && (
                    <button onClick={() => onDelete(comment.commentId)}
                        style={{ marginLeft: 'auto', fontSize: '12px', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer' }}>Xóa</button>
                )}
            </div>
            <p style={{ fontSize: '14px', margin: '4px 0' }}>{comment.comment}</p>
            {comment.commentImages && comment.commentImages.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {comment.commentImages.map((img, i) => (
                        <img key={i} src={img.trim()} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    ))}
                </div>
            )}
        </div>
    );
}
