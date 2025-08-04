import { Dialog } from "@headlessui/react"
import { AlertTriangle, Calendar, CheckCircle, Clock, MapPin, Navigation, Package, Pause, Play, Route, Thermometer, Truck, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { Trip, Tracking } from '../../../types'
import { updateTrip } from '../../../services/tripService'
import { getTrackingByTrip } from '../../../services/trackingService'
import MapView from '../../Map/MapView'

interface Props {
    isOpen: boolean
    onClose: () => void
    trip: Trip
    onUpdated?: () => void
}

const ModalMoreTrip: React.FC<Props> = ({ isOpen, onClose, trip, onUpdated }) => {
    const [departure, setDeparture] = useState(trip.scheduledDepartureDate.slice(0, 16))
    const [arrival, setArrival] = useState(trip.scheduledArrivalDate.slice(0, 16))
    const [saving, setSaving] = useState(false)
    const [tracking, setTracking] = useState<Tracking[]>([])

    useEffect(() => {
        setDeparture(trip.scheduledDepartureDate.slice(0, 16))
        setArrival(trip.scheduledArrivalDate.slice(0, 16))
    }, [trip])

    useEffect(() => {
        if (isOpen) {
            getTrackingByTrip(trip._id)
                .then(setTracking)
                .catch(err => console.error(err))
        }
    }, [isOpen, trip._id])
    
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'in transit':
                return 'text-green-600 bg-green-50 border-green-200'
            case 'completed':
                return 'text-gray-600 bg-gray-50 border-gray-200'
            case 'canceled':
                return 'text-red-600 bg-red-50 border-red-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'scheduled':
                return <Clock className="w-4 h-4" />
            case 'in transit':
                return <Play className="w-4 h-4" />
            case 'completed':
                return <CheckCircle className="w-4 h-4" />
            case 'canceled':
                return <Pause className="w-4 h-4" />
            default:
                return <AlertTriangle className="w-4 h-4" />
        }
    }

    const calculateDuration = () => {
        const start = new Date(trip.scheduledDepartureDate)
        const end = new Date(trip.scheduledArrivalDate)
        const diffMs = end.getTime() - start.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)
        const remainingHours = diffHours % 24
        
        if (diffDays > 0) {
            return `${diffDays}d ${remainingHours}h`
        }
        return `${diffHours}h`
    }

    // Funciones auxiliares para verificar tipos de forma segura
    const isRouteObject = (route: any): route is { origin: any, destination: any, name: string, maxTemp: number, minTemp: number, maxHum: number, minHum: number } => {
        return route && typeof route === 'object' && route.origin && route.destination
    }

    const isDriverObject = (driver: any): driver is { name: string, lastName: string, secondLastName?: string, email: string, phoneNumber: string, status: string, profilePicture?: string } => {
        return driver && typeof driver === 'object' && driver.name
    }

    const isTruckObject = (truck: any): truck is { _id: number, plates: string, status: string, loadCapacity: number } => {
        return truck && typeof truck === 'object' && truck.plates
    }

    const isBoxObject = (box: any): box is { _id: number, status: string, length: number, width: number, height: number, maxWeigth: number } => {
        return box && typeof box === 'object' && box.status
    }

    const isAdminObject = (admin: any): admin is { name: string, lastName: string, secondLastName?: string, email: string, phoneNumber: string, profilePicture?: string } => {
        return admin && typeof admin === 'object' && admin.name
    }

    // Variables para datos seguros
    const routeData = isRouteObject(trip.IDRute) ? trip.IDRute : null
    const driverData = isDriverObject(trip.IDDriver) ? trip.IDDriver : null
    const truckData = isTruckObject(trip.IDTruck) ? trip.IDTruck : null
    const boxData = isBoxObject(trip.IDBox) ? trip.IDBox : null
    const adminData = isAdminObject(trip.IDAdmin) ? trip.IDAdmin : null

    // Coordenadas para el mapa
    const originCoords = routeData?.origin?.coordinates || [0, 0]
    const destinationCoords = routeData?.destination?.coordinates || [0, 0]

    const trackingPath = tracking.map(t => t.coordinates as [number, number])
    const currentPosition = tracking.length > 0 ? tracking[tracking.length - 1].coordinates as [number, number] : undefined

    const isLocked = trip.status === 'Completed' || trip.status === 'Canceled'
    const isScheduled = trip.status === 'Scheduled'

    const handleSave = async () => {
        try {
            setSaving(true)
            await updateTrip(String(trip._id), {
                scheduledDepartureDate: new Date(departure).toISOString(),
                scheduledArrivalDate: new Date(arrival).toISOString()
            })
            toast.success('Trip updated')
            onUpdated?.()
            onClose()
        } catch (err) {
            console.error(err)
            toast.error('Error updating trip')
        } finally {
            setSaving(false)
        }
    }

    const handleCancelTrip = async () => {
        try {
            setSaving(true)
            await updateTrip(String(trip._id), { status: 'Canceled' })
            toast.success('Trip canceled')
            onUpdated?.()
            onClose()
        } catch (err) {
            console.error(err)
            toast.error('Error cancelling trip')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" aria-hidden="true" />
            
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <Dialog.Panel className="relative bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Route className="w-6 h-6" />
                            </div>
                            <div>
                                <Dialog.Title className="text-2xl font-bold">
                                    Trip #{trip._id} - {routeData?.name || 'Route not available'}
                                </Dialog.Title>
                                <p className="text-indigo-100 text-sm">
                                    Detailed trip information
                                </p>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border bg-white/20 text-white border-white/30`}>
                                {getStatusIcon(trip.status)}
                                {trip.status}
                            </div>
                            <div className="text-indigo-100 text-sm">
                                Estimated distance: {trip.estimatedDistance.toLocaleString()} km
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto max-h-[75vh]">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            
                            {/* Left Column - Trip Details */}
                            <div className="space-y-6">
                                
                                {/* Schedule Information */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Trip Planning
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Scheduled Departure</p>
                                            <p className="font-semibold text-gray-900">{formatDate(trip.scheduledDepartureDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Scheduled Arrival</p>
                                            <p className="font-semibold text-gray-900">{formatDate(trip.scheduledArrivalDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Estimated Duration</p>
                                            <p className="font-semibold text-gray-900">{calculateDuration()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Distance</p>
                                            <p className="font-semibold text-gray-900">{trip.estimatedDistance.toLocaleString()} km</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver Information */}
                                {driverData ? (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-green-600" />
                                            Driver Information
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                                                {driverData.profilePicture ? (
                                                    <img
                                                        src={driverData.profilePicture || "/placeholder.svg"}
                                                        alt="Driver"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-green-100">
                                                        <User className="w-8 h-8 text-green-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {driverData.name} {driverData.lastName} {driverData.secondLastName || ''}
                                                </p>
                                                <p className="text-sm text-gray-600">{driverData.email}</p>
                                                <p className="text-sm text-gray-600">{driverData.phoneNumber}</p>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(driverData.status)}`}>
                                                    {driverData.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-green-600" />
                                            Driver Information
                                        </h3>
                                        {/* <p className="text-gray-500">Driver ID: </p> */}
                                    </div>
                                )}

                                {/* Vehicle Information */}
                                {truckData ? (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-orange-600" />
                                            Vehicle Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Plates</p>
                                                <p className="font-semibold text-gray-900">{truckData.plates}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(truckData.status)}`}>
                                                    {truckData.status}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Load Capacity</p>
                                                <p className="font-semibold text-gray-900">{truckData.loadCapacity.toLocaleString()} kg</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">ID Truck</p>
                                                <p className="font-semibold text-gray-900">#{truckData._id}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-orange-600" />
                                            Vehicle Information
                                        </h3>
                                        {/* <p className="text-gray-500">ID del vehículo: </p> */}
                                    </div>
                                )}

                                {/* Box Information */}
                                {boxData ? (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Package className="w-5 h-5 text-purple-600" />
                                            Container Information
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">ID Box</p>
                                                <p className="font-semibold text-gray-900">#{boxData._id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Status</p>
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(boxData.status)}`}>
                                                    {boxData.status}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Dimensions</p>
                                                <p className="font-semibold text-gray-900">
                                                    {boxData.length}×{boxData.width}×{boxData.height} m
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Maximum Weight</p>
                                                <p className="font-semibold text-gray-900">{boxData.maxWeigth.toLocaleString()} kg</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Package className="w-5 h-5 text-purple-600" />
                                            Container Information
                                        </h3>
                                        <p className="text-gray-500">Container ID: {trip.IDBox}</p>
                                    </div>
                                )}

                                {/* Route Conditions */}
                                {routeData && (
                                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Thermometer className="w-5 h-5 text-cyan-600" />
                                            Condiciones de la Ruta
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Temperature</p>
                                                <p className="font-semibold text-gray-900">
                                                    {routeData.minTemp}°C - {routeData.maxTemp}°C
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Humidity</p>
                                                <p className="font-semibold text-gray-900">
                                                    {routeData.minHum}% - {routeData.maxHum}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column - Map and Route */}
                            <div className="space-y-6">
                                
                                {/* Map */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-red-600" />
                                        Route Map
                                    </h3>
                                    <MapView
                                        origin={originCoords as [number, number]}
                                        destination={destinationCoords as [number, number]}
                                        path={trackingPath}
                                        current={currentPosition}
                                    />
                                </div>

                                {/* Route Details */}
                                {routeData && (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Navigation className="w-5 h-5 text-indigo-600" />
                                            Route Details
                                        </h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">Point of Origin</p>
                                                    <p className="text-sm text-gray-600">
                                                        Lat: {originCoords[1]?.toFixed(6)}, Lng: {originCoords[0]?.toFixed(6)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-8"></div>
                                            
                                            <div className="flex items-start gap-3">
                                                <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">Point of Destination</p>
                                                    <p className="text-sm text-gray-600">
                                                        Lat: {destinationCoords[1]?.toFixed(6)}, Lng: {destinationCoords[0]?.toFixed(6)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Admin Information */}
                                {adminData ? (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-gray-600" />
                                            Responsible Administrator
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                                                {adminData.profilePicture ? (
                                                    <img 
                                                        src={adminData.profilePicture || "/placeholder.svg"} 
                                                        alt="Admin"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <User className="w-6 h-6 text-gray-600" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {adminData.name} {adminData.lastName} {adminData.secondLastName || ''}
                                                </p>
                                                <p className="text-sm text-gray-600">{adminData.email}</p>
                                                <p className="text-sm text-gray-600">{adminData.phoneNumber}</p>
                                            </div>
                                        </div>
                                    </div>
                                  ) : (
                                      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                              <User className="w-5 h-5 text-gray-600" />
                                              Responsible Administrator
                                          </h3>
                                          <p className="text-gray-500">Administrator ID: {trip.IDAdmin}</p>
                                      </div>
                                  )}
                              </div>
                              {isLocked ? (
                                  <div className="mt-8 text-sm text-red-500">This trip is {trip.status.toLowerCase()} and cannot be edited.</div>
                              ) : isScheduled ? (
                                  <div className="mt-8">
                                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                          <Calendar className="w-5 h-5 text-blue-600" />
                                          Edit Trip
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                              <label className="text-sm text-gray-600 mb-1 block">Scheduled Departure</label>
                                              <input type="datetime-local" value={departure} onChange={(e) => setDeparture(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                          </div>
                                          <div>
                                              <label className="text-sm text-gray-600 mb-1 block">Scheduled Arrival</label>
                                              <input type="datetime-local" value={arrival} onChange={(e) => setArrival(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                          </div>
                                      </div>
                                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                          <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400">
                                              {saving ? 'Saving...' : 'Save Changes'}
                                          </button>
                                          <button onClick={handleCancelTrip} disabled={saving} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:bg-red-400">
                                              Cancel Trip
                                          </button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="mt-8 flex justify-end">
                                      <button onClick={handleCancelTrip} disabled={saving} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:bg-red-400">
                                          Cancel Trip
                                      </button>
                                  </div>
                              )}
                          </div>
                      </div>
                  </Dialog.Panel>
              </div>
          </Dialog>
      )
  }

export default ModalMoreTrip
