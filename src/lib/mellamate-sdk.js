class MellaMate {
  constructor(apiKey, merchantId, options = {}) {
    this.baseUrl = options.baseUrl || "https://mellamate.onrender.com"
    this.apiKey = apiKey
    this.merchantId = merchantId
    this.timeout = options.timeout || 30000
  }

  async createPayment(amount, currency = "XLM", description = "", metadata = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
          "X-Merchant-ID": this.merchantId,
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount).toString(),
          currency,
          description,
          metadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Payment creation failed:", error)
      throw error
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/${paymentId}`, {
        headers: {
          "X-API-Key": this.apiKey,
          "X-Merchant-ID": this.merchantId,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Payment status check failed:", error)
      throw error
    }
  }

  async processPayment(paymentId, walletAddress, secretKey) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/${paymentId}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
          "X-Merchant-ID": this.merchantId,
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          secret_key: secretKey,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Payment processing failed:", error)
      throw error
    }
  }

  async getMerchantStats() {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/merchant/stats`, {
        headers: {
          "X-API-Key": this.apiKey,
          "X-Merchant-ID": this.merchantId,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get merchant stats:", error)
      throw error
    }
  }

  async getTransactionHistory(limit = 50, offset = 0) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/merchant/transactions?limit=${limit}&offset=${offset}`, {
        headers: {
          "X-API-Key": this.apiKey,
          "X-Merchant-ID": this.merchantId,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to get transaction history:", error)
      throw error
    }
  }
}

export default MellaMate
