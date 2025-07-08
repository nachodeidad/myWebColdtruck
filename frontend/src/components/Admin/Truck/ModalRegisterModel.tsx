"use client"

import type React from "react"

import { Building2, Car, Loader2, Plus, X } from "lucide-react"
import { useState } from "react"
import { createModel } from "../../../services/modelService"
import type { Brand } from "../../../types/Brand"
import type { Model } from "../../../types/Model"

interface Props {
  brands: Brand[]
  defaultBrandId: number
  onClose: () => void
  onCreated: (model: Model) => void
}

const ModalModelRegister: React.FC<Props> = ({ brands, defaultBrandId, onClose, onCreated }) => {
  const [name, setName] = useState("")
  const [brandId, setBrandId] = useState<number>(defaultBrandId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim() || !brandId) return

    setSaving(true)
    setError(null)

    try {
      const newModel = await createModel({
        name: name.trim(),
        IDBrand: brandId,
      })
      onCreated(newModel)
    } catch (err) {
      console.error("Error creating model:", err)
      setError("Error creating model. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !saving && name.trim() && brandId) {
      handleSave()
    }
    if (e.key === "Escape") {
      onClose()
    }
  }

  const selectedBrand = brands.find((b) => b._id === brandId)

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Car className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Model</h2>
              <p className="text-sm text-gray-600">Create a new truck model</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={saving}>
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Brand Selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Building2 className="h-4 w-4 text-gray-500" />
              Brand <span className="text-red-500">*</span>
            </label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 appearance-none"
              disabled={saving}
            >
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Car className="h-4 w-4 text-gray-500" />
              Model Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter model name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
              disabled={saving}
              autoFocus
            />
          </div>

          {/* Preview */}
          {selectedBrand && name.trim() && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Preview:</span> {selectedBrand.name} {name.trim()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !brandId}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create Model
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalModelRegister
