import React from "react"
import { Link } from "react-router-dom"

const AccountDisabled: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Account Disabled</h1>
      <p className="text-gray-700 mb-6 text-center max-w-md">
        Your account has been deactivated. Please contact an administrator for assistance.
      </p>
      <Link to="/login" className="text-blue-600 underline">
        Return to login
      </Link>
    </div>
  )
}

export default AccountDisabled
