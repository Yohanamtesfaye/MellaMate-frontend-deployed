import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Wallet, Key, Shield, CheckCircle, AlertCircle, ArrowLeft, ExternalLink, Smartphone, Globe } from "lucide-react"
import { toast } from "react-toastify"
import WalletConnectionModal from "../components/wallet-connection-modal"
// import { AllbridgeCoreSdk, Messenger } from "@allbridge/bridge-core-sdk"
import getFreighter from "@stellar/freighter-api"
import {  Asset, TransactionBuilder, Operation, Keypair } from "stellar-sdk"
 import { Horizon } from 'stellar-sdk';
interface ConnectWalletProps {
  onNavigate: (page: string) => void
  onConnect: (connected: boolean) => void
}

type ConnectionStatus = "idle" | "success" | "error"
type WalletMethod = "stellar" | "freighter" | "secret" | "lobstr"

export default function ConnectWallet({ onNavigate, onConnect }: ConnectWalletProps) {
  const [selectedMethod, setSelectedMethod] = useState<WalletMethod | "">("")
  const [secretKey, setSecretKey] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [bridgeAmount, setBridgeAmount] = useState("")
  const [isBridging, setIsBridging] = useState(false)
  const [bridgeStatus, setBridgeStatus] = useState<"idle" | "success" | "error">("idle")

  const walletOptions = [
    {
      id: "freighter" as const,
      name: "Freighter",
      description: "Browser extension wallet for Stellar",
      icon: Wallet,
      popular: true,
    },
    {
      id: "stellar" as const,
      name: "Stellar Wallet",
      description: "Connect your existing Stellar wallet using secret key",
      icon: Globe,
      popular: true,
    },
    {
      id: "lobstr" as const,
      name: "LOBSTR",
      description: "Mobile and web wallet (connect using secret key)",
      icon: Smartphone,
      popular: false,
    },
    {
      id: "secret" as const,
      name: "Secret Key",
      description: "Import using your secret key",
      icon: Key,
      popular: true,
    },
  ]

  const validateSecretKey = (key: string): boolean => {
    return key.startsWith("S") && key.length === 56
  }

  const validateBridgeAmount = (amount: string): boolean => {
    const num = parseFloat(amount)
    return !isNaN(num) && num >= 0.0001 && num <= 1000
  }

  const connectWithSecretKey = async (secretKey: string) => {
    try {
      if (!validateSecretKey(secretKey)) {
        throw new Error("Invalid secret key format")
      }
      const keypair = Keypair.fromSecret(secretKey)
      const publicKey = keypair.publicKey()
      const server = new Horizon.Server('https://horizon-testnet.stellar.org');
      await server.loadAccount(publicKey)
      localStorage.setItem("wallet_public_key", publicKey)
      localStorage.setItem("wallet_secret_key", secretKey)
      return { success: true, publicKey }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Account not found. Make sure your account is funded on the Stellar testnet.")
      }
      throw new Error(error.message || "Failed to connect with secret key")
    }
  }

 const connectWithFreighter = async () => {
  try {
    if (typeof getFreighter === "undefined" || !getFreighter) {
      throw new Error("Freighter wallet extension is not installed or not detected");
    }

    const network = await getFreighter.getNetwork();
    if (network.network !== "TESTNET") {
      throw new Error("Freighter is not set to Stellar Testnet. Please switch to Testnet in Freighter settings.");
    }

    const isAllowed = await getFreighter.isAllowed();
    console.log("Freighter isAllowed:", isAllowed);
    if (!isAllowed.isAllowed) {
      toast.info("Please approve the connection in your Freighter extension.");
      // Manually trigger the connection prompt if setAllowed() fails
      await new Promise((resolve) => {
        setTimeout(() => {
          toast.info("If no prompt appears, click the Freighter extension icon to approve manually.");
          resolve(null);
        }, 1000);
      });
      await getFreighter.setAllowed();
    }

    console.log("Attempting to get address from Freighter...");
    const addressResult = await getFreighter.getAddress();
    console.log("Address result:", addressResult);

    if (!addressResult || !addressResult.address) {
      throw new Error("Failed to retrieve address. Please ensure Freighter is unlocked and try again.");
    }

    // Fix connectWithFreighter: validate publicKey as public key, not secret key
    const publicKey = addressResult.address;
    if (!publicKey.startsWith("G") || publicKey.length !== 56) {
      throw new Error("Invalid Stellar public key from Freighter")
    }

    localStorage.setItem("wallet_public_key", publicKey);
    localStorage.setItem("wallet_initialized", "true");
    return { success: true, publicKey };
  } catch (error: any) {
    console.error("Freighter connection error:", error);
    throw new Error(error.message || "Failed to connect with Freighter");
  }
};

  const handleDirectConnection = async (method: WalletMethod) => {
    setIsConnecting(true)
    setConnectionStatus("idle")
    try {
      let result
      switch (method) {
        case "secret":
        case "stellar":
        case "lobstr":
          if (!secretKey.trim()) {
            throw new Error("Please enter your secret key")
          }
          result = await connectWithSecretKey(secretKey.trim())
          break
        case "freighter":
          result = await connectWithFreighter()
          break
        default:
          throw new Error("Unsupported connection method")
      }
      if (result.success) {
        setConnectionStatus("success")
        onConnect(true)
        toast.success("Wallet connected successfully!")
        setTimeout(() => onNavigate("dashboard"), 1500)
      }
    } catch (error: any) {
      console.error("Connection error:", error)
      setConnectionStatus("error")
      toast.error(error.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConnect = async () => {
    if (!selectedMethod) {
      toast.error("Please select a connection method")
      return
    }
    // Fix handleConnect: allow all wallet options except freighter to use secret key
    if (["secret", "stellar", "lobstr"].includes(selectedMethod)) {
      await handleDirectConnection(selectedMethod as WalletMethod)
      return
    }
    if (selectedMethod === "freighter") {
      await handleDirectConnection(selectedMethod as WalletMethod)
      return
    }
    setIsModalOpen(true)
  }

  const handleModalSuccess = (publicKey: string) => {
    // Remove modal public key entry, only allow secret key or Freighter
    setConnectionStatus("success")
    onConnect(true)
    toast.success("Wallet connected successfully!")
    setTimeout(() => onNavigate("dashboard"), 1000)
  }

  const handleModalError = (error: string) => {
    setConnectionStatus("error")
    toast.error(error)
  }

  const renderConnectionStatus = () => {
    if (connectionStatus === "idle") return null
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            {connectionStatus === "success" ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-white font-medium">Wallet Connected Successfully!</p>
                  <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-white font-medium">Connection Failed</p>
                  <p className="text-sm text-gray-400">Please check your credentials and try again</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderBridgeStatus = () => {
    if (bridgeStatus === "idle") return null
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            {bridgeStatus === "success" ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-white font-medium">Bridge Successful!</p>
                  <p className="text-sm text-gray-400">USDC deposited to your Mellamate wallet.</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-white font-medium">Bridge Failed</p>
                  <p className="text-sm text-gray-400">Please check your Sepolia ETH balance and try again.</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderWalletOption = (option: (typeof walletOptions)[0]) => {
    const Icon = option.icon
    const isSelected = selectedMethod === option.id
    return (
      <div
        key={option.id}
        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
          isSelected ? "border-blue-600 bg-blue-600/10" : "border-gray-700 hover:border-gray-600"
        }`}
        onClick={() => setSelectedMethod(option.id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{option.name}</span>
                {option.popular && <Badge className="bg-green-600 text-white text-xs">Popular</Badge>}
              </div>
              <p className="text-sm text-gray-400">{option.description}</p>
            </div>
          </div>
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              isSelected ? "border-blue-600 bg-blue-600" : "border-gray-600"
            }`}
          >
            {isSelected && <div className="w-full h-full rounded-full bg-white scale-50"></div>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate("wallet-setup")}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wallet Setup
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Connect Your Wallet</h1>
          <p className="text-gray-400">Connect your Stellar wallet using your secret key or Freighter extension</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Choose Connection Method</CardTitle>
                <CardDescription className="text-gray-400">
                  Select how you'd like to connect your wallet. For MetaMask bridging, first connect a Stellar wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {walletOptions.map(renderWalletOption)}
                {["secret", "stellar", "lobstr"].includes(selectedMethod) && (
                  <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                    <Label className="text-white mb-2 block">Secret Key</Label>
                    <Input
                      type="password"
                      placeholder="SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Your secret key starts with 'S' and is 56 characters long
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            {renderConnectionStatus()}
            {renderBridgeStatus()}
          </div>

          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Security Notice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium">Secure Connection</p>
                    <p className="text-xs text-gray-400">All connections are encrypted and secure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium">Private Keys</p>
                    <p className="text-xs text-gray-400">Your keys are stored locally and never shared</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium">Stellar Testnet</p>
                    <p className="text-xs text-gray-400">Connected to Stellar testnet for safe testing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                  onClick={() => window.open("https://developers.stellar.org/docs/", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Stellar Documentation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                  onClick={() => window.open("https://freighter.app/", "_blank")}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Get Freighter Wallet
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                  onClick={() => window.open("https://docs.allbridge.io/", "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Allbridge Documentation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                  onClick={() => onNavigate("wallet-setup")}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Create New Wallet
                </Button>
              </CardContent>
            </Card>
            <Button
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              onClick={handleConnect}
              disabled={!selectedMethod || isConnecting || isBridging}
            >
              {isConnecting || isBridging ? "Processing..." : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </div>
      <WalletConnectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletType={selectedMethod}
        walletName={walletOptions.find((w) => w.id === selectedMethod)?.name || "Wallet"}
        onSuccess={handleModalSuccess}
        onError={handleModalError}
      />
    </div>
  )
}
