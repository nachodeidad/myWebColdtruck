import { AlertCircle, Filter, Loader2, Plus, Route, Search, User, X } from "lucide-react"
import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { authAPI } from "../../../services/api"
import { getBoxsAvailable } from "../../../services/boxService"
import { getCargoTypes } from "../../../services/cargoTypeService"
import { getRutes } from "../../../services/ruteService"
import { getTrips } from "../../../services/tripService"
import { getTrucksAvailable } from "../../../services/truckService"
import type { Rute, Trip, Truck as TruckType, User as UserType } from "../../../types"
import { Box } from "../../../types/Box"
import { CargoType } from "../../../types/CargoType"
import CreateRuteModal from "../Rute/CreateRuteModal"
import CreateTripModal from "./CreateTripModal"
import ModalMoreTrip from "./ModalMoreTrip"

const TripManagement: React.FC = () => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const { user } = useAuth()
  const [rutes, setRutes] = useState<Rute[]>([])
  const [drivers, setDrivers] = useState<UserType[]>([])
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([])
  const [boxs, setBoxs] = useState<Box[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showRuteModal, setShowRuteModal] = useState(false)
  const [showTripModal, setShowTripModal] = useState(false)
  const [showModalMore, setShowModalMore] = useState(false)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  // Filter trips based on search and filters
  useEffect(() => {
    let filtered = trips

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(trip => {
        const driverName = typeof trip.IDDriver === "object"
          ? `${trip.IDDriver.name} ${trip.IDDriver.lastName}`.toLowerCase()
          : String(trip.IDDriver).toLowerCase()
        const ruteName = typeof trip.IDRute === "object"
          ? trip.IDRute.name.toLowerCase()
          : String(trip.IDRute).toLowerCase()
        const truckPlates = typeof trip.IDTruck === "object"
          ? trip.IDTruck.plates.toLowerCase()
          : String(trip.IDTruck).toLowerCase()

        return driverName.includes(searchTerm.toLowerCase()) ||
          ruteName.includes(searchTerm.toLowerCase()) ||
          truckPlates.includes(searchTerm.toLowerCase())
      })
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(trip => trip.status === statusFilter)
    }

    // Date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(trip => {
        const tripDate = new Date(trip.scheduledDepartureDate)
        return tripDate.toDateString() === filterDate.toDateString()
      })
    }

    filtered.sort((a, b) => Number(b._id) - Number(a._id))
    setFilteredTrips(filtered)
  }, [trips, searchTerm, statusFilter, dateFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ruteData, userData, truckData, tripData, cargoTypeData, boxData] = await Promise.all([
        getRutes(),
        authAPI.getAllUsers(),
        getTrucksAvailable(),
        getTrips(),
        getCargoTypes(),
        getBoxsAvailable(),
      ])
      setRutes(ruteData)
      setDrivers(userData.filter((u) => u.role === "driver"))
      setTrucks(truckData)
      const sortedTrips = tripData.sort((a, b) => Number(b._id) - Number(a._id))
      setTrips(sortedTrips)
      setCargoTypes(cargoTypeData)
      setBoxs(boxData)
    } catch (err) {
      console.error(err)
      setError("Error loading data")
    } finally {
      setLoading(false)
    }
  }

  const handleRuteCreated = () => {
    setSuccess("Route created successfully!")
    setTimeout(() => setSuccess(""), 3000)
    loadData()
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Scheduled: { bg: "bg-blue-100", text: "text-blue-800", label: "Scheduled" },
      "In Transit": { bg: "bg-yellow-100", text: "text-yellow-800", label: "In Transit" },
      Completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
      Canceled: { bg: "bg-red-100", text: "text-red-800", label: "Canceled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Scheduled

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setDateFilter("")
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Access Denied</h3>
                <p className="mt-1 text-sm">Only administrators can manage routes and trips.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Route className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">Trip Management</h1>
              </div>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Total trips:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                    {trips.length}
                  </span>
                </div>
                {(searchTerm || statusFilter || dateFilter) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Filtered:</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                      {filteredTrips.length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 flex gap-4">
              <button
                onClick={() => setShowTripModal(true)}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Add New Trip
              </button>
              <button
                onClick={() => setShowRuteModal(!showRuteModal)}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus
                  className={`h-5 w-5 transition-transform duration-200 ${showRuteModal ? "rotate-45" : "group-hover:scale-110"}`}
                />
                {showRuteModal ? "Cancel" : "Add New Route"}
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Route Creation Modal */}
        {showRuteModal && (
          <CreateRuteModal
            isOpen={showRuteModal}
            onClose={() => setShowRuteModal(false)}
            onCreated={handleRuteCreated}
          />
        )}

        {showTripModal && (
          <CreateTripModal
            isOpen={showTripModal}
            onClose={() => setShowTripModal(false)}
            onCreated={loadData}
            drivers={drivers}
            rutes={rutes}
            trucks={trucks}
            cargoTypes={cargoTypes}
            boxs={boxs}
            userId={Number(user?.id)}
          />
        )}

        {/* Search and Filter Section */}
        <div className="mb-6 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Bar */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by driver, route or plates..."
                className="w-full pl-12 pr-12 py-3 border border-slate-300 rounded-xl bg-white text-sm md:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-lg transition"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-slate-700">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-400"
                  >
                    <option value="">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block mb-1 text-sm font-semibold text-slate-700">Departure Date</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-400"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex flex-col justify-end">
                  <button
                    onClick={clearFilters}
                    disabled={!searchTerm && !statusFilter && !dateFilter}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Trips Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Scheduled Trips</h3>
                <p className="text-slate-600 text-sm mt-1">
                  {filteredTrips.length === trips.length
                    ? `Showing all ${trips.length} trips`
                    : `Showing ${filteredTrips.length} of ${trips.length} trips`
                  }
                </p>
              </div>
              {(searchTerm || statusFilter || dateFilter) && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Filter className="h-4 w-4" />
                  <span>Filters active</span>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Loading trips...</span>
              </div>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-16">
              <Route className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {trips.length === 0 ? "No trips scheduled" : "No trips match your filters"}
              </h3>
              <p className="text-slate-600 mb-6">
                {trips.length === 0
                  ? "Start by assigning your first trip"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {trips.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Truck
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Cargo & Box
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Departure
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Arrival
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredTrips.map((trip) => (
                    <tr key={trip._id} onClick={() => {
                      setSelectedTrip(trip);
                      setShowModalMore(true);
                    }}
                      className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">
                              {typeof trip.IDDriver === "object"
                                ? `${trip.IDDriver.name} ${trip.IDDriver.lastName}`
                                : trip.IDDriver}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {typeof trip.IDRute === "object" ? trip.IDRute.name : trip.IDRute}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-slate-700">
                          {typeof trip.IDTruck === "object" ? trip.IDTruck.plates : trip.IDTruck}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-slate-700">
                          <div className="font-medium">
                            {typeof trip.IDCargoType === "object" && trip.IDCargoType ? (trip.IDCargoType as any).name : trip.IDCargoType}
                          </div>
                          <div className="text-xs text-slate-500">
                            Box #{typeof trip.IDBox === "object" && trip.IDBox ? (trip.IDBox as any)._id : trip.IDBox}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-slate-700">
                          <div className="font-medium">
                            {new Date(trip.scheduledDepartureDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(trip.scheduledDepartureDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-slate-700">
                          <div className="font-medium">
                            {new Date(trip.scheduledArrivalDate).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(trip.scheduledArrivalDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">{getStatusBadge(trip.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {selectedTrip && (
                <ModalMoreTrip
                  isOpen={showModalMore}
                  trip={selectedTrip}
                  onClose={() => setShowModalMore(false)}
                  onUpdated={loadData}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TripManagement