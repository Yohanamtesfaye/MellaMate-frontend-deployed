"use client"
import type React from "react"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Code,
  Building,
  Globe,
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  ExternalLink,
  Copy,
} from "lucide-react"

interface ApiRequestProps {
  onNavigate: (page: string) => void
}

export default function ApiRequest({ onNavigate }: ApiRequestProps) {
  const [formData, setFormData] = useState({
    // Business Information
    industry: "",
    category: "",
    // Business Size & Volume
    staffSize: "",
    transactionVolume: "",
    // Business Identity
    legalBusinessName: "",
    businessRegistrationNo: "",
    tinNumber: "",
    typeOfIncorporation: "",
    // VAT Information
    vatRegistered: false,
    // Additional Information
    isBettingCompany: false,
    // Business Contact
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    // Documents & Verification
    businessLogo: null,
    registrationDocument: null,
    tinDocument: null,
    // Website/App URL
    website: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [merchantCredentials, setMerchantCredentials] = useState<any>(null)
  const [env, setEnv] = useState("test")
  const [callbackUrl, setCallbackUrl] = useState("")
  const [requestLive, setRequestLive] = useState(false)

  // Get backend URL - use environment variable or fallback
  const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL || "https://mellamate.onrender.com"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit the API request to backend
      const response = await fetch(`${backendUrl}/api/v1/merchant/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.contactEmail,
          business_name: formData.legalBusinessName,
          // Include all form data for comprehensive merchant profile
          business_details: {
            industry: formData.industry,
            category: formData.category,
            staff_size: formData.staffSize,
            transaction_volume: formData.transactionVolume,
            business_registration_no: formData.businessRegistrationNo,
            tin_number: formData.tinNumber,
            type_of_incorporation: formData.typeOfIncorporation,
            vat_registered: formData.vatRegistered,
            is_betting_company: formData.isBettingCompany,
            contact_name: formData.contactName,
            contact_phone: formData.contactPhone,
            website: formData.website,
            callback_url: callbackUrl,
            environment: env,
            request_live: requestLive,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Store merchant credentials
      setMerchantCredentials({
        merchant_id: data.merchant_id,
        api_key: data.api_key,
        api_secret: data.api_secret,
        business_name: formData.legalBusinessName,
        email: formData.contactEmail,
        environment: env,
        created_at: data.created_at,
      })

      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error submitting API request:", error)
      alert("Failed to submit API request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToDashboard = () => {
    if (merchantCredentials) {
      // Navigate to dashboard with merchant ID
      const dashboardUrl = `/merchant-dashboard?merchant_id=${merchantCredentials.merchant_id}`
      window.location.href = dashboardUrl
    }
  }

  // Success Modal
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">API Access Granted!</h2>
            <p className="text-gray-400">Your merchant account has been created successfully.</p>
          </div>

          {merchantCredentials && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your API Credentials</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-400 text-sm">Merchant ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-700 px-3 py-2 rounded text-green-400 font-mono text-sm flex-1">
                      {merchantCredentials.merchant_id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(merchantCredentials.merchant_id)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">API Key</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-700 px-3 py-2 rounded text-blue-400 font-mono text-sm flex-1">
                      {merchantCredentials.api_key}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(merchantCredentials.api_key)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">API Secret</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-700 px-3 py-2 rounded text-red-400 font-mono text-sm flex-1">
                      {merchantCredentials.api_secret}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(merchantCredentials.api_secret)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Keep your API secret secure! Never expose it in client-side code.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleGoToDashboard}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setShowSuccessModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const pricingPlans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for testing and small projects",
      features: ["1,000 API calls/month", "Testnet access", "Basic documentation", "Community support"],
      popular: false,
    },
    {
      name: "Professional",
      price: "$99/month",
      description: "For growing businesses",
      features: [
        "100,000 API calls/month",
        "Mainnet access",
        "Advanced features",
        "Priority support",
        "Webhook notifications",
        "Custom integration help",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large-scale operations",
      features: [
        "Unlimited API calls",
        "Dedicated infrastructure",
        "24/7 phone support",
        "Custom SLA",
        "On-premise deployment",
        "Dedicated account manager",
      ],
      popular: false,
    },
  ]

  const codeExample = `// Initialize MellaMate API
import { MellaMate } from '@mellamate/api';

const client = new MellaMate({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Create a payment
const payment = await client.payments.create({
  amount: 100.00,
  currency: 'USD',
  recipient: {
    type: 'stellar_address',
    address: 'GCKFBEIYTKP67PVLOHJPEQSVUQIEMQCH5RJQSSQT6CQFDDLF7A4DEAEH'
  },
  description: 'Payment for services',
  metadata: {
    orderId: 'order_123',
    customerId: 'customer_456'
  }
});

console.log('Payment created:', payment.id);
console.log('Status:', payment.status);`

  function handleInputChange(field: string, value: any): void {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleFileChange(field: string, file: File | null): void {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <Tabs defaultValue="request" className="space-y-8">
          <TabsList className="grid grid-cols-3 gap-4">
            <TabsTrigger value="request" className="data-[state=active]:bg-blue-600">
              Request Access
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-blue-600">
              Pricing
            </TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-blue-600">
              Documentation
            </TabsTrigger>
          </TabsList>

          {/* Request Access Tab */}
          <TabsContent value="request">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">API Access Request</CardTitle>
                    <CardDescription className="text-gray-400">
                      Tell us about your business and integration needs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Business Information */}
                      <div className="border-b border-gray-800 pb-6 mb-6">
                        <div className="text-lg font-bold text-blue-400 mb-4">1. Business Information</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Industry *</Label>
                            <Input
                              value={formData.industry}
                              onChange={(e) => handleInputChange("industry", e.target.value)}
                              required
                              placeholder="e.g., E-commerce, Fintech, SaaS"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Category *</Label>
                            <Input
                              value={formData.category}
                              onChange={(e) => handleInputChange("category", e.target.value)}
                              required
                              placeholder="e.g., Online Marketplace, Payment Gateway"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Contact */}
                      <div className="border-b border-gray-800 pb-6 mb-6">
                        <div className="text-lg font-bold text-blue-400 mb-4">2. Business Contact</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Contact Name *</Label>
                            <Input
                              value={formData.contactName}
                              onChange={(e) => handleInputChange("contactName", e.target.value)}
                              required
                              placeholder="John Doe"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Contact Email *</Label>
                            <Input
                              value={formData.contactEmail}
                              onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                              required
                              type="email"
                              placeholder="john@company.com"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label className="text-white">Contact Phone *</Label>
                          <Input
                            value={formData.contactPhone}
                            onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                            required
                            placeholder="+1 (555) 123-4567"
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                          />
                        </div>
                      </div>

                      {/* Business Identity & Compliance */}
                      <div className="border-b border-gray-800 pb-6 mb-6">
                        <div className="text-lg font-bold text-blue-400 mb-4">3. Business Identity & Compliance</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Legal Business Name *</Label>
                            <Input
                              value={formData.legalBusinessName}
                              onChange={(e) => handleInputChange("legalBusinessName", e.target.value)}
                              required
                              placeholder="Acme Corporation Ltd."
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Business Registration No *</Label>
                            <Input
                              value={formData.businessRegistrationNo}
                              onChange={(e) => handleInputChange("businessRegistrationNo", e.target.value)}
                              required
                              placeholder="REG123456789"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label className="text-white">TIN Number *</Label>
                            <Input
                              value={formData.tinNumber}
                              onChange={(e) => handleInputChange("tinNumber", e.target.value)}
                              required
                              placeholder="TIN123456789"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Type of Incorporation *</Label>
                            <Input
                              value={formData.typeOfIncorporation}
                              onChange={(e) => handleInputChange("typeOfIncorporation", e.target.value)}
                              required
                              placeholder="Limited Liability Company"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <div>
                            <Label className="text-white">Staff Size *</Label>
                            <Input
                              value={formData.staffSize}
                              onChange={(e) => handleInputChange("staffSize", e.target.value)}
                              required
                              placeholder="1-10 employees"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Transaction Volume (Monthly) *</Label>
                            <Input
                              value={formData.transactionVolume}
                              onChange={(e) => handleInputChange("transactionVolume", e.target.value)}
                              required
                              placeholder="$10,000 - $50,000"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <input
                            type="checkbox"
                            checked={formData.vatRegistered}
                            onChange={(e) => handleInputChange("vatRegistered", e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-white">Are you VAT Registered?</Label>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={formData.isBettingCompany}
                            onChange={(e) => handleInputChange("isBettingCompany", e.target.checked)}
                            className="rounded"
                          />
                          <Label className="text-white">Are you a Betting Or Fantasy Sports company?</Label>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div>
                        <div className="text-lg font-bold text-blue-400 mb-4">4. Additional Information</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white">Website/App URL</Label>
                            <Input
                              value={formData.website || ""}
                              onChange={(e) => handleInputChange("website", e.target.value)}
                              placeholder="https://yourapp.com"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Callback URL (for webhook events)</Label>
                            <Input
                              value={callbackUrl}
                              onChange={(e) => setCallbackUrl(e.target.value)}
                              placeholder="https://yourapp.com/webhook"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <Label className="text-white">Environment</Label>
                          <Button
                            type="button"
                            variant={env === "test" ? "default" : "outline"}
                            onClick={() => setEnv("test")}
                          >
                            Test
                          </Button>
                          <Button
                            type="button"
                            variant={env === "live" ? "default" : "outline"}
                            onClick={() => setEnv("live")}
                          >
                            Live
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={requestLive}
                            onChange={(e) => setRequestLive(e.target.checked)}
                            disabled={env !== "live"}
                            className="rounded"
                          />
                          <Label className="text-white">Request Live Credentials (manual review required)</Label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit API Request"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Why Choose MellaMate API?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Lightning Fast</p>
                        <p className="text-xs text-gray-400">3-second settlement times</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Low Fees</p>
                        <p className="text-xs text-gray-400">Fraction of traditional costs</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Global Reach</p>
                        <p className="text-xs text-gray-400">150+ countries supported</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Enterprise Security</p>
                        <p className="text-xs text-gray-400">Bank-grade protection</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Integration Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">API Access</p>
                        <p className="text-xs text-gray-400">Instant</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Integration</p>
                        <p className="text-xs text-gray-400">1-3 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">Go Live</p>
                        <p className="text-xs text-gray-400">Same day</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <Card
                  key={index}
                  className={`bg-gray-900 border-gray-800 relative ${plan.popular ? "border-blue-600" : ""}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold text-blue-400">{plan.price}</div>
                    <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${
                        plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documentation Tab */}
          <TabsContent value="docs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Start Example</CardTitle>
                    <CardDescription className="text-gray-400">
                      Get started with MellaMate API in minutes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-x-auto text-sm">
                        <code className="text-gray-300">{codeExample}</code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                        onClick={() => navigator.clipboard.writeText(codeExample)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">API Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Code className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">RESTful API</p>
                        <p className="text-xs text-gray-400">Standard HTTP methods and responses</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Webhook Support</p>
                        <p className="text-xs text-gray-400">Real-time payment notifications</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Multi-Currency</p>
                        <p className="text-xs text-gray-400">Support for major currencies</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-white">Rate Limiting</p>
                        <p className="text-xs text-gray-400">Fair usage policies</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      API Reference
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <Code className="w-4 h-4 mr-2" />
                      SDK Downloads
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Integration Guide
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-gray-700 text-white hover:bg-gray-800 bg-transparent"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Developer Community
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
