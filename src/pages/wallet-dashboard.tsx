import { useState, useEffect } from "react"
import { ethers } from "ethers"
import * as StellarSdk from "stellar-sdk"
import { Horizon } from "stellar-sdk"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Separator } from "../components/ui/separator"
import {
  Send,
  ReceiptIcon as Receive,
  ArrowUpRight,
  ArrowDownLeft,
  Copy,
  QrCodeIcon,
  RefreshCw,
  DollarSign,
  Euro,
  PoundSterling,
  Coins,
} from "lucide-react"
import { toast } from "react-toastify"
import { QRCodeSVG } from "qrcode.react"
import api from "../lib/api"
import {
  isConnected,
  setAllowed,
  signTransaction,
  getAddress,
} from "@stellar/freighter-api"

// Add global type augmentation for window.ethereum and freighterApi
declare global {
  interface Window {
    freighterApi?: any
    ethereum?: any
  }
}

interface Asset {
  code: string
  issuer?: string
  name: string
  symbol: string
  native?: boolean
  icon?: any
}

interface Balance {
  balance: string
  asset_type: string
  asset_code?: string
  asset_issuer?: string
}

interface Transaction {
  id: string
  type: "received" | "sent"
  amount: number
  asset: string
  counterparty: string
  created_at: string
  transaction_hash: string
}

interface WalletDashboardProps {
  onNavigate?: (page: string) => void
  isLoggedIn: boolean
}

