import { EditIcon, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { getSensors } from "../../../../services/sensorService"
import { Sensor } from "../../../../types/Sensor"
import ModalEditSensor from "./ModalEditSensor"
import ModalRegisterSensor from "./RegisterSensor"

const statusSensorStyles = {
    Active: 'bg-green-100 text-green-800',
    'Out of Service': 'bg-red-100 text-red-800',
}

const SensorList = () => {
    const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null)
    const [sensorsN, setSensorsN] = useState<Sensor[]>([])
    const [showSensorModal, setShowSensorModal] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const fetchSensorsN = async () => {
        try {
            const sensorData = await getSensors()
            const sortedSensors = sensorData
                .filter((s): s is Sensor & { createdAt: string } => !!s.createdAt)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            setSensorsN(sortedSensors)
        } catch (error) {
            console.error("Error fetching sensors:", error)
        }
    }

    useEffect(() => {
        fetchSensorsN()
    }, [])

    const handleEditClick = (sensor: Sensor) => {
        setSelectedSensor(sensor)
        setShowModal(true)
    }

    const handleSave = () => {
        setShowModal(false)
        setSelectedSensor(null)
        fetchSensorsN()
    }

    return (
        <div>
            <div className="flex justify-end items-center py-5">
                <button
                    onClick={() => setShowSensorModal(true)}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    <Plus className="h-5 w-5 transition-transform duration-200" />
                    Add New Sensor
                </button>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900">Sensor List</h3>
                    <p className="text-slate-600 text-sm mt-1">Manage and monitor Sensor</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-blue-50 text-slate-700 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sensorsN.map((sensorN) => (
                                <tr key={sensorN._id} className="hover:bg-slate-50 transition duration-200">
                                    <td className="px-6 py-4 text-slate-900 font-medium">{sensorN._id}</td>
                                    <td className="px-6 py-4 text-slate-900 font-medium">{sensorN.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusSensorStyles[sensorN.status]}`}>{sensorN.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleEditClick(sensorN)}
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-xl shadow-sm transition"
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
            </div>

            {selectedSensor && (
                <ModalEditSensor
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    sensor={selectedSensor}
                    onSave={handleSave}
                />
            )}

            <ModalRegisterSensor
                isOpen={showSensorModal}
                onClose={() => setShowSensorModal(false)}
                onSensorRegistered={fetchSensorsN}
            />
        </div>
    )
}

export default SensorList