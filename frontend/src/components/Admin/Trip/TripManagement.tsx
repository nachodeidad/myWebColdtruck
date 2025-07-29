"use client"

import type React from "react"

import { AlertCircle, Calendar, Loader2, MapPin, Plus, Route, Truck, User } from "lucide-react"
import { useEffect, useState } from "react"
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

const TripManagement: React.FC = () => {
  const { user } = useAuth()
  const [rutes, setRutes] = useState<Rute[]>([])
  const [drivers, setDrivers] = useState<UserType[]>([])
  const [trucks, setTrucks] = useState<TruckType[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [cargoTypes, setCargoTypes] = useState<CargoType[]>([])
  const [boxs, setBoxs] = useState<Box[]>([])
  const [selectedRute, setSelectedRute] = useState<Rute | null>(null)
  const [path, setPath] = useState<[number, number][]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showRuteModal, setShowRuteModal] = useState(false)
  const [showRuteForm, setShowRuteForm] = useState(false)
  const [minDateTime, setMinDateTime] = useState('');

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
      setTrips(tripData)
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
    setShowRuteForm(false)
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
          .then(setPath)
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
      setError("Please complete all fields")
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
      setSuccess("Trip assigned successfully!")
      setTimeout(() => setSuccess(""), 3000)
      loadData()
    } catch (err) {
      console.error(err)
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
              <div className="flex items-center gap-2 text-slate-600">
                <span className="text-sm">Total trips:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                  {trips.length}
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={() => setShowRuteModal(!showRuteModal)}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <Plus
                  className={`h-5 w-5 transition-transform duration-200 ${showRuteModal ? "rotate-45" : "group-hover:scale-110"}`}
                />
                {showRuteModal ? "Cancel Route Creation" : "Create New Route"}
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

        {/* Trip Assignment Form */}
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Assign New Trip</h2>
            <p className="text-blue-100 mt-1">Create and assign a new trip to drivers</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Driver Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <User className="h-4 w-4 text-slate-500" />
                  Driver <span className="text-red-500">*</span>
                </label>
                <select
                  name="IDDriver"
                  value={form.IDDriver}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                  disabled={submitting}
                >
                  <option value="">Select driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Route Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Route className="h-4 w-4 text-slate-500" />
                  Route <span className="text-red-500">*</span>
                </label>
                <select
                  name="IDRute"
                  value={form.IDRute}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                  disabled={submitting}
                >
                  <option value="">Select route</option>
                  {rutes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Truck Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Truck className="h-4 w-4 text-slate-500" />
                  Truck <span className="text-red-500">*</span>
                </label>
                <select
                  name="IDTruck"
                  value={form.IDTruck}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                  disabled={submitting}
                >
                  <option value="">Select truck</option>
                  {trucks.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.plates}
                    </option>
                  ))}
                </select>
              </div>

              {/* Box Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Truck className="h-4 w-4 text-slate-500" />
                  Box <span className="text-red-500">*</span>
                </label>
                <select
                  name="IDBox"
                  value={form.IDBox}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                  disabled={submitting}
                >
                <option value="">Select Box</option>
                  {boxs.map((b) => {
                    const volume = (b.length * b.width * b.height).toFixed(0); // m³ redondeado
                    return (
                      <option key={b._id} value={b._id}>
                        #{b._id} − {volume} m³ − {b.maxWeigth} Kg
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Cargo Type Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Truck className="h-4 w-4 text-slate-500" />
                  Cargo Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="IDCargoType"
                  value={form.IDCargoType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                  disabled={submitting}
                >
                  <option value="">Select Cargo Type</option>
                  {cargoTypes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
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
        </div>

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

        {/* Trips Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">Scheduled Trips</h3>
            <p className="text-slate-600 text-sm mt-1">Monitor and manage all scheduled trips</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-slate-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Loading trips...</span>
              </div>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-16">
              <Route className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No trips scheduled</h3>
              <p className="text-slate-600 mb-6">Start by assigning your first trip</p>
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
                      Departure
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {trips.map((trip) => (
                    <tr key={trip._id} className="hover:bg-slate-50 transition-colors duration-150">
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
                          {new Date(trip.scheduledDepartureDate).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">{getStatusBadge(trip.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TripManagement
