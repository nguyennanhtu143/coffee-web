import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const NO_FOOTER_PAGES = ['/cart', '/orders', '/checkout', '/bank-transfer', '/profile', '/change-password', '/addresses'];

export default function CustomerLayout() {
    const pathname = useLocation().pathname;
    const isHome = pathname === '/';
    const showFooter = !NO_FOOTER_PAGES.includes(pathname);

    return (
        <div>
            {isHome ? (
                <Outlet />
            ) : (
                <>
                    <Navbar />
                    <div style={{ paddingTop: '70px' }}><Outlet /></div>
                </>
            )}
            {showFooter && <Footer />}
        </div>
    );
}
