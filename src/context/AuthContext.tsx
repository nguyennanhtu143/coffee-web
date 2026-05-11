import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosClient from '../api/axiosClient';
import { User } from '../types';

interface AuthContextType {
    token: string | null;
    isShop: boolean;
    isLoggedIn: boolean;
    user: User | null;
    login: (accessToken: string, shopFlag: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('accessToken'));
    const [isShop, setIsShop] = useState(localStorage.getItem('isShop') === 'true');
    const [user, setUser] = useState<User | null>(null);

    const isLoggedIn = !!token;

    useEffect(() => {
        if (token && !user) {
            axiosClient.get('/user/get-information')
                .then((data: any) => setUser(data))
                .catch(() => {});
        }
    }, [token, user]);

    const login = (accessToken: string, shopFlag: boolean) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('isShop', String(shopFlag));
        setToken(accessToken);
        setIsShop(shopFlag === true);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('isShop');
        setToken(null);
        setIsShop(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, isShop, isLoggedIn, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
