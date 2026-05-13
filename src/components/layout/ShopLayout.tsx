import React, { useState } from 'react';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className={styles.shopLayout}>
            <button
                type="button"
                className={styles.menuButton}
                onClick={() => setSidebarOpen(true)}
                aria-label="Mở menu quản trị"
            >
                <i className="fa fa-bars"></i>
            </button>

            {sidebarOpen && <button type="button" className={styles.overlay} onClick={closeSidebar} aria-label="Đóng menu quản trị" />}

            <nav className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarTitle}>Admin</div>
                    <button type="button" className={styles.closeButton} onClick={closeSidebar} aria-label="Đóng menu quản trị">
                        <i className="fa fa-times"></i>
                    </button>
                </div>
                {tabs.map(tab => (
                    <Link
                        key={tab.path}
                        to={tab.path}
                        onClick={closeSidebar}
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
