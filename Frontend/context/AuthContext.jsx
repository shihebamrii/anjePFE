'use client';

// Import React hooks for managing global context, state, and component mount lifecycle
import { createContext, useContext, useState, useEffect } from 'react';
// Import authentication backend wrapper functions
import { authService } from '@/services/authService';

// Create the context container with a default null value
const AuthContext = createContext(null);

// AuthProvider component to wrap the application and share authentication state globally
export function AuthProvider({ children }) {
  // State to hold user session object (null if logged out)
  const [user, setUser] = useState(null);
  // Loading state to prevent rendering content before checking local storage
  const [loading, setLoading] = useState(true);

  // Hook run on component mount to sync logged-in state from browser localStorage
  useEffect(() => {
    // Attempt to load user data cached locally
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    // Set loading to false once the check is complete
    setLoading(false);
  }, []);

  // Perform login action, updates local state, and returns the response data
  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data);
    return data;
  };

  // Perform signup/register action, updates state, and returns response data
  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data);
    return data;
  };

  // Clears user session and logs the user out
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Construct a comprehensive value object containing state, functions, and role helper flags
  const value = {
    user,
    // Retrieve token either from state or fallback directly to localStorage
    token: user?.token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null),
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user, // True if user object is present
    // Helper boolean flags to easily verify roles in UI views:
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
    isStudent: user?.role === 'STUDENT',
    isPartner: user?.role === 'PARTNER',
    isChefDept: user?.role === 'CHEF_DEPT',
  };

  // Return the provider wrapping child components with the authentication context value
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the authentication context in other React components
export function useAuth() {
  const context = useContext(AuthContext);
  // Ensure that useAuth is only called within an AuthProvider hierarchy tree
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
