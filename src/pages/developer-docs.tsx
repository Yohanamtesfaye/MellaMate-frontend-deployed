"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Separator } from "../components/ui/separator"

export default function DeveloperDocs() {
  useEffect(() => {
    document.title = "MellaMate • Developer Docs"
  }, [])

  return (
    <div className="max-w-3xl mx-auto py-12 text-gray-200 px-4">
      <h1 className="text-3xl font-bold mb-4">MellaMate Developer Documentation</h1>
      <p className="mb-8 text-gray-400">
        This guide helps you integrate MellaMate payments into your dApp or web
        shop. For a full reference see our GitHub Wiki.
      </p>

      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <ol>
            <li>Sign up for a merchant account on the dashboard.</li>
            <li>Grab your <code>api_key</code> &amp; <code>api_secret</code>.</li>
            <li>Install the SDK:
              <pre><code>npm i mellamate-sdk</code></pre>
            </li>
            <li>Initialize and invoke the checkout:
              <pre><code>{`import Mellamate from "mellamate-sdk";

Mellamate.init({
  apiKey: "mm_live_...",
  apiSecret: "mm_sk_...",
  merchantId: "merch_ab12cd",
  baseUrl: "https://api.mellamate.io"
});

await Mellamate.pay({ amount: "10", currency: "USD" });`}</code></pre>
            </li>
            <li>Listen to webhooks at your <code>webhook_url</code>.</li>
          </ol>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 mb-8">
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <p>All webhook payloads include <code>timestamp</code>, <code>event</code> and <code>data</code>.</p>
          <Separator className="my-4" />
          <h4>merchant.created</h4>
          <p>Sent once your account is provisioned.</p>
          <pre><code>{`{
  "event": "merchant.created",
  "data": { "merchant_id": "merch_ab12cd" },
  "timestamp": 1691234567
}`}</code></pre>
          <Separator className="my-4" />
          <h4>payment.success</h4>
          <pre><code>{`{
  "event": "payment.success",
  "data": { "tx_ref": "...", "amount_cents": 1000, "currency": "USD" },
  "timestamp": 1691234599
}`}</code></pre>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Backend API Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <pre><code>{`POST /v1/payment/initiate
GET  /v1/merchant/{id}/balances
POST /v1/merchant/{id}/payout`}</code></pre>
          <p>Full OpenAPI spec available at <code>/docs</code> on the backend.</p>
        </CardContent>
      </Card>
    </div>
  )
}
