import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { Category } from '../../types';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        axiosClient.get('/category/get-categories')
            .then((data: any) => setCategories(data || []))
            .catch(() => {});
    }, []);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigate('/search?q=' + encodeURIComponent(searchQuery.trim()));
            setSearchQuery('');
            setSearchVisible(false);
        }
    };

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        logout();
        navigate('/login');
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navbar_logo}>
                <Link to="/"><img src="/assets/img/logo.webp" alt="Logo" /></Link>
            </div>

            <ul className={styles.navbar_menu}>
                <li><Link to="/">Trang chủ</Link></li>
                <li><a href="#introduce">Giới thiệu</a></li>
                <li className={styles.dropdown}>
                    <a href="#product">Sản phẩm</a>
                    <ul className={styles.dropdown_content}>
                        {categories.map(cat => (
                            <li key={cat.categoryId}>
                                <Link to={'/category/' + cat.categoryId}>{cat.name}</Link>
                            </li>
                        ))}
                    </ul>
                </li>
                <li><a href="#serve">Dịch vụ</a></li>
                <li><a href="#contact">Liên hệ</a></li>
            </ul>

            <div className={styles.navbar_icons}>
                <div className={styles.dropdown}>
                    <a href="#"><i className="fa-solid fa-user"></i></a>
                    <div className={styles.dropdown_content}>
                        <ul>
                            {isLoggedIn ? (
                                <>
                                    <li><Link to="/orders">Đơn mua</Link></li>
                                    <li><Link to="/profile">Thông tin cá nhân</Link></li>
                                    <li><Link to="/addresses">Sổ địa chỉ</Link></li>
                                    <li><a href="#" onClick={handleLogout}>Đăng xuất</a></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/login">Đăng nhập</Link></li>
                                    <li><Link to="/register">Đăng ký</Link></li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>

                <span className={styles.search_icon}
                    onClick={() => setSearchVisible(!searchVisible)}>
                    <i className="fa fa-search"></i>
                </span>

                {searchVisible && (
                    <div className={styles.search_container}>
                        <input
                            type="text" placeholder="Tìm kiếm..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch}>Tìm</button>
                    </div>
                )}

                <Link to="/cart"><i className="fa fa-shopping-cart"></i></Link>
            </div>
        </nav>
    );
}
