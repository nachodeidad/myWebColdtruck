import { AlertCircle, Calendar, ChevronDown, Filter, Loader2, MapPin, Plus, Route, Search, Truck, User, X } from "lucide-react"
import { Dialog } from "@headlessui/react"
import type React from "react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useAuth } from "../../../contexts/AuthContext"
import { authAPI } from "../../../services/api"
import { getBoxsAvailable } from "../../../services/boxService"
import { getCargoTypes } from "../../../services/cargoTypeService"
import { getRuteGeometry, getRutes } from "../../../services/ruteService"
import { createTrip, getTrips, type TripInput } from "../../../services/tripService"
import { getTrucksAvailable } from "../../../services/truckService"
import type { Rute, Trip, Truck as TruckType, User as UserType } from "../../../types"
import { Box } from "../../../types/Box"
import { CargoType } from "../../../types/CargoType"
import MapView from "../../Map/MapView"
import CreateRuteModal from "../Rute/CreateRuteModal"
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
  const [selectedRute, setSelectedRute] = useState<Rute | null>(null)
  const [path, setPath] = useState<[number, number][]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showRuteModal, setShowRuteModal] = useState(false)
  const [minDateTime, setMinDateTime] = useState('');
  const [showTripModal, setShowTripModal] = useState(false)
  const [showModalMore, setShowModalMore] = useState(false)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  // Dropdown states for searchable selects
  const [driverSearch, setDriverSearch] = useState("")
  const [showDriverDropdown, setShowDriverDropdown] = useState(false)
  const [ruteSearch, setRuteSearch] = useState("")
  const [showRuteDropdown, setShowRuteDropdown] = useState(false)
  const [truckSearch, setTruckSearch] = useState("")
  const [showTruckDropdown, setShowTruckDropdown] = useState(false)
  const [boxSearch, setBoxSearch] = useState("")
  const [showBoxDropdown, setShowBoxDropdown] = useState(false)
  const [cargoSearch, setCargoSearch] = useState("")
  const [showCargoDropdown, setShowCargoDropdown] = useState(false)

  useEffect(() => {
    const now = new Date();
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  const [form, setForm] = useState({
    scheduledDepartureDate: "",
    scheduledArrivalDate: "",
    IDDriver: "",
    IDRute: "",
    IDTruck: "",
    IDCargoType: "",
    IDBox: "",
  })

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError("")

    if (name === "IDRute" && value) {
      const r = rutes.find((rt) => rt._id === Number(value)) || null
      setSelectedRute(r)
      if (r) {
        getRuteGeometry(r._id)
          .then((geom) => setPath(geom))
          .catch(() => setPath([]))
      } else {
        setPath([])
      }
    }



    if (name === "scheduledDepartureDate") {
      if (form.scheduledArrivalDate && new Date(form.scheduledArrivalDate) < new Date(value)) {
        setForm((prev) => ({
          ...prev,
          scheduledDepartureDate: value,
          scheduledArrivalDate: "",
        }));
        return;
      }
    }

    if (name === "scheduledArrivalDate") {
      if (form.scheduledDepartureDate && new Date(value) < new Date(form.scheduledDepartureDate)) {
        alert("Arrival date cannot be before the departure date.");
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleSubmit = async () => {
    if (!user) return

    if (!form.IDDriver || !form.IDRute || !form.IDTruck || !form.IDCargoType || !form.IDBox || !form.scheduledDepartureDate || !form.scheduledArrivalDate) {
      toast("Please complete all fields", {
        icon: "⚠️",
        style: {
          background: "#facc15", // amarillo
          color: "#1f2937",       // gris oscuro
          padding: "16px",
          borderRadius: "8px",
        }
      })
      return
    }

    const payload: TripInput = {
      scheduledDepartureDate: new Date(form.scheduledDepartureDate).toISOString(),
      scheduledArrivalDate: new Date(form.scheduledArrivalDate).toISOString(),
      IDDriver: Number(form.IDDriver),
      IDAdmin: Number(user.id),
      IDRute: Number(form.IDRute),
      IDTruck: Number(form.IDTruck),
      IDCargoType: Number(form.IDCargoType),
      IDBox: Number(form.IDBox),
    }

    try {
      setSubmitting(true)
      await createTrip(payload)
      setForm({
        scheduledDepartureDate: "",
        scheduledArrivalDate: "",
        IDDriver: "",
        IDRute: "",
        IDTruck: "",
        IDCargoType: "",
        IDBox: "",
      })
      // Clear search states
      setDriverSearch("")
      setRuteSearch("")
      setTruckSearch("")
      setBoxSearch("")
      setCargoSearch("")
      toast.success("Trip added successfully!")
      setTimeout(() => setSuccess(""), 3000)
      loadData()
      setShowTripModal(false)
    } catch (err) {
      console.error(err)
      toast.error("Error adding trip!")
      setError("Error creating trip")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Scheduled: { bg: "bg-blue-100", text: "text-blue-800", label: "Scheduled" },
      "In Progress": { bg: "bg-yellow-100", text: "text-yellow-800", label: "In Progress" },
      Completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
      Cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
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

  // Searchable select component
  const SearchableSelect = ({
    data,
    value,
    onSelect,
    searchValue,
    onSearchChange,
    show,
    onToggle,
    placeholder,
    displayField,
    idField = "_id",
    icon: Icon
  }: {
    data: any[]
    value: string
    onSelect: (value: string) => void
    searchValue: string
    onSearchChange: (value: string) => void
    show: boolean
    onToggle: (show: boolean) => void
    placeholder: string
    displayField: string | ((item: any) => string)
    idField?: string
    icon: React.ComponentType<any>
  }) => {
    const filteredData = data.filter(item => {
      const display = typeof displayField === 'function'
        ? displayField(item)
        : item[displayField]
      return display.toLowerCase().includes(searchValue.toLowerCase())
    })

    const selectedItem = data.find(item => String(item[idField]) === value)
    const displayValue = selectedItem
      ? (typeof displayField === 'function' ? displayField(selectedItem) : selectedItem[displayField])
      : ""

    // Handle click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element
        if (show && !target.closest(`[data-dropdown-id="${placeholder}"]`)) {
          onToggle(false)
        }
      }

      if (show) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [show, onToggle, placeholder])

    return (
      <div className="relative" data-dropdown-id={placeholder}>
        <div
          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent hover:border-slate-400 cursor-pointer flex items-center justify-between"
          onClick={() => onToggle(!show)}
        >
          <div className="flex items-center gap-2 flex-1">
            <Icon className="h-4 w-4 text-slate-500" />
            <span className={`${displayValue ? 'text-slate-900' : 'text-slate-500'}`}>
              {displayValue || placeholder}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${show ? 'rotate-180' : ''}`} />
        </div>

        {show && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    e.stopPropagation()
                    onSearchChange(e.target.value)
                  }}
                  onFocus={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder={`Search ${placeholder.toLowerCase()}...`}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredData.length === 0 ? (
                <div className="px-4 py-3 text-slate-500 text-sm">No results found</div>
              ) : (
                filteredData.map((item) => {
                  const display = typeof displayField === 'function' ? displayField(item) : item[displayField]
                  const id = String(item[idField])
                  return (
                    <div
                      key={id}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0"
                      onMouseDown={(e) => {
                        e.preventDefault() // Prevent input from losing focus
                        onSelect(id)
                        onToggle(false)
                        onSearchChange("")
                      }}
                    >
                      <div className="text-sm font-medium text-slate-900">{display}</div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    )
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
          <Dialog open={showTripModal} onClose={() => setShowTripModal(false)} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="flex items-center justify-center min-h-screen p-4">
              <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Assign New Trip</h2>
                  <button onClick={() => setShowTripModal(false)} className="text-white/80 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Driver Selection */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Driver <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        data={drivers}
                        value={form.IDDriver}
                        onSelect={(value) => handleChange({ target: { name: "IDDriver", value } } as any)}
                        searchValue={driverSearch}
                        onSearchChange={setDriverSearch}
                        show={showDriverDropdown}
                        onToggle={setShowDriverDropdown}
                        placeholder="Select driver"
                        displayField={(driver) => `${driver.name} ${driver.lastName}`}
                        idField="id"
                        icon={User}
                      />
                    </div>

                    {/* Route Selection */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Route <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        data={rutes}
                        value={form.IDRute}
                        onSelect={(value) => handleChange({ target: { name: "IDRute", value } } as any)}
                        searchValue={ruteSearch}
                        onSearchChange={setRuteSearch}
                        show={showRuteDropdown}
                        onToggle={setShowRuteDropdown}
                        placeholder="Select route"
                        displayField="name"
                        icon={Route}
                      />
                    </div>

                    {/* Truck Selection */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Truck <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        data={trucks}
                        value={form.IDTruck}
                        onSelect={(value) => handleChange({ target: { name: "IDTruck", value } } as any)}
                        searchValue={truckSearch}
                        onSearchChange={setTruckSearch}
                        show={showTruckDropdown}
                        onToggle={setShowTruckDropdown}
                        placeholder="Select truck"
                        displayField="plates"
                        icon={Truck}
                      />
                    </div>

                    {/* Box Selection */}
                    <div className="space-y-2 lg:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Box <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        data={boxs}
                        value={form.IDBox}
                        onSelect={(value) => handleChange({ target: { name: "IDBox", value } } as any)}
                        searchValue={boxSearch}
                        onSearchChange={setBoxSearch}
                        show={showBoxDropdown}
                        onToggle={setShowBoxDropdown}
                        placeholder="Select box"
                        displayField={(box) => {
                          const volume = (box.length * box.width * box.height).toFixed(0)
                          return `#${box._id} − ${volume} m³ − ${box.maxWeigth} Kg`
                        }}
                        icon={Truck}
                      />
                    </div>

                    {/* Cargo Type Selection */}
                    <div className="space-y-2 lg:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        Cargo Type <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        data={cargoTypes}
                        value={form.IDCargoType}
                        onSelect={(value) => handleChange({ target: { name: "IDCargoType", value } } as any)}
                        searchValue={cargoSearch}
                        onSearchChange={setCargoSearch}
                        show={showCargoDropdown}
                        onToggle={setShowCargoDropdown}
                        placeholder="Select cargo type"
                        displayField="name"
                        icon={Truck}
                      />
                    </div>

                    {/* Departure Date */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        Scheduled Departure <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="scheduledDepartureDate"
                        value={form.scheduledDepartureDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400"
                        disabled={submitting}
                        min={minDateTime}
                      />
                    </div>

                    {/* Arrival Date */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        Scheduled Arrival <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        name="scheduledArrivalDate"
                        value={form.scheduledArrivalDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400"
                        disabled={submitting}
                        min={form.scheduledDepartureDate}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Assigning Trip...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-5 w-5" />
                          Assign Trip
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        )}


        {/* Map View */}
        {selectedRute && (
          <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900">Route Preview</h3>
              <p className="text-slate-600 text-sm mt-1">{selectedRute.name}</p>
            </div>
            <div className="p-8">
              <MapView
                origin={selectedRute.origin.coordinates}
                destination={selectedRute.destination.coordinates}
                path={path}
              />
            </div>
          </div>
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
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
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