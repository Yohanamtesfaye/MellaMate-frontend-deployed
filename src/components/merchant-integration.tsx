"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Copy, DollarSign, TrendingUp, Activity, Clock } from "lucide-react"
import { toast } from "react-toastify"


interface MerchantDashboardProps {
  onNavigate: (page: string) => void
}

export default function MerchantDashboard({ onNavigate }: MerchantDashboardProps) {
  const [apiKey, setApiKey] = useState("demo_api_key_12345678901234567890")
  const [merchantId, setMerchantId] = useState("merchant_demo_12345")
  const [stats, setStats] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const generateApiKey = () => {
    const newApiKey = `api_${Math.random().toString(36).substr(2, 32)}`
    setApiKey(newApiKey)
    toast.success("New API key generated!")
  }

  const generateMerchantId = () => {
    const newMerchantId = `merchant_${Math.random().toString(36).substr(2, 16)}`
    setMerchantId(newMerchantId)
    toast.success("New merchant ID generated!")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const loadMerchantData = async () => {
    if (!apiKey || !merchantId) return

    setLoading(true)
    try {
      // Load stats
      const statsResponse = await fetch("https://mellamate.onrender.com/api/v1/merchant/stats", {
        headers: {
          "X-API-Key": apiKey,
          "X-Merchant-ID": merchantId,
        },
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load transactions
      const transactionsResponse = await fetch("https://mellamate.onrender.com/api/v1/merchant/transactions", {
        headers: {
          "X-API-Key": apiKey,
          "X-Merchant-ID": merchantId,
        },
      })

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        setTransactions(transactionsData.transactions || [])
      }
    } catch (error) {
      console.error("Failed to load merchant data:", error)
      toast.error("Failed to load merchant data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMerchantData()
  }, [apiKey, merchantId])

  const handlePaymentComplete = (payment: any) => {
    toast.success("Payment completed successfully!")
    loadMerchantData() // Refresh data
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Merchant Dashboard</h1>
          <p className="text-gray-300">Manage your XLM payment integration</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Create Payment</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="integration">API Integration</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_revenue || "0.00"} XLM</div>
                  <p className="text-xs text-muted-foreground">All time earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.total_transactions || 0}</div>
                  <p className="text-xs text-muted-foreground">Processed payments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.success_rate || "0%"}</div>
                  <p className="text-xs text-muted-foreground">Payment success rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.completed_transactions || 0}</div>
                  <p className="text-xs text-muted-foreground">Successful payments</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest payment activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">{tx.transaction_id}</p>
                          <p className="text-sm text-gray-600">{new Date(tx.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{tx.amount} XLM</span>
                        <Badge variant="default">{tx.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-center text-gray-500 py-8">No transactions yet</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

         

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Complete transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm">{tx.transaction_id}</span>
                          <Badge variant={tx.status === "completed" ? "default" : "secondary"}>{tx.status}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Payment ID: {tx.payment_id}</p>
                          <p>Created: {new Date(tx.created_at).toLocaleString()}</p>
                          {tx.transaction_hash && <p>Hash: {tx.transaction_hash}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">{tx.amount} XLM</div>
                        <div className="text-sm text-gray-600">{tx.currency}</div>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && <p className="text-center text-gray-500 py-8">No transactions found</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API Credentials</CardTitle>
                <CardDescription>Your merchant API credentials for integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input id="api-key" value={apiKey} readOnly className="font-mono text-sm" />
                    <Button variant="outline" onClick={() => copyToClipboard(apiKey)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={generateApiKey}>
                      Generate New
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchant-id">Merchant ID</Label>
                  <div className="flex gap-2">
                    <Input id="merchant-id" value={merchantId} readOnly className="font-mono text-sm" />
                    <Button variant="outline" onClick={() => copyToClipboard(merchantId)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={generateMerchantId}>
                      Generate New
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    Keep your API key secure and never expose it in client-side code. Use it only in server-side
                    applications.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SDK Integration</CardTitle>
                <CardDescription>How to integrate the MellaMate SDK</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">JavaScript/Node.js</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                    <pre>{`import MellaMate from './lib/mellamate-sdk.js'

const mellaMate = new MellaMate('${apiKey}', '${merchantId}')

// Create a payment
const payment = await mellaMate.createPayment('25.50', 'XLM', 'Order #123')

// Process the payment
const result = await mellaMate.processPayment(
  payment.payment_id,
  'GXXXXXXX...', // customer wallet
  'SXXXXXXX...'  // customer secret key
)`}</pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">API Endpoints</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <code>POST /api/v1/payments</code>
                      <span>Create payment</span>
                    </div>
                    <div className="flex justify-between">
                      <code>GET /api/v1/payments/:id</code>
                      <span>Get payment status</span>
                    </div>
                    <div className="flex justify-between">
                      <code>POST /api/v1/payments/:id/process</code>
                      <span>Process payment</span>
                    </div>
                    <div className="flex justify-between">
                      <code>GET /api/v1/merchant/stats</code>
                      <span>Get merchant stats</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
