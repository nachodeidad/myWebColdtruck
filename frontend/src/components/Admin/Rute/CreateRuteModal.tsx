"use client"

import { X } from "lucide-react"
import React from "react"
import type { Rute } from "../../../types/Rute"
import CreateRuteForm from "./CreateRuteForm"

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: (rute: Rute) => void
}

const CreateRuteModal: React.FC<Props> = ({ isOpen, onClose, onCreated }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-55 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <CreateRuteForm onCreated={onCreated} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateRuteModal
