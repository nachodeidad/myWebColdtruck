import { Dialog } from "@headlessui/react"
import { AlertTriangle, Calendar, CheckCircle, Clock, MapPin, Navigation, Package, Pause, Play, Route, Thermometer, Truck, User, X, Droplets, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { Trip, Tracking, SensorReading, AlertInfo } from '../../../types'
import { updateTrip, getAlertsByTrip } from '../../../services/tripService'
import { getTrackingByTrip } from '../../../services/trackingService'
import { getSensorReadingsByTrip } from '../../../services/sensorReadingService'
import { getRuteGeometry } from '../../../services/ruteService'
import MapView from '../../Map/MapView'
import { getAlerts } from "../../../services/alertService";


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
    const [readings, setReadings] = useState<SensorReading[]>([])
    const [alerts, setAlerts] = useState<AlertInfo[]>([])
    const [routePath, setRoutePath] = useState<[number, number][]>([]) // Nueva línea para la geometría de la ruta

    useEffect(() => {
        setDeparture(trip.scheduledDepartureDate.slice(0, 16))
        setArrival(trip.scheduledArrivalDate.slice(0, 16))
    }, [trip])

    useEffect(() => {
        if (isOpen) {
            getTrackingByTrip(trip._id)
                .then(setTracking)
                .catch(err => console.error(err))

            getSensorReadingsByTrip(trip._id)
                .then(setReadings)
                .catch(err => console.error(err))

            getAlertsByTrip(trip._id)
                .then(setAlerts)
                .catch(err => console.error(err))
        }
    }, [isOpen, trip._id])

    // Nueva función para obtener la geometría de la ruta real
    useEffect(() => {
        if (isOpen && routeData?._id) {
            getRuteGeometry(routeData._id)
                .then(setRoutePath)
                .catch(() => setRoutePath([]))
        }
    }, [isOpen, trip.IDRute])

    const [alertDefs, setAlertDefs] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            getAlerts()
                .then(setAlertDefs)
                .catch(console.error);
        }
    }, [isOpen]);

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
    const isRouteObject = (route: any): route is { origin: any, destination: any, name: string, maxTemp: number, minTemp: number, maxHum: number, minHum: number, _id: number } => {
        return route && typeof route === 'object' && route.origin && route.destination && route._id
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

    // CLAVE: Usar la ruta real como path, no el tracking
    const mapPath = routePath.length > 0 ? routePath : [] // Usar la geometría de la ruta real

    const isLocked = trip.status === 'Completed' || trip.status === 'Canceled'
    const isScheduled = trip.status === 'Scheduled'

    // Funciones para análisis de datos de sensores
    const getSensorStats = () => {
        if (readings.length === 0) return null

        const temps = readings
            .map(r => r.tempReadingValue)
            .filter(t => t !== undefined && t !== null && !isNaN(t))
        const hums = readings
            .map(r => r.humReadingValue)
            .filter(h => h !== undefined && h !== null && !isNaN(h))

        if (temps.length === 0 && hums.length === 0) return null

        return {
            temperature: {
                current: temps.length > 0 ? temps[temps.length - 1] : 0,
                avg: temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0,
                min: temps.length > 0 ? Math.min(...temps) : 0,
                max: temps.length > 0 ? Math.max(...temps) : 0,
                trend: temps.length > 1 ? (temps[temps.length - 1] - temps[temps.length - 2]) : 0
            },
            humidity: {
                current: hums.length > 0 ? hums[hums.length - 1] : 0,
                avg: hums.length > 0 ? hums.reduce((a, b) => a + b, 0) / hums.length : 0,
                min: hums.length > 0 ? Math.min(...hums) : 0,
                max: hums.length > 0 ? Math.max(...hums) : 0,
                trend: hums.length > 1 ? (hums[hums.length - 1] - hums[hums.length - 2]) : 0
            }
        }
    }
    const getAlertTitle = (alert: AlertInfo) => {
    const found = alertDefs.find(def =>
        def._id === alert.IDAlert // <- ahora sí, compara por ID
    );
    return found?.type || 'Tipo desconocido';
};

const getAlertDescription = (alert: AlertInfo) => {
    const found = alertDefs.find(def =>
        def._id === alert.IDAlert
    );
    return found?.description || 'Sin descripción registrada';
};

    const getAlertPriority = (alertType: string | undefined | null) => {
        if (!alertType || typeof alertType !== 'string') {
            return { level: 'info', color: 'bg-blue-50 border-blue-200 text-blue-800', icon: 'ℹ️' }
        }

        const criticalAlerts = ['High Temperature', 'Low Temperature']
        const warningAlerts = ['Cancellation']
        const infoAlerts = ['Route Started', 'Route Ended']

        if (criticalAlerts.includes(alertType)) {
            return { level: 'critical', color: 'bg-red-50 border-red-200 text-red-800', icon: '🚨' }
        }
        if (warningAlerts.includes(alertType)) {
            return { level: 'warning', color: 'bg-yellow-50 border-yellow-200 text-yellow-800', icon: '⚠️' }
        }
        if (infoAlerts.includes(alertType)) {
            return { level: 'info', color: 'bg-blue-50 border-blue-200 text-blue-800', icon: 'ℹ️' }
        }

        // Default case for any other alert types
        return { level: 'info', color: 'bg-blue-50 border-blue-200 text-blue-800', icon: 'ℹ️' }
    }

    const sensorStats = getSensorStats()

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

                                {/* Environmental Monitoring - Enhanced */}
                                {sensorStats && (
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-green-600" />
                                            Environmental Monitoring
                                        </h3>

                                        {/* Current Conditions */}
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-white/70 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Thermometer className="w-4 h-4 text-red-500" />
                                                        <span className="text-sm font-medium text-gray-700">Temperature</span>
                                                    </div>
                                                    {sensorStats.temperature.trend > 0 ?
                                                        <TrendingUp className="w-4 h-4 text-red-500" /> :
                                                        <TrendingDown className="w-4 h-4 text-blue-500" />
                                                    }
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    {sensorStats.temperature.current.toFixed(1)}°C
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Avg: {sensorStats.temperature.avg.toFixed(1)}°C |
                                                    Range: {sensorStats.temperature.min.toFixed(1)}°C - {sensorStats.temperature.max.toFixed(1)}°C
                                                </div>
                                            </div>

                                            <div className="bg-white/70 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Droplets className="w-4 h-4 text-blue-500" />
                                                        <span className="text-sm font-medium text-gray-700">Humidity</span>
                                                    </div>
                                                    {sensorStats.humidity.trend > 0 ?
                                                        <TrendingUp className="w-4 h-4 text-blue-500" /> :
                                                        <TrendingDown className="w-4 h-4 text-gray-500" />
                                                    }
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    {sensorStats.humidity.current.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    Avg: {sensorStats.humidity.avg.toFixed(1)}% |
                                                    Range: {sensorStats.humidity.min.toFixed(1)}% - {sensorStats.humidity.max.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recent Readings */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Readings</h4>
                                            <div className="max-h-32 overflow-y-auto space-y-2">
                                                {readings.slice(-5).reverse().map(r => (
                                                    <div key={r._id} className="flex items-center justify-between text-sm bg-white/50 rounded-lg p-2">
                                                        <span className="text-gray-600">
                                                            {new Date(r.dateTime).toLocaleTimeString('es-ES', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                day: '2-digit',
                                                                month: '2-digit'
                                                            })}
                                                        </span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center gap-1 text-red-600">
                                                                <Thermometer className="w-3 h-3" />
                                                                {r.tempReadingValue !== undefined && r.tempReadingValue !== null ?
                                                                    `${r.tempReadingValue}°C` : 'N/A'}
                                                            </span>
                                                            <span className="flex items-center gap-1 text-blue-600">
                                                                <Droplets className="w-3 h-3" />
                                                                {r.humReadingValue !== undefined && r.humReadingValue !== null ?
                                                                    `${r.humReadingValue}%` : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Alerts - Enhanced */}
                                {alerts.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                            Alert System
                                            <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2">
                                                {alerts.length} active
                                            </span>
                                        </h3>

                                        {/* Alert Summary */}
                                        <div className="grid grid-cols-1 gap-2 mb-4">
                                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                                                <div className="text-lg font-bold text-blue-600">
                                                    {alerts.filter(a => getAlertPriority(a.type).level === 'info').length}
                                                </div>
                                                <div className="text-xs text-blue-600">Info</div>
                                            </div>
                                        </div>

                                        {/* Alert List */}
                                        <div className="max-h-48 overflow-y-auto space-y-2">
                                            {alerts.slice().reverse().map((alert, idx) => {
                                                const priority = getAlertPriority(alert.type)
                                                return (
                                                    <div key={idx} className={`border rounded-lg p-3 ${priority.color}`}>
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-lg">{priority.icon}</span>
                                                                    <span className="font-semibold text-sm">
                                                                        {getAlertTitle(alert)}
                                                                    </span>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priority.level === 'critical' ? 'bg-red-200 text-red-800' : priority.level === 'warning' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'}`}>
                                                                        {priority.level}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm mb-1">{getAlertDescription(alert)}</p>
                                                                <div className="flex items-center gap-3 text-xs">
                                                                    <span>
                                                                        {new Date(alert.dateTime).toLocaleString('es-ES')}
                                                                    </span>
                                                                    {alert.temperature !== undefined && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Thermometer className="w-3 h-3" />
                                                                            {alert.temperature}°C
                                                                        </span>
                                                                    )}
                                                                    {alert.humidity !== undefined && (
                                                                        <span className="flex items-center gap-1">
                                                                            <Droplets className="w-3 h-3" />
                                                                            {alert.humidity}%
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}


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
                                            Route Conditions
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Temperature Range</p>
                                                <p className="font-semibold text-gray-900">
                                                    {routeData.minTemp}°C - {routeData.maxTemp}°C
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 mb-1">Humidity Range</p>
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

                                {/* Map - CORREGIDO */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-red-600" />
                                        Route Map
                                        {tracking.length > 0 && (
                                            <span className="text-sm font-normal text-green-600 flex items-center gap-1">
                                                • <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                Live tracking
                                            </span>
                                        )}
                                    </h3>

                                    {/* Información del mapa */}
                                    <div className="mb-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span>Assigned Route</span>
                                            </div>
                                            {currentPosition && (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                    <span>Current Position</span>
                                                </div>
                                            )}
                                        </div>
                                        {tracking.length > 0 && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                Last update: {new Date(tracking[tracking.length - 1].dateTime).toLocaleString('es-ES')}
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-96 rounded-xl overflow-hidden border border-gray-200">
                                        <MapView
                                            origin={originCoords as [number, number]}
                                            destination={destinationCoords as [number, number]}
                                            path={mapPath} // Usar la ruta real asignada
                                            current={currentPosition} // Posición actual del conductor
                                        />
                                    </div>
                                </div>

                                {/* Tracking Progress */}
                                {tracking.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Navigation className="w-5 h-5 text-green-600" />
                                            Driver Progress
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-gray-600">Total Tracking Points</span>
                                                <span className="font-medium">{tracking.length}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-gray-600">Started Tracking</span>
                                                <span className="font-medium text-xs">
                                                    {formatDate(tracking[0].dateTime)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                                <span className="text-gray-600">Last Update</span>
                                                <span className="font-medium text-xs">
                                                    {formatDate(tracking[tracking.length - 1].dateTime)}
                                                </span>
                                            </div>
                                            {currentPosition && (
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-gray-600">Current Position</span>
                                                    <span className="font-medium text-xs">
                                                        {currentPosition[1].toFixed(4)}, {currentPosition[0].toFixed(4)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

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
                                                        {`${originCoords[1]?.toFixed(6)}, ${originCoords[0]?.toFixed(6)}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-8"></div>

                                            <div className="flex items-start gap-3">
                                                <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">Point of Destination</p>
                                                    <p className="text-sm text-gray-600">
                                                        {`${destinationCoords[1]?.toFixed(6)}, ${destinationCoords[0]?.toFixed(6)}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Route Statistics */}
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Route Geometry Points</span>
                                                    <div className="font-semibold text-gray-900">{mapPath.length}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Tracking Status</span>
                                                    <div className={`font-semibold ${tracking.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                                        {tracking.length > 0 ? 'Active' : 'Inactive'}
                                                    </div>
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
                        </div>

                        {/* Edit Controls */}
                        {isLocked ? (
                            <div className="mt-8 text-sm text-red-500">
                                This trip is {trip.status.toLowerCase()} and cannot be edited.
                            </div>
                        ) : isScheduled ? (
                            <div className="mt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    Edit Trip
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600 mb-1 block">Scheduled Departure</label>
                                        <input
                                            type="datetime-local"
                                            value={departure}
                                            onChange={(e) => setDeparture(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600 mb-1 block">Scheduled Arrival</label>
                                        <input
                                            type="datetime-local"
                                            value={arrival}
                                            onChange={(e) => setArrival(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={handleCancelTrip}
                                        disabled={saving}
                                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:bg-red-400"
                                    >
                                        Cancel Trip
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={handleCancelTrip}
                                    disabled={saving}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:bg-red-400"
                                >
                                    Cancel Trip
                                </button>
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ModalMoreTrip