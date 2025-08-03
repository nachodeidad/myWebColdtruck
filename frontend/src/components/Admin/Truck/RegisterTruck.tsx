import type React from "react"

import {
  AlertCircle,
  Building2,
  Car,
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  Truck,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useAuth } from "../../../contexts/AuthContext"
import { getBrands } from "../../../services/brandService"
import { getModelsByBrand } from "../../../services/modelService"
import { createTruck } from "../../../services/truckService"
import type { Brand } from "../../../types/Brand"
import type { Model } from "../../../types/Model"
import ModalBrandRegister from "./ModalRegisterBrand"
import ModalModelRegister from "./ModalRegisterModel"

interface RegisterTruckProps {
  isOpen: boolean
  onClose: () => void
}

const RegisterTruck: React.FC<RegisterTruckProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth()

  const [error, setError] = useState<string | null>(null)
  const [errorPlates, setErrorPlates] = useState<string | null>(null)
  const [errorCapacity, setErrorCapacity] = useState<string | null>(null)
  const [errorBrand, setErrorBrand] = useState<string | null>(null)
  const [errorModel, setErrorModel] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [selectedBrand, setSelectedBrand] = useState<number | "">("")
  const [selectedModel, setSelectedModel] = useState<number | "">("")
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [showModelModal, setShowModelModal] = useState(false)
  const [plates, setPlates] = useState("")
  const [capacity, setCapacity] = useState<number | "">("")

  useEffect(() => {
    if (!isOpen) return

    const fetchBrands = async () => {
      try {
        const data = await getBrands()
        setBrands(data)
      } finally {
        setLoadingBrands(false)
      }
    }

    fetchBrands()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    if (!selectedBrand) {
      setModels([])
      setSelectedModel("")
      return
    }

    setLoadingModels(true)
    const fetchModels = async () => {
      try {
        const data = await getModelsByBrand(Number(selectedBrand))
        setModels(data)
      } finally {
        setLoadingModels(false)
      }
    }

    fetchModels()
  }, [selectedBrand, isOpen])

  const handleBrandCreated = (newBrand: Brand) => {
    setBrands((prev) => [...prev, newBrand])
    setSelectedBrand(newBrand._id)
    setShowBrandModal(false)
  }

  const handleModelCreated = (newModel: Model) => {
    setModels((prev) => [...prev, newModel])
    setSelectedModel(newModel._id)
    setShowModelModal(false)
  }

  const clearErrors = () => {
    setError(null)
    setErrorPlates(null)
    setErrorCapacity(null)
    setErrorBrand(null)
    setErrorModel(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async () => {
    clearErrors()
    setIsSubmitting(true)

    if (!user) {
      setError("You must be logged in to register trucks")
      setIsSubmitting(false)
      return
    }

    let valid = true
    if (!plates.trim() && !capacity && !selectedBrand && !selectedModel) {
      toast.error("Fill in all fields.")
    }

    if (!plates.trim()) {
      setErrorPlates("Please enter a plate number")
      valid = false
    }

    if (!capacity) {
      setErrorCapacity("Please enter a capacity in kg")
      valid = false
    }

    if (!selectedBrand) {
      setErrorBrand("Please select a brand")
      valid = false
    }

    if (!selectedModel) {
      setErrorModel("Please select a model")
      valid = false
    }

    if (!valid) {
      setIsSubmitting(false)
      return
    }

    const IDAdmin = Number(user.id)
    if (IDAdmin > 0) {
      try {
        await createTruck({
          plates: plates.trim(),
          loadCapacity: Number(capacity),
          IDAdmin,
          IDBrand: Number(selectedBrand),
          IDModel: Number(selectedModel),
        })

        // setSuccessMessage("Truck registered successfully!")
        toast.success("Truck added successfully!")
        setPlates("")
        setCapacity("")
        setSelectedBrand("")
        setSelectedModel("")

        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (err) {
        console.error(err)
        setError("Error saving truck. Please try again.")
      }
    } else {
      setError("Invalid admin session")
    }

    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Toasts */}
      {successMessage && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-top-5">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-top-5">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-lg p-2 text-gray-600 transition-colors bg-white hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Add New Truck</h2>
            <p className="mt-1 text-blue-100">Register a new truck to your fleet</p>
          </div>
          <div className="grid grid-cols-1 gap-6 px-8 py-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Car className="h-4 w-4 text-slate-500" />
                License Plates<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter license plates"
                value={plates}
                onChange={(e) => setPlates(e.target.value)}
                className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errorPlates ? "border-red-300 bg-red-50" : "border-slate-300 hover:border-slate-400"
                }`}
              />
              {errorPlates && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errorPlates}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Package className="h-4 w-4 text-slate-500" />
                Load Capacity<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter capacity in kilograms"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.valueAsNumber || "")}
                  className={`w-full rounded-xl border px-4 py-3 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errorCapacity ? "border-red-300 bg-red-50" : "border-slate-300 hover:border-slate-400"
                  }`}
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500">
                  kg
                </span>
              </div>
              {errorCapacity && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errorCapacity}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Building2 className="h-4 w-4 text-slate-500" />
                Brand<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value ? Number(e.target.value) : "")}
                    disabled={loadingBrands}
                    className={`w-full appearance-none rounded-xl border px-4 py-3 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errorBrand ? "border-red-300 bg-red-50" : "border-slate-300 hover:border-slate-400"
                    } ${loadingBrands ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <option value="">{loadingBrands ? "Loading brands..." : "Select brand"}</option>
                    {brands.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  {loadingBrands && <Loader2 className="absolute inset-y-0 right-8 h-4 w-4 animate-spin text-slate-400" />}
                </div>
                <button
                  type="button"
                  onClick={() => setShowBrandModal(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {errorBrand && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errorBrand}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Truck className="h-4 w-4 text-slate-500" />
                Model<span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value ? Number(e.target.value) : "")}
                    disabled={!selectedBrand || loadingModels}
                    className={`w-full appearance-none rounded-xl border px-4 py-3 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errorModel ? "border-red-300 bg-red-50" : "border-slate-300 hover:border-slate-400"
                    } ${!selectedBrand || loadingModels ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    <option value="">
                      {!selectedBrand ? "Select brand first" : loadingModels ? "Loading models..." : "Select model"}
                    </option>
                    {models.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {loadingModels && <Loader2 className="absolute inset-y-0 right-8 h-4 w-4 animate-spin text-slate-400" />}
                </div>
                <button
                  type="button"
                  onClick={() => setShowModelModal(true)}
                  disabled={!selectedBrand}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              {errorModel && (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errorModel}
                </p>
              )}
            </div>
          </div>
          <div className="px-8 pb-8">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-blue-400 disabled:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Registering Truck...
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5" /> Register Truck
                </>
              )}
            </button>
          </div>
          {showBrandModal && (
            <ModalBrandRegister onClose={() => setShowBrandModal(false)} onCreated={handleBrandCreated} />
          )}
          {showModelModal && selectedBrand && (
            <ModalModelRegister
              brands={brands}
              defaultBrandId={selectedBrand}
              onClose={() => setShowModelModal(false)}
              onCreated={handleModelCreated}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default RegisterTruck
