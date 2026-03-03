// context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    console.log('AuthProvider rendered, user:', user);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log('Auth event:', _event);
            setSession(session);
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Send OTP to email
    const sendOTP = async (email) => {
        try {
            const { data, error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: true,
                    // ✅ Explicitly disable magic link
                    data: {},
                    // ✅ Don't set emailRedirectTo at all
                }
            });

            if (error) throw error;

            console.log('✅ OTP sent:', data);
            return { data, error: null };
        } catch (error) {
            console.error('❌ Send OTP error:', error);
            return { data: null, error };
        }
    };

    // Verify OTP
    const verifyOTP = async (email, token) => {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email: email,
                token: token,
                type: 'email',
            });

            if (error) throw error;

            console.log('✅ OTP verified:', data);
            return { data, error: null };
        } catch (error) {
            console.error('❌ Verify OTP error:', error.message);
            return { data: null, error };
        }
    };

    // Update user profile (add name for new users)
    const updateProfile = async (name) => {
        try {
            const { data, error } = await supabase.auth.updateUser({
                data: { name: name }
            });

            if (error) throw error;

            console.log('✅ Profile updated:', data);
            // Refresh user state
            setUser(data.user);
            return { data, error: null };
        } catch (error) {
            console.error('❌ Update profile error:', error.message);
            return { data: null, error };
        }
    };

    // Sign out
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            console.log('✅ Signed out');
            return { error: null };
        } catch (error) {
            console.error('❌ Signout error:', error.message);
            return { error };
        }
    };

    const value = {
        user,
        session,
        loading,
        sendOTP,
        verifyOTP,
        updateProfile,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};