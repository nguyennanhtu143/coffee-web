import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './ShopLayout.module.css';

const tabs = [
    { path: '/shop/products', label: 'Sản phẩm' },
    { path: '/shop/products/create', label: 'Tạo sản phẩm' },
    { path: '/shop/categories', label: 'Danh mục' },
    { path: '/shop/orders', label: 'Đơn hàng' },
    { path: '/shop/coupons', label: 'Khuyến mãi' },
    { path: '/shop/page-config', label: 'Cấu hình phân trang' },
    { path: '/shop/statistics', label: 'Thống kê' },
];

export default function ShopLayout() {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <div className={styles.shopLayout}>
            <nav className={styles.sidebar}>
                <div className={styles.sidebarTitle}>Admin</div>
                {tabs.map(tab => (
                    <Link
                        key={tab.path}
                        to={tab.path}
                        className={`${styles.sidebarLink} ${location.pathname === tab.path ? styles.active : ''}`}
                    >
                        {tab.label}
                    </Link>
                ))}
                <button
                    onClick={() => {
                        logout();
                        window.location.href = '/login';
                    }}
                    className={styles.logoutButton}
                >
                    Đăng xuất
                </button>
            </nav>
            <main className={styles.content}>
                <Outlet />
            </main>
        </div>
    );
}
