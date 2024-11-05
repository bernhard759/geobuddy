// src/AuthProvider.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

// Auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user session on mount and handle auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    fetchSession();

    // Set up a listener to handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe(); // Correctly unsubscribe on cleanup
    };
  }, []);

  // Signin method
  const signIn = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
  };

  // Signout method
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
