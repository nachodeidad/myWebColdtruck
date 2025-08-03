import { UserPlusIcon, XIcon } from "lucide-react"
import React from "react"
import RegisterForm from "./RegisterForm"

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const RegisterUserModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
        
        {/* Modal */}
        <div className="relative z-10 max-w-4xl w-full bg-white rounded-2xl shadow-xl">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-start w-full">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <UserPlusIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-bold text-white">Add New User</h3>
                <p className="text-blue-100 mt-1">Register a new user to the system.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition"
              aria-label="Close modal"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <RegisterForm onSuccess={onSuccess} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterUserModal