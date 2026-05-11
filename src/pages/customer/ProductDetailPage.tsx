import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Product, ProductSize } from '../../types';
import SizeSelector from '../../components/common/SizeSelector';
import CommentForm from '../../components/comment/CommentForm';
import CommentList from '../../components/comment/CommentList';
import ProductList from '../../components/product/ProductList';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>();
    const { isLoggedIn } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [commentKey, setCommentKey] = useState(0);

    useEffect(() => {
        axiosClient.get('/product/get-details?productId=' + productId)
            .then((data: any) => { setProduct(data); if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]); })
            .catch(() => toast.error('Lỗi tải sản phẩm'));
    }, [productId]);

    const addToCart = async () => {
        if (!isLoggedIn) { toast.error('Vui lòng đăng nhập!'); return; }
        if (!selectedSize) { toast.error('Vui lòng chọn size!'); return; }
        try {
            await axiosClient.post('/cart/add', { productSizeId: selectedSize.id, quantityOrder: quantity });
            toast.success('Đã thêm vào giỏ hàng!');
        } catch (e: any) { toast.error(e.message); }
    };

    if (!product) return <div style={{ textAlign: 'center', padding: '60px' }}>Đang tải...</div>;

    const price = selectedSize ? selectedSize.price.toLocaleString('vi-VN') + '₫' : (product.minPrice ? 'Từ ' + product.minPrice.toLocaleString('vi-VN') + '₫' : 'Liên hệ');

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <img src={product.image} alt={product.name} style={{ width: '100%', borderRadius: '8px' }} />
                </div>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h1 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '36px', color: '#f7b634', marginBottom: '10px' }}>{product.name}</h1>
                    <p style={{ fontSize: '24px', fontWeight: 600, color: '#e74c3c', marginBottom: '16px' }}>{price}</p>
                    {product.averageRatting != null && product.averageRatting > 0 && (
                        <p style={{ color: '#f0a500', marginBottom: '12px' }}>Đánh giá: {product.averageRatting}/5 ★</p>
                    )}
                    {product.sizes && <SizeSelector sizes={product.sizes} onSelect={setSelectedSize} />}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' }}>-</button>
                        <input value={quantity} readOnly style={{ width: '50px', textAlign: 'center', fontSize: '16px', padding: '6px' }} />
                        <button onClick={() => setQuantity(quantity + 1)} style={{ width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer' }}>+</button>
                    </div>
                    <button onClick={addToCart}
                        style={{ padding: '14px 40px', background: '#8B4513', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', cursor: 'pointer' }}>
                        Đặt Hàng
                    </button>
                </div>
            </div>

            {product.description && (
                <div style={{ marginBottom: '40px' }}>
                    <h2 style={{ marginBottom: '12px' }}>Mô tả sản phẩm</h2>
                    <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#555' }}>{product.description}</p>
                </div>
            )}

            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: '32px', color: '#f7b634', textAlign: 'center', marginBottom: '16px' }}>Sản phẩm khác</h2>
                <ProductList apiUrl="/product/get-products" pageSize={4} />
            </div>

            <div>
                <h2 style={{ marginBottom: '16px' }}>Bình luận</h2>
                {isLoggedIn && product.sizes && (
                    <CommentForm productId={productId!} sizes={product.sizes} onCommentAdded={() => setCommentKey(k => k + 1)} />
                )}
                <CommentList key={commentKey} productId={productId!} />
            </div>
        </div>
    );
}
