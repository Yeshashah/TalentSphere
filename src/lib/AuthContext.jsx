/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────
 * Provides authentication state using the local client.
 * Exposes the same context shape as the original base44 version
 * so that all consumers (ProtectedRoute, pages, Navbar, etc.)
 * continue to work without modification.
 */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabaseWrapper as localClient } from '@/api/supabaseWrapper';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

/**
 * Inner provider that needs access to useNavigate.
 * This must be rendered *inside* <BrowserRouter>.
 */
function AuthProviderInner({ children }) {
  const navigate = useNavigate();

  const [user, setUser]                           = useState(null);
  const [isAuthenticated, setIsAuthenticated]     = useState(false);
  const [isLoadingAuth, setIsLoadingAuth]         = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError]                 = useState(null);
  const appPublicSettings                         = null; // unused locally

  // ── bootstrap ────────────────────────────────
  useEffect(() => {
    checkAppState();

    // Listen for redirectToLogin events emitted by localClient.auth.redirectToLogin()
    const handler = () => navigate('/login');
    window.addEventListener('localAuth:redirectToLogin', handler);
    return () => window.removeEventListener('localAuth:redirectToLogin', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAppState = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const currentUser = await localClient.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (_) {
      // Not logged in — that's fine; many pages are public
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  // ── actions ──────────────────────────────────

  const login = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const loggedInUser = await localClient.auth.login({ email, password });
      setUser(loggedInUser);
      setIsAuthenticated(true);
      return loggedInUser;
    } catch (err) {
      setAuthError({ type: 'login_failed', message: err.message });
      throw err;
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    localClient.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/Home');
  };

  /** Kept for API compatibility — locally just navigate to /login */
  const navigateToLogin = () => navigate('/login');

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      login,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * AuthProvider wraps the inner component.
 * It must be rendered *inside* <BrowserRouter> (which is the
 * case in App.jsx where <Router> wraps <AuthProvider>).
 */
export const AuthProvider = ({ children }) => (
  <AuthProviderInner>{children}</AuthProviderInner>
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};