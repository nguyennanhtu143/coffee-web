import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './global.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import CustomerLayout from './components/layout/CustomerLayout';
import ShopLayout from './components/layout/ShopLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import HomePage from './pages/customer/HomePage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CategoryPage from './pages/customer/CategoryPage';
import SearchPage from './pages/customer/SearchPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderPage from './pages/customer/OrderPage';
import ProfilePage from './pages/customer/ProfilePage';
import ChangePasswordPage from './pages/customer/ChangePasswordPage';
import BankTransferPage from './pages/customer/BankTransferPage';

import ProductManager from './components/shop/ProductManager';
import ProductCreate from './components/shop/ProductCreate';
import CategoryManager from './components/shop/CategoryManager';
import OrderManager from './components/shop/OrderManager';
import CouponManager from './components/shop/CouponManager';
import Statistics from './components/shop/Statistics';
import ProductPageConfigManager from './components/shop/ProductPageConfigManager';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ScrollToTop />
                <Routes>
                    {/* Auth */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                    {/* Customer */}
                    <Route element={<CustomerLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/product/:productId" element={<ProductDetailPage />} />
                        <Route path="/category/:categoryId" element={<CategoryPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
                        <Route path="/bank-transfer" element={<ProtectedRoute><BankTransferPage /></ProtectedRoute>} />
                    </Route>

                    {/* Shop */}
                    <Route element={<ProtectedRoute requireShop><ShopLayout /></ProtectedRoute>}>
                        <Route path="/shop/products" element={<ProductManager />} />
                        <Route path="/shop/products/create" element={<ProductCreate />} />
                        <Route path="/shop/categories" element={<CategoryManager />} />
                        <Route path="/shop/orders" element={<OrderManager />} />
                        <Route path="/shop/coupons" element={<CouponManager />} />
                        <Route path="/shop/page-config" element={<ProductPageConfigManager />} />
                        <Route path="/shop/statistics" element={<Statistics />} />
                    </Route>
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
