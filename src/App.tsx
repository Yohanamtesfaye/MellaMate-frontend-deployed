"use client"
import WalletSetup from "./pages/wallet-setup";
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import axios from "axios"
import "react-toastify/dist/ReactToastify.css"

import AnimatedBackground from "./components/animated-background"
import FloatingElements from "./components/floating-elements"
import Navbar from "./components/navbar"
import LandingPage from "./pages/landing-page"
import ConnectWallet from "./pages/connect-wallet"
import CreateWallet from "./pages/create-wallet"
import ApiRequest from "./pages/api-request"
import WalletDashboard from "./pages/wallet-dashboard"
import SignupPage from "./pages/signup"
import LoginPage from "./pages/login"
import WalletSetupPage from "./pages/wallet-setup"
import MerchantDashboard from "./pages/merchant-dashboard";
import PaymentCheckout from "./pages/payment-checkout";
import DeveloperDocs from "./pages/developer-docs";

// Configure axios defaults
axios.defaults.baseURL = "https://mellamate.onrender.com"
axios.defaults.withCredentials = true

// Wrapper component to provide navigation props to pages
const AppContent = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Add loading state

  // Extract the current page from the URL path
  const currentPage = location.pathname.substring(1) || "landing"

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const accessToken = localStorage.getItem("access_token")
      const walletKey = localStorage.getItem("wallet_public_key")

      console.log("Checking auth status:", { accessToken, walletKey })

      if (accessToken && walletKey) {
        setIsLoggedIn(true)
        setIsWalletConnected(true)
        console.log("User is authenticated")
      } else {
        setIsLoggedIn(false)
        setIsWalletConnected(false)
        console.log("User is not authenticated")
      }

      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  // Add request interceptor to include auth token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.request.eject(interceptor)
    }
  }, [])

  // Add response interceptor to handle auth errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("access_token")
          localStorage.removeItem("wallet_public_key")
          setIsLoggedIn(false)
          setIsWalletConnected(false)
          navigate("/login")
        }
        return Promise.reject(error)
      },
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [navigate])

  const handleNavigation = (page: string) => {
    console.log("Navigation called with page:", page) // Add this debug line
    if (page === "back") {
      navigate(-1)
    } else {
      console.log("Navigating to:", `/${page}`) // Add this debug line
      navigate(`/${page}`)
    }
  }

  const handleLogin = (loggedIn: boolean) => {
    setIsLoggedIn(loggedIn)
    if (loggedIn) {
      // Check if wallet is also connected
      const walletKey = localStorage.getItem("wallet_public_key")
      if (walletKey) {
        setIsWalletConnected(true)
      }
    } else {
      setIsWalletConnected(false)
    }
  }

  const handleWalletConnect = (connected: boolean) => {
    setIsWalletConnected(connected)
    if (connected) {
      // If wallet is connected, user should also be logged in
      setIsLoggedIn(true)
    }
  }

  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  }

  const pageTransition: { duration: number; ease: "easeInOut" | "easeOut" | "easeIn" | "linear" } = {
    duration: 0.3,
    ease: "easeInOut",
  }

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Floating Elements */}
      <FloatingElements />

      {/* Main Content */}
      <div className="relative z-30">
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigation}
          isWalletConnected={isWalletConnected}
          isLoggedIn={isLoggedIn}
          onLogin={handleLogin}
        />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <LandingPage onNavigate={handleNavigation} />
                </motion.div>
              }
            />

            <Route
              path="/landing"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <LandingPage onNavigate={handleNavigation} />
                </motion.div>
              }
            />

            <Route
              path="/signup"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <SignupPage onNavigate={handleNavigation} onLogin={handleLogin} />
                </motion.div>
              }
            />

            <Route
              path="/login"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <LoginPage onNavigate={handleNavigation} onLogin={handleLogin} />
                </motion.div>
              }
            />

            <Route
              path="/wallet-setup"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <WalletSetupPage onNavigate={handleNavigation} onWalletConnect={handleWalletConnect} />
                </motion.div>
              }
            />

            <Route
              path="/dashboard"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <WalletDashboard onNavigate={handleNavigation} isLoggedIn={isLoggedIn} />
                </motion.div>
              }
            />

            {/* Connect Wallet Routes - handle both /connect and /connect-wallet */}
            <Route
              path="/connect"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <ConnectWallet onNavigate={handleNavigation} onConnect={handleWalletConnect} />
                </motion.div>
              }
            />
              <Route
    path="/merchant-dashboard"
    element={
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-[calc(100vh-4rem)]"
      >
        <MerchantDashboard  />
      </motion.div>
    }
  />
            {/* <Route
          path="/merchant"
          element={
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              className="min-h-[calc(100vh-4rem)]"
            >
              <MerchantDashboard onNavigate={handleNavigation} />
            </motion.div>
          }
        /> */}
            <Route
              path="/connect-wallet"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <ConnectWallet onNavigate={handleNavigation} onConnect={handleWalletConnect} />
                </motion.div>
              }
            />

<Route
  path="/create"
  element={
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-[calc(100vh-4rem)]"
    >
      <WalletSetup 
        onNavigate={handleNavigation} 
        onWalletConnect={(connected) => {
          handleWalletConnect(connected);
          if (connected) {
            handleNavigation('dashboard');
          }
        }} 
      />
    </motion.div>
  }
/>

            <Route
               path="/payment-checkout/:paymentId" element={<PaymentCheckout />} />
            <Route path="/developers" element={<DeveloperDocs />} />
             <Route
              path="/api"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <ApiRequest onNavigate={handleNavigation} />
                </motion.div>
              }
            />

            <Route
              path="*"
              element={
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                  className="min-h-[calc(100vh-4rem)]"
                >
                  <LandingPage onNavigate={handleNavigation} />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

// Main App component with Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