export default function WalletDashboard({ onNavigate, isLoggedIn }: WalletDashboardProps) {
  const [balance, setBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [isWalletInitialized, setIsWalletInitialized] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [transferAmount, setTransferAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [bridgeAmount, setBridgeAmount] = useState("")
  const [bridgeAsset, setBridgeAsset] = useState<"ETH" | "USDC">("ETH")
  const [ethAddress, setEthAddress] = useState<string | null>(null)
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false)

  // Supported assets configuration
  const SUPPORTED_ASSETS: Asset[] = [
    {
      code: "XLM",
      name: "Stellar Lumens",
      symbol: "XLM",
      native: true,
      icon: Coins,
    },
    {
      code: "USDC",
      name: "USD Coin",
      symbol: "$",
      native: false,
      issuer: "GDQOE23C3GUVPE7L5OXKQN3AXKX5J2YN6Z4OGHZEG2CT5N2NOK5C3G7A",
      icon: DollarSign,
    },
    {
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      native: false,
      issuer: "GCBH4BD7KSAB3QITYVZFWQTAND6TOE3ZPKNYDKE2VEOQ7H3BKHETTVNP",
      icon: DollarSign,
    },
    {
      code: "EUR",
      name: "Euro",
      symbol: "€",
      native: false,
      issuer: "GCBH4BD7KSAB3QITYVZFWQTAND6TOE3ZPKNYDKE2VEOQ7H3BKHETTVNP",
      icon: Euro,
    },
  ]

  // Multi-currency state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [balances, setBalances] = useState<Balance[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string>("XLM")
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>({
    USD: 0.12,
    EUR: 0.11,
    GBP: 0.09,
    XLM: 1.0,
    USDC: 0.12,
  })
  const [supportedCurrencies] = useState([
    { code: "XLM", name: "Stellar Lumens", symbol: "XLM", icon: Coins, native: true },
    { code: "USDC", name: "USD Coin", symbol: "$", icon: DollarSign, native: false },
    { code: "USD", name: "US Dollar", symbol: "$", icon: DollarSign, native: false },
    { code: "EUR", name: "Euro", symbol: "€", icon: Euro, native: false },
    { code: "GBP", name: "British Pound", symbol: "£", icon: PoundSterling, native: false },
  ])

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn && onNavigate) {
      onNavigate("login")
    }
  }, [isLoggedIn, onNavigate])

  // Log freighterApi and ethereum after mount for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("window.freighterApi in WalletDashboard:", window.freighterApi)
      console.log("window.ethereum in WalletDashboard:", window.ethereum)
    }
  }, [])

  // Connect MetaMask
  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast.error("MetaMask extension is not installed. Please install MetaMask to proceed.")
      return
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])
      setEthAddress(accounts[0])
      setIsMetaMaskConnected(true)
      toast.success("MetaMask connected successfully!")
      await provider.send("wallet_switchEthereumChain", [{ chainId: "0xaa36a7" }])
    } catch (err) {
      console.error("MetaMask connection error:", err)
      toast.error("Failed to connect MetaMask: " + (err as Error).message)
    }
  }

  // Fetch balance directly from Stellar Horizon
  const fetchBalance = async () => {
    try {
      setLoadingBalance(true)
      const publicKey = localStorage.getItem("wallet_public_key")
      if (!publicKey) return

      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${publicKey}`)
      if (!response.ok) {
        if (response.status === 404) {
          setBalance(0)
          setBalances([])
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const accountData = await response.json()
      console.log("Account data:", accountData)

      setBalances(accountData.balances || [])
      const xlmBalance = accountData.balances?.find((bal: Balance) => bal.asset_type === "native")
      setBalance(xlmBalance ? Number.parseFloat(xlmBalance.balance) : 0)
      setLastUpdated(new Date())
      if (!selectedAsset) {
        setSelectedAsset(SUPPORTED_ASSETS[0])
      }
    } catch (err) {
      console.error("Failed to load wallet balance:", err)
      toast.error("Failed to load wallet balance. Please check your connection.")
      setBalance(0)
      setBalances([])
    } finally {
      setLoadingBalance(false)
    }
  }

  // Fetch transactions from Stellar Horizon
  const fetchTransactions = async () => {
    const pubKey = localStorage.getItem("wallet_public_key")
    if (!pubKey) return

    try {
      setLoadingTx(true)
      console.log("Fetching transactions for:", pubKey)
      const response = await fetch(
        `https://horizon-testnet.stellar.org/accounts/${pubKey}/payments?limit=20&order=desc`
      )
      if (!response.ok) {
        if (response.status === 404) {
          console.log("No transactions found")
          setTransactions([])
          return
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      const records = data._embedded?.records ?? []
      console.log("Transaction records:", records)

      const parsedTransactions: Transaction[] = records
        .filter((r: any) => r.asset_type === "native" || r.asset_code === "USDC")
        .map((r: any): Transaction => {
          const isReceived = r.to === pubKey
          const amount = Number.parseFloat(r.amount || "0")
          return {
            id: r.id,
            type: isReceived ? "received" : "sent",
            amount,
            asset: r.asset_type === "native" ? "XLM" : r.asset_code,
            counterparty: isReceived ? r.from : r.to,
            created_at: r.created_at,
            transaction_hash: r.transaction_hash,
          }
        })

      setTransactions(parsedTransactions)
      console.log("Parsed transactions:", parsedTransactions)
    } catch (err) {
      console.error("Failed to load transactions:", err)
      toast.error("Failed to load transaction history.")
    } finally {
      setLoadingTx(false)
    }
  }

  // Fetch exchange rates
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=stellar,usd-coin&vs_currencies=usd,eur,gbp"
      )
      if (response.ok) {
        const data = await response.json()
        setExchangeRates({
          USD: data.stellar?.usd || 0.12,
          USDC: data["usd-coin"]?.usd || 1.0,
          EUR: data.stellar?.eur || 0.11,
          GBP: data.stellar?.gbp || 0.09,
          XLM: 1.0,
        })
      }
    } catch (error) {
      console.log("Using fallback exchange rates")
    }
  }

  const convertFromXLM = (xlmAmount: number, toCurrency: string): number => {
    if (toCurrency === "XLM") return xlmAmount
    return xlmAmount * exchangeRates[toCurrency]
  }

  const convertToXLM = (amount: number, fromCurrency: string): number => {
    if (fromCurrency === "XLM") return amount
    return amount / exchangeRates[fromCurrency]
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const currencyInfo = supportedCurrencies.find((c) => c.code === currency)
    if (!currencyInfo) return `${amount.toFixed(2)} ${currency}`
    if (currency === "XLM") {
      return `${amount.toFixed(7)} ${currencyInfo.symbol}`
    }
    return `${currencyInfo.symbol}${amount.toFixed(2)}`
  }

  // Initialize selected asset on component mount
  useEffect(() => {
    if (SUPPORTED_ASSETS.length > 0 && !selectedAsset) {
      setSelectedAsset(SUPPORTED_ASSETS[0])
    }
  }, [selectedAsset])

  // Check wallet initialization and fetch data
  useEffect(() => {
    const checkWalletInitialized = () => {
      const initialized = localStorage.getItem("wallet_initialized") === "true"
      setIsWalletInitialized(initialized)
      if (isLoggedIn) {
        fetchBalance()
        fetchTransactions()
        fetchExchangeRates()
      } else if (!isLoggedIn) {
        onNavigate?.("login")
      }
    }
    checkWalletInitialized()
  }, [isLoggedIn, onNavigate])

  // Refresh data
  const refreshData = async () => {
    await Promise.all([fetchBalance(), fetchTransactions()])
    toast.success("Data refreshed successfully!")
  }

  // Ensure trustline for USDC
  const ensureTrustline = async (publicKey: string, asset: Asset) => {
    if (asset.native || !asset.issuer) return true
    try {
      const server = new Horizon.Server("https://horizon-testnet.stellar.org")
      const account = await server.loadAccount(publicKey)
      const hasTrustline = account.balances.some(
        (bal) =>
          "asset_code" in bal &&
          "asset_issuer" in bal &&
          bal.asset_code === asset.code &&
          bal.asset_issuer === asset.issuer
      )
      if (!hasTrustline) {
        const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
          fee: StellarSdk.BASE_FEE,
          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
          .addOperation(
            StellarSdk.Operation.changeTrust({
              asset: new StellarSdk.Asset(asset.code, asset.issuer),
            })
          )
          .setTimeout(30)
          .build()
        const xdr = transactionBuilder.toXDR()
        const signedResult = await signTransaction(xdr, {
          networkPassphrase: StellarSdk.Networks.TESTNET,
        })
        const signedXDR = signedResult.signedTxXdr
        const tx = new StellarSdk.Transaction(signedXDR, StellarSdk.Networks.TESTNET)
        await server.submitTransaction(tx)
        console.log(`Trustline established for ${asset.code}`)
        return true
      }
      return true
    } catch (err) {
      console.error("Error establishing trustline:", err)
      toast.error(`Failed to establish trustline for ${asset.code}: ${(err as Error).message}`)
      return false
    }
  }

  // Handle bridge deposit
  const handleBridgeDeposit = async () => {
    if (!isWalletInitialized) {
      toast.error("Wallet not initialized. Please set up your wallet first.")
      onNavigate?.("setup")
      return
    }
    if (!isMetaMaskConnected || !ethAddress) {
      toast.error("Please connect MetaMask to proceed.")
      return
    }
    if (!bridgeAmount || Number.parseFloat(bridgeAmount) <= 0) {
      toast.error("Please enter a valid amount.")
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading("Processing bridge deposit...")

    try {
      const publicKey = localStorage.getItem("wallet_public_key")
      if (!publicKey) {
        throw new Error("Wallet public key not found. Please log in again.")
      }

      // Connect to MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Ethereum bridge contract address (hypothetical)
      const bridgeAddress = "0x1234567890abcdef1234567890abcdef12345678"
      const amount = ethers.parseUnits(bridgeAmount, bridgeAsset === "ETH" ? 18 : 6)

      let ethTxHash: string
      if (bridgeAsset === "ETH") {
        // Send ETH to bridge contract
        const tx = await signer.sendTransaction({
          to: bridgeAddress,
          value: amount,
        })
        ethTxHash = tx.hash
        await tx.wait()
        console.log("Ethereum transaction confirmed:", ethTxHash)
      } else {
        // Send USDC to bridge contract
        const usdcContractAddress = "0x1c7D4B196Cb0C7B01d064F05a8C3629C5b4cC1B3"
        const usdcAbi = [
          "function transfer(address to, uint256 amount) public returns (bool)",
          "function balanceOf(address account) public view returns (uint256)",
        ]
        const usdcContract = new ethers.Contract(usdcContractAddress, usdcAbi, signer)
        const balance = await usdcContract.balanceOf(ethAddress)
        if (balance < amount) {
          throw new Error("Insufficient USDC balance in MetaMask")
        }
        const tx = await usdcContract.transfer(bridgeAddress, amount)
        ethTxHash = tx.hash
        await tx.wait()
        console.log("USDC transaction confirmed:", ethTxHash)
      }

      // Ensure trustline for USDC if bridging USDC
      const stellarAsset = SUPPORTED_ASSETS.find((a) => a.code === "USDC")
      if (bridgeAsset === "USDC" && stellarAsset) {
        const trustlineSuccess = await ensureTrustline(publicKey, stellarAsset)
        if (!trustlineSuccess) {
          throw new Error("Failed to establish USDC trustline")
        }
      }

      // Prepare bridge payload
      const payload = {
        eth_address: ethAddress,
        stellar_address: publicKey,
        amount: bridgeAmount,
        asset: bridgeAsset,
        eth_tx_hash: ethTxHash,
      }

      console.log("Sending bridge request to /api/wallet/bridge")
      console.log("Bridge payload:", payload)

      // Call bridge API
      const response = await api.post("/api/wallet/bridge", payload)
      const { signed_xdr } = response.data

      // Sign Stellar transaction with Freighter if available and connected
      let finalXDR = signed_xdr
      let submitted = false
      if (window.freighterApi) {
        try {
          const connected = await isConnected()
          if (connected) {
            const signedResult = await signTransaction(signed_xdr, {
              networkPassphrase: StellarSdk.Networks.TESTNET,
            })
            finalXDR = signedResult.signedTxXdr
            submitted = true
            const server = new Horizon.Server("https://horizon-testnet.stellar.org")
            const tx = new StellarSdk.Transaction(finalXDR, StellarSdk.Networks.TESTNET)
            await server.submitTransaction(tx)
            console.log("Stellar bridge transaction submitted via Freighter:", finalXDR)
          }
        } catch (err) {
          console.error("Freighter signing failed, falling back to secret key:", err)
        }
      }
      // If not submitted via Freighter, use secret key wallet
      if (!submitted) {
        const secretKey = localStorage.getItem("wallet_secret_key")
        if (!secretKey) throw new Error("No Stellar secret key found for fallback signing.")
        const tx = new StellarSdk.Transaction(finalXDR, StellarSdk.Networks.TESTNET)
        tx.sign(StellarSdk.Keypair.fromSecret(secretKey))
        const server = new Horizon.Server("https://horizon-testnet.stellar.org")
        await server.submitTransaction(tx)
        console.log("Stellar bridge transaction submitted via secret key:", finalXDR)
      }

      await refreshData()
      setLastUpdated(new Date())
      toast.success(
        <div>
          <p>Bridge deposit successful!</p>
          <p className="text-xs mt-1">Deposited: {bridgeAmount} {bridgeAsset}</p>
          <p className="text-xs">Ethereum Tx: {formatAddress(ethTxHash, 6)}</p>
        </div>
      )
      setBridgeAmount("")
    } catch (error: any) {
      console.error("Bridge deposit error:", error)
      if (error.response) {
        console.log("Full error response:", JSON.stringify(error.response.data, null, 2))
        toast.error(`Bridge deposit failed: ${error.response.data?.detail || "Unknown error"}`)
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.")
      } else {
        toast.error(`Bridge deposit failed: ${error.message || "Unknown error"}`)
      }
    } finally {
      setIsProcessing(false)
      toast.dismiss(toastId)
    }
  }

  const handleTransfer = async () => {
    if (!isWalletInitialized) {
      toast.error("Wallet not initialized. Please set up your wallet first.")
      onNavigate?.("setup")
      return
    }

    if (!transferAmount || !recipientAddress || !selectedAsset) {
      toast.error("Please fill in all fields and select an asset")
      return
    }

    const amount = Number.parseFloat(transferAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (!recipientAddress.startsWith("G") || recipientAddress.length !== 56) {
      toast.error("Please enter a valid Stellar address (56 characters starting with 'G')")
      return
    }

    const assetBalance = balances.find(
      (bal) =>
        (selectedAsset.native && bal.asset_type === "native") ||
        (bal.asset_code === selectedAsset.code && bal.asset_issuer === selectedAsset.issuer)
    )

    if (!assetBalance || parseFloat(assetBalance.balance) < amount + 0.00001) {
      toast.error(`Insufficient ${selectedAsset.code} balance (including 0.00001 XLM fee)`)
      return
    }

    setIsProcessing(true)
    const toastId = toast.loading("Processing transaction...")

    try {
      const publicKey = localStorage.getItem("wallet_public_key")
      const secretKey = localStorage.getItem("wallet_secret_key")
      const walletInitialized = localStorage.getItem("wallet_initialized") === "true"

      if (!publicKey) {
        throw new Error("Wallet public key not found. Please log in again.")
      }
      if (!secretKey && !walletInitialized) {
        throw new Error("Wallet secret key not found. Please log in again.")
      }

      const assetPayload: { code: string; issuer?: string } = { code: selectedAsset.code }
      if (!selectedAsset.native && selectedAsset.issuer) {
        assetPayload.issuer = selectedAsset.issuer
      }

      let payload: any = {
        source_public: publicKey,
        destination: recipientAddress,
        amount: amount.toString(),
        asset: assetPayload,
        memo: "Sent via MellaMate",
        use_freighter: walletInitialized && !secretKey ? true : false,
      }

      if (payload.use_freighter) {
        try {
          if (!window.freighterApi) {
            toast.error("Freighter wallet extension is not installed. Please install Freighter to proceed.")
            setIsProcessing(false)
            toast.dismiss(toastId)
            return
          }

          const connected = await isConnected()
          if (!connected) {
            await setAllowed()
          }
          const { address: freighterPublicKey, error: addressError } = await getAddress()
          if (addressError || !freighterPublicKey) {
            toast.error("Could not get public key from Freighter.")
            setIsProcessing(false)
            toast.dismiss(toastId)
            return
          }

          if (freighterPublicKey !== publicKey) {
            toast.error("Freighter wallet address does not match the logged-in wallet. Please use the correct Freighter account.")
            setIsProcessing(false)
            toast.dismiss(toastId)
            return
          }

          const server = new Horizon.Server("https://horizon-testnet.stellar.org")
          const account = await server.loadAccount(freighterPublicKey)
          const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
          })
            .addOperation(
              StellarSdk.Operation.payment({
                destination: recipientAddress,
                asset: selectedAsset.native
                  ? StellarSdk.Asset.native()
                  : new StellarSdk.Asset(selectedAsset.code, selectedAsset.issuer),
                amount: amount.toString(),
              })
            )
            .addMemo(StellarSdk.Memo.text("Sent via MellaMate"))
            .setTimeout(30)
            .build()

          const xdr = transactionBuilder.toXDR()
          let signedXDR
          try {
            const signedResult = await signTransaction(xdr, {
              networkPassphrase: StellarSdk.Networks.TESTNET,
            })
            signedXDR = signedResult.signedTxXdr
            console.log("Signed XDR from Freighter:", signedXDR)
          } catch (err) {
            console.error("Error during Freighter signing:", err)
            toast.error("Freighter signing failed: " + (err as Error).message)
            setIsProcessing(false)
            toast.dismiss(toastId)
            return
          }
          payload.signed_xdr = signedXDR
          delete payload.source_secret
        } catch (err) {
          console.error("Error in Freighter block:", err)
          toast.error("Freighter error: " + (err as Error).message)
          setIsProcessing(false)
          toast.dismiss(toastId)
          return
        }
      } else if (!walletInitialized || secretKey) {
        payload.source_secret = secretKey
      }

      if (payload.use_freighter && !payload.signed_xdr) {
        toast.error("Freighter signing failed or was cancelled. No signed XDR.")
        console.error("No signed_xdr present in payload for Freighter payment:", payload)
        setIsProcessing(false)
        toast.dismiss(toastId)
        return
      }

      console.log("Sending payment request to /api/wallet/send")
      console.log("Destination:", recipientAddress)
      console.log("Amount:", amount, selectedAsset.code)
      console.log("Payload:", payload)

      const response = await api.post("/api/wallet/send", payload)
      console.log("Payment response:", response.data)

      await refreshData()
      setLastUpdated(new Date())
      toast.success(
        <div>
          <p>Transaction successful!</p>
          <p className="text-xs mt-1">Sent: {amount} {selectedAsset.code}</p>
          <p className="text-xs">To: {formatAddress(recipientAddress, 8)}</p>
        </div>
      )
      setTransferAmount("")
      setRecipientAddress("")
    } catch (error: any) {
      console.error("Payment error:", error)
      if (error.response) {
        console.log("Full error response:", JSON.stringify(error.response.data, null, 2))
        const errorMessage = error.response.data?.detail || "Failed to send payment"
        toast.error(`Payment failed: ${errorMessage}`)
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.")
      } else {
        toast.error(`Payment failed: ${error.message || "Unknown error"}`)
      }
    } finally {
      setIsProcessing(false)
      toast.dismiss(toastId)
    }
  }

  // Get wallet address from localStorage
  const walletAddress = localStorage.getItem("wallet_public_key") || ""

  // Format address for display
  const formatAddress = (address: string, length = 8) => {
    if (!address) return ""
    if (address.length <= length * 2) return address
    return `${address.slice(0, length)}...${address.slice(-length)}`
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-6">
      <div className="container mx-auto px-4 max-w-6xl">
        <Card className="mb-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-300">Total Balance</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshData}
                    disabled={loadingBalance || loadingTx}
                    className="h-6 w-6 p-0 hover:bg-gray-700/50"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingBalance || loadingTx ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <div className="text-3xl font-bold text-white">
                  {loadingBalance ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      Loading...
                    </div>
                  ) : balance === null ? (
                    "Unable to load"
                  ) : (
                    <div className="space-y-1">
                      <div>
                        {formatCurrency(
                          selectedCurrency === "XLM" ? (balance ?? 0) : convertFromXLM(balance ?? 0, selectedCurrency),
                          selectedCurrency
                        )}
                      </div>
                      {selectedCurrency !== "XLM" && (
                        <div className="text-lg text-gray-400">≈ {(balance ?? 0).toFixed(7)} XLM</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-gray-400">Display in:</span>
                  <select
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  >
                    {supportedCurrencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                  {lastUpdated && <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>}
                </div>
                {walletAddress && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400">Wallet Address:</p>
                    <p className="text-xs font-mono text-gray-300">{formatAddress(walletAddress, 6)}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setActiveTab("send")}>
                  <Send className="w-4 h-4 mr-1" />
                  Send
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveTab("receive")}>
                  <Receive className="w-4 h-4 mr-1" />
                  Receive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-gray-900 border border-gray-800 h-10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 text-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="send" className="data-[state=active]:bg-blue-600 text-sm">
              Send
            </TabsTrigger>
            <TabsTrigger value="receive" className="data-[state=active]:bg-blue-600 text-sm">
              Receive
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-blue-600 text-sm">
              History
            </TabsTrigger>
            <TabsTrigger value="bridge" className="data-[state=active]:bg-blue-600 text-sm">
              Bridge
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveTab("send")}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Money
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    onClick={() => setActiveTab("receive")}
                  >
                    <Receive className="w-4 h-4 mr-2" />
                    Receive Money
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    onClick={() => setActiveTab("bridge")}
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Bridge Deposit
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {loadingTx ? (
                      <p className="text-gray-400 text-sm">Loading transactions...</p>
                    ) : transactions.length === 0 ? (
                      <p className="text-gray-400 text-sm">No transactions yet</p>
                    ) : (
                      transactions.slice(0, 3).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {tx.type === "received" ? (
                              <ArrowDownLeft className="w-3 h-3 text-green-400" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3 text-red-400" />
                            )}
                            <span className="text-gray-300">{tx.type === "received" ? "Received" : "Sent"}</span>
                          </div>
                          <span className="font-medium text-white">
                            {tx.amount.toFixed(4)} {tx.asset}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Network Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Stellar Testnet</span>
                      <Badge className="bg-green-600 text-white text-xs">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Base Fee</span>
                      <span className="text-white">100 stroops</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-white">Exchange Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {supportedCurrencies
                      .filter((c) => c.code !== "XLM")
                      .map((currency) => {
                        const Icon = currency.icon
                        return (
                          <div key={currency.code} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Icon className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-300">1 XLM</span>
                            </div>
                            <span className="text-white font-medium">
                              {formatCurrency(exchangeRates[currency.code], currency.code)}
                            </span>
                          </div>
                        )
                      })}
                  </div>
                  <div className="mt-3 text-xs text-gray-400">Rates updated: {new Date().toLocaleTimeString()}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="send" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white">Send Payment</CardTitle>
                <CardDescription className="text-gray-400">Send XLM or USDC to another Stellar address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currency" className="text-white text-sm">
                        Currency
                      </Label>
                      <select
                        id="currency"
                        value={selectedCurrency}
                        onChange={(e) => {
                          setSelectedCurrency(e.target.value)
                          const asset = SUPPORTED_ASSETS.find((a) => a.code === e.target.value)
                          setSelectedAsset(asset || SUPPORTED_ASSETS[0])
                        }}
                        className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        {supportedCurrencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="recipient" className="text-white text-sm">
                        Recipient's Public Key
                      </Label>
                      <Input
                        id="recipient"
                        type="text"
                        placeholder="G..."
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1 font-mono text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">Enter the recipient's Stellar public key (starts with G...)</p>
                    </div>
                    <div>
                      <Label htmlFor="amount" className="text-white text-sm">
                        Amount ({supportedCurrencies.find((c) => c.code === selectedCurrency)?.symbol})
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step={selectedCurrency === "XLM" ? "0.0000001" : "0.01"}
                        placeholder={selectedCurrency === "XLM" ? "0.0000000" : "0.00"}
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1"
                      />
                      {balance !== null && (
                        <div className="text-xs text-gray-400 mt-1 space-y-1">
                          <p>
                            Available:{" "}
                            {formatCurrency(
                              selectedCurrency === "XLM" ? balance : convertFromXLM(balance, selectedCurrency),
                              selectedCurrency
                            )}
                          </p>
                          {selectedCurrency !== "XLM" && transferAmount && (
                            <p>
                              ≈ {convertToXLM(Number.parseFloat(transferAmount), selectedCurrency).toFixed(7)} XLM will
                              be sent
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white">Transaction Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount ({selectedCurrency})</span>
                        <span className="text-white">
                          {formatCurrency(transferAmount ? Number.parseFloat(transferAmount) : 0, selectedCurrency)}
                        </span>
                      </div>
                      {selectedCurrency !== "XLM" && transferAmount && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">XLM Equivalent</span>
                          <span className="text-white">
                            {convertToXLM(Number.parseFloat(transferAmount), selectedCurrency).toFixed(7)} XLM
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Exchange Rate</span>
                        <span className="text-white">
                          1 XLM = {formatCurrency(exchangeRates[selectedCurrency], selectedCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Network Fee</span>
                        <span className="text-white">0.00001 XLM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Platform Fee (0.1%)</span>
                        <span className="text-white">
                          {transferAmount
                            ? (convertToXLM(Number.parseFloat(transferAmount), selectedCurrency) * 0.001).toFixed(7)
                            : "0.0000000"}{" "}
                          XLM
                        </span>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Total (XLM)</span>
                        <span className="text-white">
                          {transferAmount
                            ? (convertToXLM(Number.parseFloat(transferAmount), selectedCurrency) * 1.001 + 0.00001).toFixed(7)
                            : "0.00001"}{" "}
                          XLM
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleTransfer}
                  disabled={
                    !transferAmount ||
                    !recipientAddress ||
                    isProcessing ||
                    balance === null ||
                    Number.parseFloat(transferAmount) > (Number.parseFloat(balances.find(b => b.asset_type === (selectedAsset?.native ? "native" : selectedAsset?.code))?.balance ?? "0"))
                  }
                >
                  {isProcessing ? "Processing..." : "Send Payment"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receive" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white">Receive Payments</CardTitle>
                <CardDescription className="text-gray-400">Share your address to receive XLM or USDC payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white text-sm">Your Wallet Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={walletAddress}
                          readOnly
                          className="bg-gray-800 border-gray-700 text-white font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                          onClick={() => {
                            if (walletAddress) {
                              navigator.clipboard.writeText(walletAddress)
                              toast.success("Address copied to clipboard")
                            }
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg space-y-2">
                      {walletAddress ? (
                        <QRCodeSVG
                          value={walletAddress}
                          size={128}
                          level="H"
                          includeMargin={true}
                          className="w-full h-auto max-w-[128px]"
                        />
                      ) : (
                        <div className="w-24 h-24 flex items-center justify-center bg-gray-100 rounded">
                          <QrCodeIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <p className="text-xs text-gray-500 text-center mt-2">Scan to send XLM or USDC</p>
                    </div>
                  </div>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white">How to Receive</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
                          1
                        </div>
                        <div>Share your wallet address or QR code</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
                          2
                        </div>
                        <div>Sender initiates XLM or USDC transfer</div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5">
                          3
                        </div>
                        <div>Funds appear in 3-5 seconds</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white">Transaction History</CardTitle>
                <CardDescription className="text-gray-400">View all your XLM and USDC transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loadingTx ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-400">Loading transactions...</span>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>No transactions found</p>
                      <p className="text-sm mt-1">Your transactions will appear here once you send or receive XLM or USDC</p>
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <Card key={tx.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-full ${
                                  tx.type === "received" ? "bg-green-600/20" : "bg-red-600/20"
                                }`}
                              >
                                {tx.type === "received" ? (
                                  <ArrowDownLeft className="w-4 h-4 text-green-400" />
                                ) : (
                                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-white text-sm">
                                  {tx.type === "received" ? "Received from" : "Sent to"}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                  {formatAddress(tx.counterparty, 6)}
                                </div>
                                <div className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleString()}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div
                                className={`font-medium ${tx.type === "received" ? "text-green-400" : "text-red-400"}`}
                              >
                                {tx.type === "received" ? "+" : "-"}
                                {tx.amount.toFixed(7)} {tx.asset}
                              </div>
                              {selectedCurrency !== "XLM" && (
                                <div className="text-xs text-gray-400">
                                  ≈ {formatCurrency(convertFromXLM(tx.amount, selectedCurrency), selectedCurrency)}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bridge" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-white">Bridge Deposit</CardTitle>
                <CardDescription className="text-gray-400">
                  Deposit Sepolia ETH or USDC from Ethereum to your Stellar wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="bridge-asset" className="text-white text-sm">
                        Asset
                      </Label>
                      <select
                        id="bridge-asset"
                        value={bridgeAsset}
                        onChange={(e) => setBridgeAsset(e.target.value as "ETH" | "USDC")}
                        className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      >
                        <option value="ETH">Sepolia ETH</option>
                        <option value="USDC">USDC</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="bridge-amount" className="text-white text-sm">
                        Amount ({bridgeAsset})
                      </Label>
                      <Input
                        id="bridge-amount"
                        type="number"
                        step={bridgeAsset === "ETH" ? "0.000000000000000001" : "0.01"}
                        placeholder={bridgeAsset === "ETH" ? "0.000000000000000000" : "0.00"}
                        value={bridgeAmount}
                        onChange={(e) => setBridgeAmount(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Ethereum Wallet</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={ethAddress ? formatAddress(ethAddress, 6) : "Not connected"}
                          readOnly
                          className="bg-gray-800 border-gray-700 text-white font-mono text-xs"
                        />
                        <Button
                          variant="outline"
                          className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                          onClick={connectMetaMask}
                        >
                          {isMetaMaskConnected ? "Connected" : "Connect MetaMask"}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-white">Bridge Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount</span>
                        <span className="text-white">{bridgeAmount || "0"} {bridgeAsset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Destination</span>
                        <span className="text-white font-mono">{formatAddress(walletAddress, 6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Network Fee (ETH)</span>
                        <span className="text-white">~0.0001 ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bridge Fee (0.5%)</span>
                        <span className="text-white">
                          {bridgeAmount ? (Number.parseFloat(bridgeAmount) * 0.005).toFixed(6) : "0"} {bridgeAsset}
                        </span>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div className="flex justify-between font-medium">
                        <span className="text-white">Total ({bridgeAsset})</span>
                        <span className="text-white">
                          {bridgeAmount ? (Number.parseFloat(bridgeAmount) * 1.005).toFixed(6) : "0"} {bridgeAsset}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleBridgeDeposit}
                  disabled={!bridgeAmount || isProcessing || !isMetaMaskConnected}
                >
                  {isProcessing ? "Processing..." : "Deposit"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}