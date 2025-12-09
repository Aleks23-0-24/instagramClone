import API_URL from '@/config';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { deleteItem, getItem, saveItem } from '../utils/storage';
const TOKEN_KEY = 'anime_social_mini_token';
const USER_ID_KEY = 'anime_social_mini_user_id';

type AuthState = {
    token: string | null;
    authenticated: boolean;
    userId: string | null;
};

const AuthContext = createContext<{ 
    authState: AuthState;
    loading: boolean;
    onRegister: (email: string, username: string, password: string) => Promise<any>;
    onLogin: (email: string, password: string) => Promise<any>;
    onLogout: () => Promise<void>;
}> ({
    authState: { token: null, authenticated: false, userId: null },
    loading: true,
    onRegister: async () => {},
    onLogin: async () => {},
    onLogout: async () => {},
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({ 
        token: null, 
        authenticated: false,
        userId: null,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const token = await getItem(TOKEN_KEY);
                const userId = await getItem(USER_ID_KEY);
                if (token && userId) {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setAuthState({ token, authenticated: true, userId });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadAuthData();
    }, []);

    const onRegister = async (email: string, username: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, { email, username, password });
            return response.data;
        } catch (e: any) {
            return { error: true, msg: e.response?.data?.error || 'Registration failed' };
        }
    };

    const onLogin = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });
            const { token, userId } = response.data;
            
            await saveItem(TOKEN_KEY, token);
            await saveItem(USER_ID_KEY, userId);
            
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAuthState({ token, authenticated: true, userId });
            
            return response.data;
        } catch (e: any) {
            return { error: true, msg: e.response?.data?.error || 'Login failed' };
        }
    };

    const onLogout = async () => {
        await deleteItem(TOKEN_KEY);
        await deleteItem(USER_ID_KEY);
        delete axios.defaults.headers.common['Authorization'];
        setAuthState({ token: null, authenticated: false, userId: null });
    };

    const value = {
        onRegister,
        onLogin,
        onLogout,
        authState,
        loading,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};