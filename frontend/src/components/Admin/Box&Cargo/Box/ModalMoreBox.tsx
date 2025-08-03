import { Dialog } from "@headlessui/react"
import { Activity, AlertCircle, Calendar, CheckCircle, Clock, MicroscopeIcon as Microchip, Package, Thermometer, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { getSensorBoxByBoxId } from "../../../../services/sensor_boxService2"
import type { Box } from "../../../../types/Box"
import type { Sensor_Box2 } from "../../../../types/Sensor_Box2"

interface Props {
    isOpen: boolean
    box: Box
    onClose: () => void
}

const ModalMoreBox: React.FC<Props> = ({ isOpen, onClose, box }) => {
    const [sensorBoxHistory, setSensorBoxHistory] = useState<Sensor_Box2[]>([])
    const [loading, setLoading] = useState(false)

    const fetchSensorHistory = async () => {
        setLoading(true)
        try {
            const data = await getSensorBoxByBoxId(box._id)
            const sorted = data.sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime())
            setSensorBoxHistory(sorted)
        } catch (error) {
            console.error("Error fetching sensor-box history:", error)
        } finally {
            setLoading(false)
        }
    }
    
    useEffect(() => {
        if (isOpen) {
            setSensorBoxHistory([]);  // ✅ Limpiar historial anterior
            fetchSensorHistory();
        }
    }, [isOpen, box._id]);

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "—"
        const date = new Date(dateStr)
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) return "—"
        const startDate = new Date(start)
        const endDate = new Date(end)
        const diffMs = endDate.getTime() - startDate.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`
        }
        return `${diffMinutes}m`
    }

    const getSensorIcon = (type?: string) => {
        switch (type?.toLowerCase()) {
            case 'temp&hum':
            case 'temperature':
                return <Thermometer className="w-4 h-4" />
            default:
                return <Microchip className="w-4 h-4" />
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'text-green-600 bg-green-50 border-green-200'
            case 'inactive':
                return 'text-red-600 bg-red-50 border-red-200'
            case 'available':
                return 'text-blue-600 bg-blue-50 border-blue-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const getStatusIcon = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return <CheckCircle className="w-3 h-3" />
            case 'inactive':
                return <AlertCircle className="w-3 h-3" />
            default:
                return <Activity className="w-3 h-3" />
        }
    }

    // Función para obtener el ID del admin de forma segura
    const getAdminId = (admin: any) => {
        if (typeof admin === 'string' || typeof admin === 'number') {
            return admin
        }
        if (admin && typeof admin === 'object') {
            return admin._id || admin.id || 'N/A'
        }
        return 'N/A'
    }

    // Función para obtener el nombre del admin si está disponible
    const getAdminName = (admin: any) => {
        if (admin && typeof admin === 'object') {
            const firstName = admin.name || admin.firstName || ''
            const lastName = admin.lastName || ''
            const secondLastName = admin.secondLastName || ''
            return firstName && lastName ? `${firstName} ${lastName} ${secondLastName}` : firstName || 'Admin'
        }
        return null
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 transition-opacity" aria-hidden="true" />

            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                <Dialog.Panel className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Package className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Sensor History - Box #{box._id}
                                </h2>
                                <p className="text-blue-100 text-sm">
                                    Historical record of sensor assignments.
                                </p>
                            </div>
                        </div>

                        {/* Box Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/20">
                            <div className="text-center">
                                <p className="text-blue-100 text-xs">Dimensionss</p>
                                <p className="font-semibold">{box.length}×{box.width}×{box.height}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-blue-100 text-xs">Max Weight</p>
                                <p className="font-semibold">{box.maxWeigth} kg</p>
                            </div>
                            <div className="text-center">
                                <p className="text-blue-100 text-xs">Status</p>
                                <p className="font-semibold">{box.status}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-blue-100 text-xs">Admin</p>
                                <p className="font-semibold">
                                    {getAdminName(box.IDAdmin) || `ID: ${getAdminId(box.IDAdmin)}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 overflow-y-auto max-h-[60vh]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">Loading history...</span>
                            </div>
                        ) : sensorBoxHistory.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                {sensorBoxHistory.map((sb, index) => (
                                    <div
                                        key={sb._id}
                                        className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Card Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                        {getSensorIcon(typeof sb.IDSensor === "string" ? undefined : sb.IDSensor?.type)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">
                                                            {typeof sb.IDSensor === "string" ? sb.IDSensor : sb.IDSensor?._id}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            Assignment #{sb._id}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(typeof sb.IDSensor === "string" ? undefined : sb.IDSensor?.status)}`}>
                                                    {getStatusIcon(typeof sb.IDSensor === "string" ? undefined : sb.IDSensor?.status)}
                                                    {typeof sb.IDSensor === "string" ? "—" : sb.IDSensor?.status}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-6 space-y-4">
                                            {/* Sensor Type */}
                                            <div className="flex items-center gap-2">
                                                <Microchip className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">Type:</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {typeof sb.IDSensor === "string" ? "—" : sb.IDSensor?.type || "—"}
                                                </span>
                                            </div>

                                            {/* Duration */}
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">Duration:</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {calculateDuration(sb.dateStart, sb.dateEnd)}
                                                </span>
                                            </div>

                                            {/* Dates */}
                                            <div className="space-y-2 pt-2 border-t border-gray-100">
                                                <div className="flex items-start gap-2">
                                                    <Calendar className="w-4 h-4 text-green-500 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-500">Start</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {formatDate(sb.dateStart)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-2">
                                                    <Calendar className="w-4 h-4 text-red-500 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-500">End</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {formatDate(sb.dateEnd)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Microchip className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No sensor assignments
                                </h3>
                                <p className="text-gray-500">
                                    No sensor records were found for this box.
                                </p>
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ModalMoreBox