"use client"
import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react"

export default function MerchantDashboard() {
  const [activeSection, setActiveSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [isApiLoading, setIsApiLoading] = useState(false)
  const [merchantInfo, setMerchantInfo] = useState<any>(null)
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({})

  // Use Next.js environment variable
  const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || "https://mellamate.onrender.com"

  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const email = params.get("email")
    const business = params.get("business")
    const merchantId = params.get("merchant_id")

    // If we have email and business, create merchant account
    if (email && business && !merchantId) {
      setIsApiLoading(true)
      fetch(`${backendUrl}/api/v1/merchant/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, business_name: business }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data && data.api_key) {
            // Update URL with merchant_id and remove email/business params
            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete("email")
            newUrl.searchParams.delete("business")
            newUrl.searchParams.set("merchant_id", data.merchant_id)
            window.history.replaceState({}, "", newUrl.toString())

            // Fetch the keys for this merchant
            fetchMerchantKeys(data.merchant_id)
          }
        })
        .catch(console.error)
        .finally(() => setIsApiLoading(false))
    }
    // If merchant_id is present, fetch their keys
    else if (merchantId) {
      loadSettings(merchantId)
      loadBalances(merchantId)
      fetchMerchantKeys(merchantId)
    }
  }, [backendUrl])

  const fetchMerchantKeys = (merchantId: string) => {
    setIsApiLoading(true)
    fetch(`${backendUrl}/api/v1/merchant/${merchantId}/keys`)
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [data]
        setApiKeys(arr)
        if (arr.length > 0) {
          loadBalances(merchantId)
          setMerchantInfo(arr[0])
        }
      })
      .catch(console.error)
      .finally(() => setIsApiLoading(false))
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
    console.log(`${type} copied to clipboard`)
  }

  // ---------------- Settings state -----------------
  const [settings, setSettings] = useState<{ webhook_url: string; currencies: string[] }>({ webhook_url: "", currencies: [] })
  const supportedCurrencies = ["USD", "EUR", "ETB"]

  // ---------------- Balances -----------------
  const [balances, setBalances] = useState<Record<string, number>>({})
  const loadBalances = (merchantId: string) => {
    fetch(`${backendUrl}/api/v1/merchant/${merchantId}/balances`)
      .then((r) => r.json())
      .then(setBalances)
      .catch(console.error)
  }

  const loadSettings = (merchantId: string) => {
    fetch(`${backendUrl}/api/v1/merchant/${merchantId}/settings`)
      .then((r) => r.json())
      .then(setSettings)
      .catch(console.error)
  }

  const saveSettings = (merchantId: string) => {
    fetch(`${backendUrl}/api/v1/merchant/${merchantId}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
      .then((r) => r.json())
      .then(() => alert("Settings saved"))
      .catch(console.error)
  }

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  const sidebarItems = [
    { label: "Overview", icon: "🏠", value: "overview" },
    { label: "Transactions", icon: "💳", value: "transactions" },
    { label: "API", icon: "🔑", value: "api" },
    { label: "Settings", icon: "⚙️", value: "settings" },
  ]

  const testModeBanner = (
    <div className="w-full bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-b border-amber-800/30 text-amber-200 py-3 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse flex-shrink-0"></div>
          <span className="text-sm font-medium">
            You are currently in{" "}
            <span className="font-bold text-red-400 bg-red-900/30 px-2 py-0.5 rounded-md">test mode</span>, please wait
            for our team to review your information.
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-semibold">Test Mode</span>
          <div className="relative">
            <input
              type="checkbox"
              checked
              disabled
              className="w-4 h-4 text-amber-600 bg-amber-900/30 border-amber-700 rounded focus:ring-amber-500 focus:ring-2"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const settingsSection = merchantInfo && (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      <div className="space-y-8">
        {/* Webhook URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
          <input
            type="url"
            value={settings.webhook_url || ""}
            onChange={(e) => setSettings({ ...settings, webhook_url: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
            placeholder="https://example.com/mellamate/webhook"
          />
        </div>
        {/* Currencies */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Accepted Currencies</label>
          <div className="flex flex-wrap gap-4">
            {supportedCurrencies.map((cur) => (
              <label key={cur} className="inline-flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={settings.currencies?.includes(cur)}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setSettings((prev) => {
                      const currs = new Set(prev.currencies || [])
                      checked ? currs.add(cur) : currs.delete(cur)
                      return { ...prev, currencies: Array.from(currs) }
                    })
                  }}
                />
                {cur}
              </label>
            ))}
          </div>
        </div>
        <Button onClick={() => saveSettings(merchantInfo.merchant_id)} className="bg-blue-600 hover:bg-blue-700">
          Save Settings
        </Button>
      </div>
    </div>
  )

// -------------- Payout Modal --------------
  const [payoutOpen, setPayoutOpen] = useState(false)
  const [payoutCurrency, setPayoutCurrency] = useState<string>("USD")
  const [payoutAmount, setPayoutAmount] = useState<number>(0)
  const [payoutDestination, setPayoutDestination] = useState<string>("")

  const openPayout = (cur: string) => {
    setPayoutCurrency(cur)
    setPayoutAmount(balances[cur] || 0)
    setPayoutDestination("")
    setPayoutOpen(true)
  }

  const submitPayout = () => {
    if (!merchantInfo) return
    fetch(`${backendUrl}/api/v1/merchant/${merchantInfo.merchant_id}/payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency: payoutCurrency, amount_cents: payoutAmount, destination: payoutDestination }),
    })
      .then((r) => r.json())
      .then(() => {
        alert("Payout requested")
        setPayoutOpen(false)
        loadBalances(merchantInfo.merchant_id)
      })
      .catch(console.error)
  }

const overviewSection = (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Overview</h2>
        <p className="text-gray-400 text-sm sm:text-base">
          Welcome back! Here's what's happening with your account today.
        </p>
      </div>

      {/* Balances */}
      {merchantInfo && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Balances</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(balances).length === 0 && (
              <p className="text-gray-400">No balances yet.</p>
            )}
            {Object.entries(balances).map(([cur, cents]) => (
              <div key={cur} className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">{cur}</span>
                  <Button size="sm" onClick={() => openPayout(cur)}>
                    Payout
                  </Button>
                </div>
                <div className="text-2xl font-bold text-emerald-400">
                  {(cents / 100).toFixed(2)} {cur}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6 hover:bg-gray-800/70 transition-all duration-200 hover:border-gray-600/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <div className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400">💰</div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">Available</div>
          </div>
          <div className="text-sm text-gray-400 mb-1">Ledger Balance</div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-2">ETB 0.00</div>
          <div className="text-sm text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-md inline-block">
            ETB 0.00 ready for payout
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6 hover:bg-gray-800/70 transition-all duration-200 hover:border-gray-600/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <div className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400">📈</div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">Today</div>
          </div>
          <div className="text-sm text-gray-400 mb-1">Daily Revenue</div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-2">ETB 0.00</div>
          <div className="text-sm text-gray-400">
            From <span className="font-semibold text-white">0</span> sales
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6 hover:bg-gray-800/70 transition-all duration-200 hover:border-gray-600/50 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <div className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400">💸</div>
            </div>
            <div className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">Recent</div>
          </div>
          <div className="text-sm text-gray-400 mb-1">Daily Withdraw</div>
          <div className="text-xl sm:text-2xl font-bold text-white mb-2">ETB 0.00</div>
          <div className="text-sm text-gray-400">0 withdrawals made recently</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <span className="text-3xl sm:text-4xl">📦</span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Daily Transactions Yet</h3>
          <p className="text-gray-400 mb-4 sm:mb-6 max-w-md text-sm sm:text-base">
            Hooray, let's get you paid! Once you have transactions they will be displayed here with detailed analytics.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200">
            Start Accepting Payments
          </Button>
        </div>
      </div>
    </div>
  )

  const transactionsSection = (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Transactions</h2>
        <p className="text-gray-400 text-sm sm:text-base">Monitor and manage all your payment transactions.</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select className="bg-gray-700/50 border border-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm sm:text-base">
              <option>All Fields</option>
              <option>Status</option>
              <option>Amount</option>
              <option>Date</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <input
                placeholder="Search transactions..."
                className="bg-gray-700/50 border border-gray-600 text-white px-4 py-2 pl-10 rounded-lg w-full sm:w-64 lg:w-80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm sm:text-base placeholder-gray-400"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors duration-200 whitespace-nowrap">
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-700/50 border-b border-gray-600/50">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                  Payment Method
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Reference
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                  Type
                </th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 sm:px-6 py-12 sm:py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <span className="text-2xl sm:text-3xl">🔍</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">No transactions found</h3>
                    <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                      There are no transactions matching your current filters.
                    </p>
                    <Button
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50 bg-transparent hover:text-white"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="bg-gray-700/30 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-600/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <button className="flex items-center gap-2 hover:text-white transition-colors duration-200 p-1">
              <span>←</span> Previous
            </button>
            <span className="hidden sm:inline">Page 1 of 1</span>
            <span className="sm:hidden">1 of 1</span>
            <button className="flex items-center gap-2 hover:text-white transition-colors duration-200 p-1">
              Next <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const apiSection = (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">API Keys & Settings</h2>
        <p className="text-gray-400 text-sm sm:text-base">Manage your API keys and integration settings.</p>
      </div>

      {/* API Keys Section */}
      <div className="space-y-6">
        {isApiLoading ? (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-400 mr-3" />
                <span className="text-gray-400">Loading your API credentials...</span>
              </div>
            </CardContent>
          </Card>
        ) : apiKeys.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                  <span className="text-3xl">🔑</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No API keys found</h3>
                <p className="text-gray-400 mb-6">Your API credentials will appear here once your account is set up.</p>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700/50 bg-transparent hover:text-white"
                >
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          apiKeys.map((keyInfo) => (
            <Card key={keyInfo.merchant_id} className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{keyInfo.business_name || "Your Business"}</CardTitle>
                    <CardDescription className="text-gray-400">Merchant ID: {keyInfo.merchant_id}</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Key */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">API Key (Public)</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(keyInfo.api_key, "API Key")}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <code className="text-blue-400 font-mono text-sm break-all">{keyInfo.api_key}</code>
                  </div>
                </div>

                {/* API Secret */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">API Secret (Private)</label>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleSecretVisibility(keyInfo.merchant_id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {showSecrets[keyInfo.merchant_id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(keyInfo.api_secret, "API Secret")}
                        className="text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
                    <code className="text-red-400 font-mono text-sm break-all">
                      {showSecrets[keyInfo.merchant_id] ? keyInfo.api_secret : "•".repeat((keyInfo.api_secret || "").length)}
                    </code>
                  </div>
                  <p className="text-xs text-yellow-400 mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Keep your API secret secure! Never expose it in client-side code.
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Created</label>
                    <p className="text-white">{new Date(keyInfo.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Environment</label>
                    <p className="text-white">Test Mode</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Integration Guide */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">Quick Integration Guide</CardTitle>
            <CardDescription className="text-gray-400">Get started with your API integration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">1. Install the SDK</h4>
                <code className="text-green-400 text-sm">npm install @mellamate/api</code>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">2. Initialize the client</h4>
                <pre className="text-blue-400 text-sm overflow-x-auto">
                  {`const client = new MellaMate({
  apiKey: '${apiKeys[0]?.api_key || "your-api-key"}',
  environment: 'test'
});`}
                </pre>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">3. Create a payment</h4>
                <pre className="text-purple-400 text-sm overflow-x-auto">
                  {`const payment = await client.payments.create({
  amount: 100.00,
  currency: 'USD',
  description: 'Test payment'
});`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const sidebar = (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-0
        bg-gray-900/95 backdrop-blur-sm border-r border-gray-700/50 
        min-h-screen w-72 flex flex-col shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="p-4 sm:p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-sm sm:text-lg font-bold shadow-md">
                {merchantInfo?.business_name?.charAt(0) || "M"}
              </div>
              <div>
                <div className="font-bold text-white text-base sm:text-lg">
                  {merchantInfo?.business_name || "Merchant"}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">ID: {merchantInfo?.merchant_id || "—"}</div>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.value}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${
                  activeSection === item.value
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
                onClick={() => {
                  setActiveSection(item.value)
                  setSidebarOpen(false) // Close sidebar on mobile after selection
                }}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {activeSection === item.value && <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-700/50">
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-colors duration-200 shadow-sm">
            💬 Support
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {testModeBanner}
      <div className="flex flex-1 relative">
        {sidebar}
        <main className="flex-1 bg-transparent lg:ml-0">
          {/* Mobile Header */}
          <div className="lg:hidden bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 p-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-white capitalize">{activeSection}</h1>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>

          {activeSection === "overview" && overviewSection}
          {activeSection === "transactions" && transactionsSection}
          {activeSection === "settings" && settingsSection}
        {activeSection === "api" && apiSection}
        {/* Payout Modal */}
      {payoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Request Payout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Currency</label>
                <select
                  value={payoutCurrency}
                  onChange={(e) => setPayoutCurrency(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                >
                  {Object.keys(balances).map((cur) => (
                    <option key={cur} value={cur}>
                      {cur}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Amount (cents)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(parseInt(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Destination Address / Bank</label>
                <input
                  type="text"
                  value={payoutDestination}
                  onChange={(e) => setPayoutDestination(e.target.value)}
                  placeholder="Stellar address or bank details"
                  className="w-full bg-gray-700 border border-gray-600 rounded p-2 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setPayoutOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submitPayout} disabled={payoutAmount <= 0 || !payoutDestination}>
                Request
              </Button>
            </div>
          </div>
        </div>
      )}

        </main>
      </div>
    </div>
  )
}
