import React from 'react';

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
    if (totalPages < 1) return null;
    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
            <button disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}
                style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', background: currentPage === 0 ? '#eee' : '#4CAF50', color: '#fff' }}>
                Trước
            </button>
            <span style={{ padding: '8px 12px', fontSize: '14px' }}>Trang {currentPage + 1}/{totalPages}</span>
            <button disabled={currentPage >= totalPages - 1} onClick={() => onPageChange(currentPage + 1)}
                style={{ padding: '8px 16px', border: '1px solid #ddd', borderRadius: '4px', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer', background: currentPage >= totalPages - 1 ? '#eee' : '#4CAF50', color: '#fff' }}>
                Tiếp theo
            </button>
        </div>
    );
}
