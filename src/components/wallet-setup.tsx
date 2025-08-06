"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Wallet, PlusCircle } from "lucide-react"

interface WalletSetupProps {
  onConnect: () => void
  onCreate: () => void
  onBack: () => void
}

export default function WalletSetup({ onConnect, onCreate, onBack }: WalletSetupProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-800"
      >
        <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Wallet Setup
        </h2>
        
        <p className="text-gray-300 text-center mb-8">
          Do you already have a Stellar wallet or would you like to create a new one?
        </p>

        <div className="space-y-4">
          <Button
            onClick={onConnect}
            className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border border-blue-500"
            size="lg"
          >
            <Wallet className="w-5 h-5 mr-2" />
            I have a wallet
          </Button>
          
          <Button
            onClick={onCreate}
            className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            size="lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Create new wallet
          </Button>
          
          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full text-gray-400 hover:text-white"
          >
            Back to login
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
