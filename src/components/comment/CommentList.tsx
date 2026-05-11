import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { Comment } from '../../types';
import CommentItem from './CommentItem';
import Pagination from '../common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function CommentList({ productId }: { productId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const { user } = useAuth();

    const load = useCallback(async (p: number) => {
        try {
            const data: any = await axiosClient.get('/comment/get-comments?productId=' + productId + '&page=' + p + '&size=5');
            if (data?.content) { setComments(data.content); setTotalPages(data.totalPages); }
        } catch (e) { console.error(e); }
    }, [productId]);

    useEffect(() => { load(page); }, [page, load]);

    const handleDelete = async (commentId: number) => {
        if (!window.confirm('Xóa bình luận này?')) return;
        try { await axiosClient.delete('/comment/delete?commentId=' + commentId); toast.success('Đã xóa'); load(page); }
        catch (e: any) { toast.error(e.message); }
    };

    return (
        <div>
            {comments.length === 0 && <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>Chưa có bình luận</p>}
            {comments.map(c => <CommentItem key={c.id} comment={c} currentUserId={user?.id} onDelete={handleDelete} />)}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
    );
}
