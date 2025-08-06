"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, LogOut, Copy, Check, Menu, X, ChevronDown, User, Globe } from "lucide-react"
import { toast } from "react-toastify"

interface NavbarProps {
  currentPage: string
  onNavigate: (page: string) => void
  isWalletConnected: boolean
  isLoggedIn: boolean
  onLogin: (loggedIn: boolean) => void
}

// Custom Button component
const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  ...props
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  disabled?: boolean
  [key: string]: any
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-500",
    ghost: "text-gray-300 hover:bg-gray-800 hover:text-white focus:ring-gray-500",
  }

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-sm",
    lg: "h-12 px-8",
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

// Custom Dropdown component
const Dropdown = ({
  trigger,
  children,
  isOpen,
  onToggle,
}: {
  trigger: React.ReactNode
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
}) => {
  return (
    <div className="relative">
      <div onClick={onToggle}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar({ currentPage, onNavigate, isWalletConnected, isLoggedIn, onLogin }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Debug: Log the current state
  useEffect(() => {
    console.log("Navbar Debug Info:", {
      isLoggedIn,
      isWalletConnected,
      publicKey,
      currentPage,
      localStorage_access_token: localStorage.getItem("access_token"),
      localStorage_wallet_key: localStorage.getItem("wallet_public_key"),
    })
  }, [isLoggedIn, isWalletConnected, publicKey, currentPage])

  useEffect(() => {
    const key = localStorage.getItem("wallet_public_key")
    const accessToken = localStorage.getItem("access_token")

    console.log("LocalStorage check:", { key, accessToken })

    setPublicKey(key)

    // Auto-login only if not already on dashboard or setup page
    if (
      key &&
      accessToken &&
      !isLoggedIn &&
      !["dashboard", "setup"].includes(currentPage)
    ) {
      console.log("Auto-logging in user...")
      onLogin(true)
    }
  }, [isWalletConnected, isLoggedIn, onLogin, currentPage])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isDropdownOpen])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("wallet_public_key")
    localStorage.removeItem("wallet_secret_key")
    localStorage.removeItem("wallet_initialized")

    setPublicKey(null)
    onLogin(false)
    onNavigate("login")
    toast.success("Successfully logged out")
    setIsMobileMenuOpen(false)
    setIsDropdownOpen(false)
  }

  const copyToClipboard = async () => {
    if (!publicKey) return

    try {
      await navigator.clipboard.writeText(publicKey)
      setCopied(true)
      toast.success("Address copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast.error("Failed to copy address")
    }
  }

  const formatAddress = (address: string, isMobile = false) => {
    if (isMobile) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  // Don't show navbar on login page
  if (currentPage === "login") {
    return null
  }

  // Check if user should be logged in (has both token and wallet key)
  const shouldShowWallet =
    (isLoggedIn && publicKey) || (localStorage.getItem("access_token") && localStorage.getItem("wallet_public_key"))
  const displayKey = publicKey || localStorage.getItem("wallet_public_key")

  return (
    <nav className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate("landing-page")}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg"
            >
              <Globe className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <motion.h1
                className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                MellaMate
              </motion.h1>
              <p className="text-xs text-gray-400 -mt-1">Global Payment API</p>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {isLoggedIn && publicKey ? (
                <div className="flex items-center space-x-3">
                  {/* Wallet Dropdown */}
                  <Dropdown
                    isOpen={isDropdownOpen}
                    onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
                    trigger={
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 border border-gray-700/50 hover:border-gray-600"
                      >
                        <Wallet className="h-4 w-4 text-green-400" />
                        <span className="font-mono text-sm">{formatAddress(publicKey)}</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </Button>
                    }
                  >
                    <div className="py-1">
                      {/* Wallet Address Display */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-gray-400">Wallet Address</p>
                        <p className="text-xs font-mono text-gray-200 break-all mt-1">{publicKey}</p>
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onNavigate("dashboard")
                          setIsDropdownOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                      >
                        <Wallet className="h-4 w-4 mr-3" />
                        Wallet Dashboard
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          copyToClipboard()
                          setIsDropdownOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                      >
                        {copied ? <Check className="h-4 w-4 mr-3 text-green-400" /> : <Copy className="h-4 w-4 mr-3" />}
                        {copied ? "Copied!" : "Copy Address"}
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onNavigate("profile")
                          setIsDropdownOpen(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </button>

                      <div className="border-t border-gray-700 mt-1 pt-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log("🖱️ Desktop logout button clicked") // Debug log
                            handleLogout()
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 flex items-center"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => onNavigate("login")}
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-white hover:bg-gray-800/50"
                  >
                    Login
                  </Button>
                </div>
              )}
            <Button variant="ghost" onClick={() => onNavigate("developers")} className="text-gray-300 hover:text-white">
              Docs
            </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-800"
            >
              <div className="px-2 pt-2 pb-3 space-y-2 bg-gray-900/95">
                {isLoggedIn && publicKey ? (
                  <>
                    {/* Mobile Wallet Info */}
                    <div className="px-3 py-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Wallet className="h-5 w-5 text-green-400" />
                          <div>
                            <p className="text-sm text-gray-400">Wallet</p>
                            <p className="text-sm font-mono text-gray-200">{formatAddress(publicKey, true)}</p>
                          </div>
                        </div>
                        <button
                          onClick={copyToClipboard}
                          className="h-8 w-8 p-0 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 flex items-center justify-center"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Mobile Menu Items */}
                    <Button
                      onClick={() => {
                        onNavigate("dashboard")
                        setIsMobileMenuOpen(false)
                      }}
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Wallet className="w-4 h-4 mr-3" />
                      Wallet Dashboard
                    </Button>

                    <Button
                      onClick={() => {
                        onNavigate("profile")
                        setIsMobileMenuOpen(false)
                      }}
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Button>

                    <Button
                      onClick={() => {
                        console.log("📱 Mobile logout button clicked") // Debug log
                        handleLogout()
                      }}
                      variant="ghost"
                      className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        onNavigate("login")
                        setIsMobileMenuOpen(false)
                      }}
                      variant="ghost"
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => {
                        onNavigate("signup")
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Sign Up
                    </Button>
                    <Button
                      onClick={() => {
                        // Check if user has wallet but not logged in
                        const walletKey = localStorage.getItem("wallet_public_key")
                        if (walletKey) {
                          onNavigate("dashboard")
                        } else {
                          onNavigate("wallet-setup")
                        }
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Wallet className="w-4 h-4 mr-3" />
                      Connect Wallet
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
