"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface WalletConnectionModalProps {
  isOpen: boolean
  onClose: () => void
  walletType: string
  walletName: string
  onSuccess: (publicKey: string) => void
  onError: (error: string) => void
}

interface WalletConfig {
  name: string
  embedUrl?: string
  connectUrl?: string
  instructions: string[]
  requiresExtension?: boolean
  extensionUrl?: string
}

const walletConfigs: Record<string, WalletConfig> = {
  albedo: {
    name: "Albedo",
    embedUrl: "https://albedo.link/connect",
    connectUrl: "https://albedo.link",
    instructions: [
      "Click 'Connect' in the Albedo interface",
      "Review and approve the connection request",
      "Your wallet will be connected automatically",
    ],
  },
  lobstr: {
    name: "LOBSTR",
    connectUrl: "https://lobstr.co/web-wallet/",
    instructions: [
      "Open LOBSTR in a new tab",
      "Sign in to your LOBSTR account",
      "Copy your public key from the wallet",
      "Return here and paste it below",
    ],
  },
  stellar: {
    name: "Stellar Wallet",
    connectUrl: "https://accountviewer.stellar.org/",
    instructions: [
      "Open Stellar Account Viewer",
      "Access your existing wallet",
      "Copy your public key",
      "Return here to complete connection",
    ],
  },
  freighter: {
    name: "Freighter",
    requiresExtension: true,
    extensionUrl: "https://freighter.app/",
    instructions: [
      "Install Freighter browser extension",
      "Create or import your wallet",
      "Click 'Connect with Freighter' below",
    ],
  },
}

export default function WalletConnectionModal({
  isOpen,
  onClose,
  walletType,
  walletName,
  onSuccess,
  onError,
}: WalletConnectionModalProps) {
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
  const [manualPublicKey, setManualPublicKey] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const config = walletConfigs[walletType] || walletConfigs.stellar

  useEffect(() => {
    if (isOpen) {
      setConnectionStatus("idle")
      setManualPublicKey("")
      setShowManualInput(false)
      setIframeLoaded(false)
    }
  }, [isOpen])

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from trusted origins
      const trustedOrigins = ["https://albedo.link", "https://lobstr.co"]
      if (!trustedOrigins.includes(event.origin)) return

      if (event.data.type === "WALLET_CONNECTED" && event.data.publicKey) {
        handleConnectionSuccess(event.data.publicKey)
      } else if (event.data.type === "WALLET_ERROR") {
        handleConnectionError(event.data.error || "Connection failed")
      }
    }

    if (isOpen) {
      window.addEventListener("message", handleMessage)
    }

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [isOpen])

  const handleConnectionSuccess = (publicKey: string) => {
    setConnectionStatus("success")
    setTimeout(() => {
      onSuccess(publicKey)
      onClose()
    }, 1500)
  }

  const handleConnectionError = (error: string) => {
    setConnectionStatus("error")
    onError(error)
  }

  const handleFreighterConnect = async () => {
    setConnectionStatus("connecting")

    try {
      // Check if Freighter is installed
      if (!(window as any).freighter) {
        throw new Error("Freighter extension is not installed")
      }

      // Request access to Freighter
      const isAllowed = await (window as any).freighter.isAllowed()
      if (!isAllowed) {
        await (window as any).freighter.setAllowed()
      }

      // Get public key from Freighter
      const publicKey = await (window as any).freighter.getPublicKey()
      handleConnectionSuccess(publicKey)
    } catch (error: any) {
      handleConnectionError(error.message || "Failed to connect with Freighter")
    }
  }

  const handleManualConnect = () => {
    if (!manualPublicKey.trim()) {
      onError("Please enter a valid public key")
      return
    }

    if (!manualPublicKey.startsWith("G") || manualPublicKey.length !== 56) {
      onError("Invalid public key format")
      return
    }

    setConnectionStatus("connecting")

    // Simulate validation
    setTimeout(() => {
      handleConnectionSuccess(manualPublicKey.trim())
    }, 1000)
  }

  const openInNewTab = () => {
    if (config.connectUrl) {
      window.open(config.connectUrl, "_blank", "noopener,noreferrer")
      setShowManualInput(true)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-white">Connect {config.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Connection Status */}
              {connectionStatus !== "idle" && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                  {connectionStatus === "connecting" && (
                    <>
                      <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                      <span className="text-white">Connecting to {config.name}...</span>
                    </>
                  )}
                  {connectionStatus === "success" && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white">Successfully connected! Redirecting...</span>
                    </>
                  )}
                  {connectionStatus === "error" && (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-white">Connection failed. Please try again.</span>
                    </>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">How to connect:</h3>
                <ol className="space-y-2">
                  {config.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Embedded iframe for supported wallets */}
              {config.embedUrl && !showManualInput && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="h-96 border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
                      {!iframeLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
                            <p className="text-gray-400">Loading {config.name}...</p>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={config.embedUrl}
                        className="w-full h-full"
                        onLoad={() => setIframeLoaded(true)}
                        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                        title={`${config.name} Connection`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={openInNewTab}
                      className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowManualInput(true)}
                      className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      Enter Public Key Manually
                    </Button>
                  </div>
                </div>
              )}

              {/* Freighter direct connection */}
              {walletType === "freighter" && !config.requiresExtension && (
                <div className="space-y-4">
                  <Button
                    onClick={handleFreighterConnect}
                    disabled={connectionStatus === "connecting"}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {connectionStatus === "connecting" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      "Connect with Freighter"
                    )}
                  </Button>
                </div>
              )}

              {/* Extension installation required */}
              {config.requiresExtension && (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      {config.name} requires a browser extension to be installed first.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => window.open(config.extensionUrl, "_blank")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Install {config.name}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleFreighterConnect}
                      disabled={connectionStatus === "connecting"}
                      className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      I've Installed It
                    </Button>
                  </div>
                </div>
              )}

              {/* Manual public key input */}
              {(showManualInput || (!config.embedUrl && !config.requiresExtension)) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Enter your public key from {config.name}:</label>
                    <input
                      type="text"
                      placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      value={manualPublicKey}
                      onChange={(e) => setManualPublicKey(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400">Your public key starts with 'G' and is 56 characters long</p>
                  </div>

                  <div className="flex gap-3">
                    {config.connectUrl && (
                      <Button
                        variant="outline"
                        onClick={openInNewTab}
                        className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open {config.name}
                      </Button>
                    )}
                    <Button
                      onClick={handleManualConnect}
                      disabled={!manualPublicKey.trim() || connectionStatus === "connecting"}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {connectionStatus === "connecting" ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        "Connect Wallet"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
