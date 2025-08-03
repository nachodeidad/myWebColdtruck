import { EditIcon, Plus } from "lucide-react"
import React, { useEffect, useState } from 'react'
import { getBoxs } from "../../../../services/boxService"
import { getSensor_box2 } from "../../../../services/sensor_boxService2"
import { Box as BoxType } from "../../../../types/Box"
import type { Sensor_Box2 } from "../../../../types/Sensor_Box2"
import ModalEditBox from "./ModalEditBox"
import ModalMoreBox from "./ModalMoreBox"
import ModalRegisterBox from "./ModalRegisterBox"

const BoxList: React.FC = () => {
    const [selectedBox, setSelectedBox] = useState<BoxType | null>(null)
    const [showModal, setShowModal] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [showMoreModal, setShowMoreModal] = useState(false)
    const [boxes, setBoxes] = useState<BoxType[]>([])
    const [sensor_box, setSensor_box] = useState<Sensor_Box2[]>([])


    const getSensorForBox = (boxId: number): string => {
        const activeAssignment = sensor_box
            .filter(sb => {
                if (!sb.IDBox) return false;

                if (typeof sb.IDBox === "number") {
                    return sb.IDBox === boxId;
                }

                return sb.IDBox._id === boxId;
            })
            .filter(sb => sb.dateEnd === null) // solo asignaciones activas
            .sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime()); // más reciente primero

        const latest = activeAssignment[0];

        if (latest?.IDSensor && typeof latest.IDSensor !== "string") {
            return latest.IDSensor._id.toString();
        }

        return "-";
    };


    const fetchBoxes = async () => {
        try {
            const data = await getBoxs()
            const sorted = data.sort((a, b) => b._id - a._id)
            setBoxes(sorted)
        } catch (error) {
            console.error("Error fetching boxes:", error)
        }
    }

    useEffect(() => {
        fetchBoxes()
    }, [])

    const handleEditClick = (box: BoxType) => {
        setSelectedBox(box)
        setShowModal(true)
    }

    const handleSave = () => {
        setShowModal(false)
        setSelectedBox(null)
        fetchBoxes()
    }

    const fetchSensor_box = async () => {
        try {
            const data = await getSensor_box2()
            setSensor_box(data)
        } catch (error) {
            console.error("Error fetching Sensor_box:", error)
        }
    }

    useEffect(() => {
        fetchSensor_box()
    }, [])

    const statusStyles = {
        Available: 'bg-green-100 text-green-800',
        'On Trip': 'bg-blue-100 text-blue-800',
        'Under Maintenance': 'bg-yellow-100 text-yellow-800',
        Inactive: 'bg-red-100 text-red-800',
    }

    return (
        <div>
            <div className="flex justify-end items-center py-5">
                <button
                    onClick={() => setShowRegisterModal(true)}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    <Plus className="h-5 w-5 transition-transform duration-200" />
                    Add New Box
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900">Boxes List</h3>
                    <p className="text-slate-600 text-sm mt-1">Manage and monitor Boxes</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-blue-50 text-slate-700 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">m³</th>
                                <th className="px-6 py-4">Max Weight</th>
                                <th className="px-6 py-4">SENSOR</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {boxes.map((box) => (
                                <tr key={box._id} onClick={() => {
                                    setSelectedBox(box);
                                    setShowMoreModal(true);
                                }} className="hover:bg-slate-50 transition duration-200">
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[box.status] || statusStyles.Inactive}`}>
                                            {box.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        <div>
                                            {((box.length * box.width * box.height)).toFixed(2)} m³
                                        </div>
                                        <div className="text-slate-400">
                                            L:{box.length} W:{box.width} H:{box.height}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {box.maxWeigth} kg
                                    </td>
                                    <td className="px-6 py-4 text-slate-700">
                                        {getSensorForBox(box._id)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClick(box);
                                            }}
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

            {selectedBox && (
                <ModalMoreBox
                    isOpen={showMoreModal}
                    box={selectedBox}
                    onClose={() => setShowMoreModal(false)}
                />
            )}

            {selectedBox && (
                <ModalEditBox
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    box={selectedBox}
                    onSave={handleSave}
                    refreshSensor2={fetchSensor_box}
                />
            )}

            <ModalRegisterBox
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onBoxRegistered={fetchBoxes}
                refreshSensor={fetchSensor_box}
            />
        </div>
    )
}

export default BoxList
