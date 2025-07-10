"use client"

import type React from "react"

import { EditIcon, Loader2, Plus, SearchIcon, TruckIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { getBrands } from "../../../services/brandService"
import { getTrucks } from "../../../services/truckService"
import type { Brand } from "../../../types/Brand"
import type { Truck } from "../../../types/Truck"
import EditTruckModal from "./EditTruckModal"
import RegisterTruck from "./RegisterTruck"

const TruckManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [showTruckRegisterForm, setShowTruckRegisterForm] = useState(false)
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    getBrands().then(setBrands).catch(console.error)
    loadTrucks()
  }, [])

  const loadTrucks = async () => {
    try {
      setIsLoading(true)
      const data = await getTrucks()
      setTrucks(data)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTruckRegistered = () => {
    setShowTruckRegisterForm(false)
    loadTrucks()
  }

  const handleUpdated = () => {
    setEditingTruck(null)
    loadTrucks()
  }

  const getBrandName = (truck: Truck): string => {
    if (typeof truck.IDBrand === "number") {
      return brands.find((b) => b._id === truck.IDBrand)?.name || String(truck.IDBrand)
    } else if (truck.IDBrand && typeof truck.IDBrand === "object") {
      return truck.IDBrand.name || "Sin marca"
    }
    return "Sin marca"
  }

  const getModelName = (truck: Truck): string => {
    if (typeof truck.IDModel === "number") {
      return String(truck.IDModel)
    } else if (truck.IDModel && typeof truck.IDModel === "object") {
      return truck.IDModel.name || "Sin modelo"
    }
    return "Sin modelo"
  }

  // Filter trucks based on search term
  const filteredTrucks = useMemo(() => {
    if (!searchTerm.trim()) return trucks
    const searchLower = searchTerm.toLowerCase().trim()

    return trucks.filter((truck) => {
      const plates = (truck.plates || "").toLowerCase()
      const brandName = getBrandName(truck).toLowerCase()
      const modelName = getModelName(truck).toLowerCase()
      const capacity = truck.loadCapacity ? truck.loadCapacity.toString() : ""

      return (
        plates.includes(searchLower) ||
        brandName.includes(searchLower) ||
        modelName.includes(searchLower) ||
        capacity.includes(searchLower)
      )
    })
  }, [trucks, searchTerm, brands])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
  }

  const statusStyles = {
    Available:        'bg-green-100  text-green-800',
    'On Trip':        'bg-blue-100   text-blue-800',
    'Under Maintenance': 'bg-yellow-100 text-yellow-800',
    Inactive:         'bg-red-100   text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <TruckIcon className="h-6 w-6 text-white"/>
                </div>
                <h1 className="text-4xl font-bold text-slate-900">Truck Management</h1>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-sm">Total trucks:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  {trucks.length}
                </span>
                {/* {searchTerm && <span className="text-sm text-slate-500">(filtered from {filteredTrucks.length} total)</span>} */}
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={() => setShowTruckRegisterForm(!showTruckRegisterForm)}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus
                  className={`h-5 w-5 transition-transform duration-200 ${showTruckRegisterForm ? "rotate-45" : "group-hover:scale-110"}`}
                />
                {showTruckRegisterForm ? "Cancel Registration" : "Register New Truck"}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by license plates, brand, model, or capacity..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
          </div>
          {searchTerm && (
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-600">
                Showing {filteredTrucks.length} of {trucks.length} trucks
              </span>
              <button
                onClick={() => setSearchTerm("")}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-slate-400" />
            </div>
        </div>

        {/* Registration Form */}
              <RegisterTruck
                isOpen={showTruckRegisterForm}
                onClose={() => {
                setShowTruckRegisterForm(false)
                loadTrucks()
              }}
              />

        {/* Trucks Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">
              Truck List
              {searchTerm && (
                <span className="ml-2 text-sm font-normal text-slate-500">
                  (showing {filteredTrucks.length} result{filteredTrucks.length !== 1 ? "s" : ""})
                </span>
              )}
            </h3>
            <p className="text-slate-600 text-sm mt-1">Manage and monitor trucks</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Loading trucks...</span>
              </div>
            </div>
          ) : filteredTrucks.length === 0 ? (
            <div className="text-center py-16">
              <TruckIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {searchTerm ? "No trucks found" : "No trucks registered"}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or clear the search to see all trucks"
                  : "Get started by registering your first truck"}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={() => setShowTruckRegisterForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Register First Truck
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      License Plates
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Load Capacity
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredTrucks.map((truck, index) => (
                    <tr key={truck._id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                              <TruckIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">{truck.plates}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{getBrandName(truck)}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-slate-700">{getModelName(truck)}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {truck.loadCapacity} kg
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            statusStyles[truck.status] || statusStyles.Inactive   // fallback por si llega un estado no mapeado
                          }`}
                        >
                          {truck.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <button
                          onClick={() => setEditingTruck(truck)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150 hover:shadow-md"
                        >
                          <EditIcon className="h-4 w-4" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTruck && (
        <EditTruckModal
          truck={editingTruck}
          brands={brands}
          onClose={() => setEditingTruck(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  )
}

export default TruckManagement
