import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Category, Product } from '../../types';
import { toast } from 'react-toastify';

export default function CategoryManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState('');
    const [manageCatId, setManageCatId] = useState<number | null>(null);
    const [manageCatName, setManageCatName] = useState('');

    useEffect(() => { load(); }, []);
    const load = async () => { const d: any = await axiosClient.get('/category/get-categories').catch(() => []); setCategories(d || []); };

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        await axiosClient.post('/category/create', { name }).catch((err: any) => toast.error(err.message));
        toast.success('Tạo danh mục thành công!'); setName(''); load();
    };

    const del = async (id: number) => {
        if (!window.confirm('Xoá danh mục?')) return;
        await axiosClient.delete('/category/delete?categoryId=' + id).catch(() => null);
        toast.success('Đã xoá'); load();
    };

    return (
        <div>
            <h2>Quản lý danh mục</h2>
            <form onSubmit={create} style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '24px' }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên danh mục mới" required style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                <button type="submit" style={{ padding: '10px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Tạo</button>
            </form>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Tên danh mục</th>
                    <th style={{ padding: '10px', width: '200px' }}></th>
                </tr></thead>
                <tbody>{categories.map(c => (
                    <tr key={c.categoryId} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{c.name}</td>
                        <td style={{ padding: '10px', display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setManageCatId(c.categoryId); setManageCatName(c.name); }}
                                style={{ background: '#3498db', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                Sản phẩm
                            </button>
                            <button onClick={() => del(c.categoryId)}
                                style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                Xoá
                            </button>
                        </td>
                    </tr>
                ))}</tbody>
            </table>

            {manageCatId && (
                <CategoryProductManager
                    categoryId={manageCatId}
                    categoryName={manageCatName}
                    onClose={() => setManageCatId(null)}
                />
            )}
        </div>
    );
}

// Sub-component: quản lý sản phẩm trong danh mục
function CategoryProductManager({ categoryId, categoryName, onClose }: { categoryId: number; categoryName: string; onClose: () => void }) {
    const [productsInCat, setProductsInCat] = useState<Product[]>([]);
    const [productsNotIn, setProductsNotIn] = useState<Product[]>([]);

    useEffect(() => { loadProducts(); }, [categoryId]);

    const loadProducts = async () => {
        // Sản phẩm trong danh mục
        const inCat: any = await axiosClient.get('/product/get-products-by-category?categoryId=' + categoryId + '&page=0&size=100').catch(() => null);
        setProductsInCat(inCat?.content || []);

        // Sản phẩm chưa trong danh mục
        const notIn: any = await axiosClient.get('/product/get-products-not-in-category?categoryId=' + categoryId).catch(() => []);
        setProductsNotIn(notIn || []);
    };

    const addProduct = async (productId: number) => {
        try {
            await axiosClient.post('/product/add-product-to-category?categoryId=' + categoryId + '&productId=' + productId);
            toast.success('Đã thêm sản phẩm vào danh mục!');
            loadProducts();
        } catch (e: any) { toast.error(e.message); }
    };

    const removeProduct = async (productId: number) => {
        try {
            await axiosClient.delete('/product/delete-product-from-category?categoryId=' + categoryId + '&productId=' + productId);
            toast.success('Đã xoá sản phẩm khỏi danh mục!');
            loadProducts();
        } catch (e: any) { toast.error(e.message); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', width: '700px', maxWidth: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
                <h3>Quản lý sản phẩm - {categoryName}</h3>

                {/* Sản phẩm đang trong danh mục */}
                <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Sản phẩm trong danh mục ({productsInCat.length})</h4>
                {productsInCat.length === 0 ? <p style={{ color: '#999' }}>Chưa có sản phẩm nào</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                        <thead><tr style={{ background: '#f8f9fa' }}>
                            <th style={{ padding: '8px' }}>Ảnh</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Tên sản phẩm</th>
                            <th style={{ padding: '8px' }}></th>
                        </tr></thead>
                        <tbody>{productsInCat.map(p => (
                            <tr key={p.productId} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}><img src={p.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                <td style={{ padding: '8px' }}>{p.name}</td>
                                <td style={{ padding: '8px' }}>
                                    <button onClick={() => removeProduct(p.productId)}
                                        style={{ background: '#e74c3c', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                        Xoá
                                    </button>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}

                {/* Sản phẩm chưa trong danh mục */}
                <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Thêm sản phẩm ({productsNotIn.length} sản phẩm có thể thêm)</h4>
                {productsNotIn.length === 0 ? <p style={{ color: '#999' }}>Tất cả sản phẩm đã trong danh mục</p> : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ background: '#f0f8ff' }}>
                            <th style={{ padding: '8px' }}>Ảnh</th>
                            <th style={{ padding: '8px', textAlign: 'left' }}>Tên sản phẩm</th>
                            <th style={{ padding: '8px' }}></th>
                        </tr></thead>
                        <tbody>{productsNotIn.map(p => (
                            <tr key={p.productId} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '8px' }}><img src={p.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                <td style={{ padding: '8px' }}>{p.name}</td>
                                <td style={{ padding: '8px' }}>
                                    <button onClick={() => addProduct(p.productId)}
                                        style={{ background: '#27ae60', color: '#fff', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                        Thêm
                                    </button>
                                </td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}

                <button onClick={onClose} style={{ marginTop: '16px', padding: '10px 24px', background: '#999', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Đóng</button>
            </div>
        </div>
    );
}
