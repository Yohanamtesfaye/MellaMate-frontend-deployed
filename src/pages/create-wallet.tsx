"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import api from "../lib/api"

// Define the props interface for the WalletSetup component
interface WalletSetupProps {
  onNavigate: (page: string) => void
  onWalletConnect: (connected: boolean) => void
}

interface WalletInfo {
  public_key: string
  secret_key: string
  network: string
  funded: boolean
  balance?: {
    balance: string
    asset_type: string
  }
}

const WalletSetup: React.FC<WalletSetupProps> = ({ onNavigate, onWalletConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [error, setError] = useState("")

  // Check if user is authenticated on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) {
      toast.error("Please log in to create a wallet")
      onNavigate("login")
    }
  }, [onNavigate])

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    setError("")
    try {
      console.log("handleConnectWallet called, navigating to: connect") // Add debug
      // Navigate to the connect page (fixed route name)
      onNavigate("connect")
    } catch (err) {
      setError("Failed to connect wallet. Please try again.")
      console.error("Wallet connection error:", err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCreateWallet = async () => {
    setIsCreating(true)
    setError("")

    try {
      const token = localStorage.getItem("access_token")
      console.log("Current token:", token)

      if (!token) {
        throw new Error("Your session has expired. Please log in again.")
      }

      const toastId = toast.loading("Creating your wallet...")

      try {
        console.log("Making wallet creation request...")

        // Make sure we're sending the request to the correct endpoint
        const response = await api.post("/api/wallet/create", {
          network: "TESTNET"
        })

        console.log("Wallet creation response:", response)

        if (response.data) {
          const walletData = response.data
          setWalletInfo(walletData)

          localStorage.setItem("wallet_public_key", walletData.public_key)

          // Call onWalletConnect to update the app state
          onWalletConnect(true)

          toast.update(toastId, {
            render: "Wallet created successfully!",
            type: "success",
            isLoading: false,
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          })
        } else {
          throw new Error("Invalid response from server")
        }
      } catch (apiError: any) {
        console.error("API Error details:", apiError)

        let errorMessage = "Failed to create wallet"

        if (apiError.response) {
          // Server responded with error status
          console.log("Error response:", apiError.response.data)
          errorMessage = apiError.response.data?.detail || apiError.response.data?.message || errorMessage
        } else if (apiError.request) {
          // Request was made but no response received
          errorMessage = "No response from server. Please check if the backend is running."
        } else {
          // Something else happened
          errorMessage = apiError.message || errorMessage
        }

        toast.update(toastId, {
          render: errorMessage,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        })

        throw new Error(errorMessage)
      }
    } catch (err) {
      console.error("Wallet creation error:", err)
      setError(err instanceof Error ? err.message : "Failed to create wallet. Please try again.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleGoToDashboard = () => {
    // Ensure wallet connection state is updated before navigating
    onWalletConnect(true)
    setTimeout(() => onNavigate("dashboard"), 500)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {walletInfo ? "Stellar Wallet Created!" : "Set Up Your Wallet"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-300">
          {walletInfo
            ? "Your Stellar wallet has been successfully created."
            : "Connect an existing wallet or create a new one to get started with MellaMate"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 border border-gray-700 py-8 px-6 shadow-xl rounded-2xl">
          {error && (
            <div className="mb-4 bg-red-900/20 border-l-4 border-red-600 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {walletInfo ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-md">
                <h3 className="text-sm font-medium text-gray-400">Public Key</h3>
                <p className="mt-1 text-sm text-white break-all font-mono">{walletInfo.public_key}</p>
              </div>

              <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-md">
                <h3 className="text-sm font-medium text-yellow-400">Secret Key</h3>
                <p className="mt-1 text-sm text-yellow-200 break-all font-mono">{walletInfo.secret_key}</p>
                <p className="mt-2 text-xs text-yellow-300">
                  ⚠️ Save this in a secure place. Never share your secret key with anyone!
                </p>
              </div>

              {walletInfo.balance && (
                <div className="p-4 bg-green-900/20 border border-green-700 rounded-md">
                  <h3 className="text-sm font-medium text-green-400">Balance</h3>
                  <p className="mt-1 text-lg font-medium text-green-200">
                    {walletInfo.balance.balance} {walletInfo.balance.asset_type}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleGoToDashboard}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  disabled={isConnecting || isCreating}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isConnecting ? "Connecting..." : "Connect Existing Wallet"}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or</span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleCreateWallet}
                  disabled={isConnecting || isCreating}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? "Creating..." : "Create New Wallet"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WalletSetup
