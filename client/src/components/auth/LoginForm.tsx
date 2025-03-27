import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  // Log when error changes to confirm it's being updated
  useEffect(() => {
    if (error) {
      console.log("Login error state changed:", error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    // Validate form first
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    // Only set loading after validation passes
    setIsLoading(true);
    
    try {
      await login(email, password);
      // If login is successful, the AuthContext will navigate to home
    } catch (err: any) {
      setIsLoading(false);
      
      // Get the error message from the server response if possible
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to login. Please try again.');
      }
      
      // Ensure this catch block completes and doesn't redirect
      e.stopPropagation();
      return false;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      {/* Make the error message more visible and ensure it's rendered */}
      {error !== '' && (
        <div className="mb-4 p-3 bg-red-500 text-white font-bold rounded login-error-message" role="alert">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            disabled={isLoading}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div className="mt-6">
          <Button
            type="button"
            onClick={loginWithGoogle}
            className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            <img
              className="h-5 w-5 mr-2"
              src="https://www.google.com/favicon.ico"
              alt="Google logo"
            />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}; 