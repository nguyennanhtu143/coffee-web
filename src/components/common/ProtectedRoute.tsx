import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
    children: ReactNode;
    requireShop?: boolean;
}

export default function ProtectedRoute({ children, requireShop = false }: Props) {
    const { isLoggedIn, isShop } = useAuth();
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    if (requireShop && !isShop) return <Navigate to="/" replace />;
    return <>{children}</>;
}
