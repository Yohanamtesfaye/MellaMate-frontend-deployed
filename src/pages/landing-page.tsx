"use client"

import { motion } from "framer-motion"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import {
  Globe,
  Zap,
  Shield,
  Code,
  ArrowRight,
  CheckCircle,
  Building2,
  Database,
  Webhook,
  Key,
  BarChart3,
  Wallet,
  UserPlus,
  Mail,
} from "lucide-react"

interface LandingPageProps {
  onNavigate: (page: string) => void
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const apiFeatures = [
    {
      icon: Code,
      title: "RESTful API",
      description: "Simple, intuitive REST endpoints for all payment operations",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "Real-time Processing",
      description: "Process payments instantly with sub-second response times",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-grade encryption and compliance with global standards",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Webhook,
      title: "Webhook Support",
      description: "Real-time notifications for all transaction events",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Database,
      title: "Multi-Currency",
      description: "Support for 150+ currencies with automatic conversion",
      color: "from-indigo-500 to-blue-500",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Comprehensive reporting and transaction analytics",
      color: "from-teal-500 to-cyan-500",
    },
  ]

  const businessBenefits = [
    {
      icon: Building2,
      title: "For Local Businesses",
      description: "Accept international payments without traditional banking barriers",
      features: ["No monthly fees", "Same-day settlements", "Multi-currency support", "Simple integration"],
    },
    {
      icon: Code,
      title: "For Developers",
      description: "Build payment solutions with our comprehensive API suite",
      features: ["RESTful APIs", "SDKs & Libraries", "Sandbox testing", "24/7 support"],
    },
    {
      icon: Globe,
      title: "For Enterprises",
      description: "Scale globally with enterprise-grade payment infrastructure",
      features: ["Custom solutions", "Dedicated support", "SLA guarantees", "White-label options"],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      {/* Hero Section - API Focused */}
      <section className="relative py-20 px-4 min-h-screen flex items-center">
        <div className="container mx-auto max-w-6xl text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <Badge className="mb-6 bg-blue-600/20 text-blue-400 border-blue-600/30 animate-pulse">
              Powered by Stellar Blockchain
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            MellaMate API
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl md:text-3xl text-gray-300 mb-4 font-light"
          >
            Global Payment Infrastructure for Developers & Businesses
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Integrate global payments into your application with our simple API. Enable your business to send and
            receive money worldwide with minimal fees and maximum security.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                onClick={() => onNavigate("signup")}
              >
                Sign Up
                <UserPlus className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                onClick={() => onNavigate("api")}
              >
                Get API Access
                <Code className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>

          {/* API Stats
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center"
                >
                  <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300">
                    <CardContent className="p-6">
                      <Icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div> */}
        </div>

        {/* Floating API Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[Code, Database, Webhook, Key, Shield, Globe].map((Icon, i) => (
            <motion.div
              key={i}
              className="absolute"
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
                opacity: [0.1, 0.3, 0.1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 1.5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <Icon className="w-8 h-8 text-blue-400/20" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Business Solutions Section */}
      <section className="pb-20 px-4 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Built for Every Business
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From local shops to global enterprises, our API scales with your needs
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {businessBenefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.05, y: -10 }} className="group">
                  <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-500 h-full group-hover:border-blue-500/50">
                    <CardHeader>
                      <motion.div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-white text-xl group-hover:text-blue-400 transition-colors duration-300">
                        {benefit.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400 leading-relaxed">{benefit.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {benefit.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* API Features Section */}
      <section className="py-20 px-4 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Powerful API Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to build world-class payment experiences
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {apiFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.05, y: -10 }} className="group">
                  <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-500 h-full group-hover:border-blue-500/50">
                    <CardHeader>
                      <motion.div
                        className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <CardTitle className="text-white text-xl group-hover:text-blue-400 transition-colors duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-400 leading-relaxed">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 px-4 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-purple-600/20 text-purple-400 border-purple-600/30">Developer Experience</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Integrate in Minutes
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Our developer-friendly API makes it easy to add global payment capabilities to any application.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Simple REST API with comprehensive docs",
                  "SDKs for JavaScript, Python, PHP, and more",
                  "Webhook support for real-time notifications",
                  "Sandbox environment for testing",
                  "24/7 developer support",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                  onClick={() => onNavigate("api")}
                >
                  Get API Keys
                  <Key className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="relative"
            >
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800/50 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-400 ml-2">JavaScript SDK</span>
                </div>
                <pre className="text-sm text-green-400 overflow-x-auto">
                  {`import Mellamate from 'mellamate-sdk';

Mellamate.init({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.mellamate.io'
});

// Open checkout modal
await Mellamate.pay({
  amount: 100.00,
  currency: 'USD',
  reference: 'INV-12345'
});

// Listen for payment updates
// Listen to webhooks server-side (HMAC signed)
// See Developer Docs for full payloads

  console.log('Payment completed:', event.data);
});

console.log('Payment ID:', payment.id);`}
                </pre>
              </div>

              {/* Floating code elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"
              >
                <Code className="w-4 h-4 text-blue-400" />
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
                className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center"
              >
                <Database className="w-4 h-4 text-purple-400" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 relative z-20">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Pay only for what you use. No hidden fees, no monthly charges.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Domestic Transfers", rate: "0.5%", description: "Same country payments" },
                { label: "International Transfers", rate: "1.5%", description: "Cross-border payments" },
                { label: "API Calls", rate: "Free", description: "Unlimited API requests" },
              ].map((pricing, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card className="bg-gray-900/50 border-gray-800/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="text-3xl font-bold text-white mb-2">{pricing.rate}</div>
                      <div className="text-lg font-medium text-blue-400 mb-2">{pricing.label}</div>
                      <div className="text-sm text-gray-400">{pricing.description}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
                  onClick={() => onNavigate("api")}
                >
                  Start Building
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800/50 text-lg px-8 py-6 rounded-xl bg-transparent backdrop-blur-sm transition-all duration-300"
                  onClick={() => onNavigate("create")}
                >
                  Try Demo
                  <Smartphone className="w-5 h-5 ml-2" />
                </Button>
              </motion.div> */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 py-12 px-4 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MellaMate
                  </h3>
                  <p className="text-xs text-gray-400">Global Payment API</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Empowering developers and businesses with global payment infrastructure.
              </p>
            </motion.div>

            {[
              {
                title: "Developers",
                items: ["API Documentation", "SDKs & Libraries", "Sandbox Testing", "Code Examples"],
              },
              {
                title: "Business",
                items: ["Pricing", "Enterprise Solutions", "Case Studies", "Integration Support"],
              },
              {
                title: "Support",
                items: ["Help Center", "API Status", "Contact Us", "Community"],
              },
            ].map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold text-white mb-4">{section.title}</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  {section.items.map((item) => (
                    <motion.div
                      key={item}
                      whileHover={{ x: 5, color: "#ffffff" }}
                      className="cursor-pointer transition-colors duration-200"
                    >
                      {item}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="border-t border-gray-800/50 mt-8 pt-8 text-center text-gray-400 text-sm"
          >
            <p>&copy; 2024 MellaMate. All rights reserved. Built on Stellar Network.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}