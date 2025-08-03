import { AlertCircle, Building2, Car, Package, Truck, XIcon } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { getModelsByBrand } from "../../../services/modelService"
import { updateTruck } from "../../../services/truckService"
import type { Brand } from "../../../types/Brand"
import type { Model } from "../../../types/Model"
import type { Truck as TruckType } from "../../../types/Truck"

interface Props {
  truck: TruckType
  brands: Brand[]
  onClose: () => void
  onUpdated: () => void
}

const EditTruckModal: React.FC<Props> = ({ truck, brands, onClose, onUpdated }) => {
  const [plates, setPlates] = useState(truck.plates)
  const [capacity, setCapacity] = useState(truck.loadCapacity)
  const [selectedBrand, setSelectedBrand] = useState(
    typeof truck.IDBrand === "number" ? truck.IDBrand : truck.IDBrand._id,
  )
  const [models, setModels] = useState<Model[]>([])
  const [selectedModel, setSelectedModel] = useState(
    typeof truck.IDModel === "number" ? truck.IDModel : truck.IDModel._id,
  )
  const [saving, setSaving] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [errors, setErrors] = useState({
    plates: "",
    capacity: "",
    brand: "",
    model: "",
  })

  useEffect(() => {
    if (!selectedBrand) {
      setModels([])
      return
    }

    setLoadingModels(true)
    getModelsByBrand(selectedBrand)
      .then(setModels)
      .catch((err) => {
        console.error("Error loading models:", err)
        setErrorMessage("Error loading models")
      })
      .finally(() => setLoadingModels(false))
  }, [selectedBrand])

  const validateForm = () => {
    const newErrors = {
      plates: "",
      capacity: "",
      brand: "",
      model: "",
    }

    if (!plates.trim()) {
      newErrors.plates = "License plates are required"
    }

    if (!capacity || capacity <= 0) {
      newErrors.capacity = "Valid capacity is required"
    }

    if (!selectedBrand) {
      newErrors.brand = "Brand selection is required"
    }

    if (!selectedModel) {
      newErrors.model = "Model selection is required"
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)
    setErrorMessage("")

    try {
      await updateTruck(truck._id, {
        plates: plates.trim(),
        loadCapacity: capacity,
        IDBrand: selectedBrand,
        IDModel: selectedModel,
      })
      toast.success("Truck updated successfully!");
      onUpdated()
      onClose()
    } catch (err) {
      toast.error("Error updating truck!");
      console.error("Error updating truck:", err)
      setErrorMessage("Error updating truck. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    if (field === "plates") {
      setPlates(value as string)
    } else if (field === "capacity") {
      setCapacity(value as number)
    } else if (field === "brand") {
      setSelectedBrand(value as number)
    } else if (field === "model") {
      setSelectedModel(value as number)
    }
    setErrorMessage("")
  }

  const selectedBrandName = brands.find((b) => b._id === selectedBrand)?.name || ""
  const selectedModelName = models.find((m) => m._id === selectedModel)?.name || ""

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6 bg-blue-500 p-3 rounded-xl">
              <div className="flex items-center ">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">Edit Truck</h3>
                  <p className="text-sm text-gray-100">Plates: {truck.plates}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-600 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={saving}
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-md font-medium text-gray-900 mb-4">Truck Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="plates" className="block text-sm font-medium text-gray-700 mb-1">
                      <Car className="h-4 w-4 inline mr-1" />
                      License Plates *
                    </label>
                    <input
                      type="text"
                      id="plates"
                      name="plates"
                      value={plates}
                      onChange={(e) => handleInputChange("plates", e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter license plates"
                      disabled={saving}
                    />
                    {errors.plates && <p className="mt-1 text-sm text-red-600">{errors.plates}</p>}
                  </div>

                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                      <Package className="h-4 w-4 inline mr-1" />
                      Load Capacity (kg) *
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={capacity}
                      onChange={(e) => handleInputChange("capacity", e.target.valueAsNumber || 0)}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter capacity in kilograms"
                      disabled={saving}
                    />
                    {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>}
                  </div>

                  <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                      <Building2 className="h-4 w-4 inline mr-1" />
                      Brand *
                    </label>
                    <select
                      id="brand"
                      name="brand"
                      value={selectedBrand}
                      onChange={(e) => handleInputChange("brand", Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={saving}
                    >
                      <option value="">Select brand</option>
                      {brands.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand}</p>}
                  </div>

                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                      <Truck className="h-4 w-4 inline mr-1" />
                      Model *
                    </label>
                    <select
                      id="model"
                      name="model"
                      value={selectedModel}
                      onChange={(e) => handleInputChange("model", Number(e.target.value))}
                      required
                      disabled={!selectedBrand || loadingModels || saving}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
                  </div>
                </div>
              </div>

              
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSave}
              disabled={saving}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditTruckModal
