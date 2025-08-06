"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"

interface LoginPageProps {
  onNavigate: (page: string) => void;
  onLogin: (loggedIn: boolean) => void;
}

type FormData = {
  email: string
  password: string
}

export default function LoginPage({ onNavigate, onLogin }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "https://mellamate.onrender.com/token",
        new URLSearchParams({
          username: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          validateStatus: (status) => status < 500 // Don't throw for 4xx errors
        }
      );

      // Check if login was successful
      if (response.status >= 400) {
        const errorMessage = response.data?.message || 'Invalid email or password';
        throw new Error(errorMessage);
      }

      // Store the access token and user data
      const { access_token, user } = response.data;
      localStorage.setItem("access_token", access_token);
      
      if (user) {
        // Store user data in localStorage if needed
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      // Update auth state
      onLogin(true);

      // Check if user has a wallet
      try {
        const walletResponse = await axios.get('https://mellamate.onrender.com/api/wallet/me', {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json'
          },
          validateStatus: (status) => status < 500
        });
        
        // If user has a wallet, go to dashboard, otherwise go to wallet setup
        if (walletResponse.status === 200 && walletResponse.data?.public_key) {
          localStorage.setItem('wallet_public_key', walletResponse.data.public_key);
          onNavigate('dashboard');
        } else {
          onNavigate('wallet-setup');
        }
      } catch (walletError) {
        console.error('Wallet check error:', walletError);
        // If there's an error checking wallet, still proceed to wallet setup
        onNavigate('wallet-setup');
      }
      
    } catch (err: any) {
      console.error("Login error:", err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        const responseData = err.response.data;
        
        if (err.response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.response.status === 400) {
          errorMessage = responseData?.detail || 
                        responseData?.message || 
                        'Invalid request. Please check your input.';
        } else if (err.response.status === 500) {
          errorMessage = 'A server error occurred. Please try again later.';
          console.error('Server error details:', responseData);
        } else {
          errorMessage = responseData?.message || 
                        `Error: ${err.response.status} - ${err.response.statusText}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.message) {
        // Something happened in setting up the request
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Clear the password field on error for security
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-800"
        >
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Welcome Back
            </motion.h1>
            <p className="text-gray-400">Sign in to your MellaMate account</p>
          </div>

          {error && (
            <motion.div 
              className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg mb-6 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <button
                  type="button"
                  onClick={() => onNavigate("forgot-password")}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => onNavigate('signup')} 
                className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
              >
                Sign up
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
