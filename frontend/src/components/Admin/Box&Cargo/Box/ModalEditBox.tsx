import { Dialog } from "@headlessui/react"
import { BoxIcon } from "lucide-react"
import React, { useEffect, useState } from "react"
import { updateBox } from "../../../../services/boxService"
import {
    createSensor_Box3,
    deassignSensorBox,
    getSensor_box3,
    getSensor_boxAvailable3
} from "../../../../services/sensor_boxService3"
import type { Box } from "../../../../types/Box"
import type { Sensor } from "../../../../types/Sensor"
import type { Sensor_Box3 } from "../../../../types/Sensor_Box3"

interface Props {
    isOpen: boolean
    onClose: () => void
    box: Box
    onSave: () => void
    refreshSensor2: () => void
}

const STATUS_OPTIONS = ["Available", "Inactive", "Under Maintenance"]

const ModalEditBox: React.FC<Props> = ({ isOpen, onClose, box, onSave, refreshSensor2 }) => {
    const [sensor_box, setSensor_box] = useState<Sensor_Box3[]>([])
    const [availableSensors, setAvailableSensors] = useState<Sensor[]>([])
    const [isAssigningNew, setIsAssigningNew] = useState(false)
    const [selectedSensor, setSelectedSensor] = useState("")
    const [shouldDeassign, setShouldDeassign] = useState(false)

    const [form, setForm] = useState({
        status: box.status || "Available",
        length: box.length || 0,
        width: box.width || 0,
        height: box.height || 0,
        maxWeigth: box.maxWeigth || 0,
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const isLocked = box.status === "On Trip"

    useEffect(() => {
        setForm({
            status: box.status || "Available",
            length: box.length || 0,
            width: box.width || 0,
            height: box.height || 0,
            maxWeigth: box.maxWeigth || 0,
        })
    }, [box])

    const fetchSensor_box = async () => {
        try {
            const data = await getSensor_box3()
            setSensor_box(data)
        } catch (error) {
            console.error("Error fetching Sensor_box:", error)
        }
    }

    const fetchAvailableSensors = async () => {
        try {
            const sensors = await getSensor_boxAvailable3()
            setAvailableSensors(sensors)
        } catch (err) {
            console.error("Error fetching available sensors", err)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchSensor_box()
            resetSensorFields()
        }
    }, [isOpen])

    const getSensorForBox = (boxId: number): string => {
        const activeAssignment = sensor_box
            .filter(sb =>
                (typeof sb.IDBox === "object" ? sb.IDBox._id === boxId : sb.IDBox === boxId) &&
                sb.dateEnd === null
            )
            .sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateStart).getTime())

        const latest = activeAssignment[0]

        return typeof latest?.IDSensor === "string" ? latest.IDSensor : latest?.IDSensor?._id || "-"
    }

    const validateForm = () => {
        let isValid = true
        const newErrors: any = {}

        if (form.length <= 0) {
            newErrors.length = "Length must be greater than 0."
            isValid = false
        }
        if (form.width <= 0) {
            newErrors.width = "Width must be greater than 0."
            isValid = false
        }
        if (form.height <= 0) {
            newErrors.height = "Height must be greater than 0."
            isValid = false
        }
        if (form.maxWeigth <= 0) {
            newErrors.maxWeigth = "Max Weight must be greater than 0."
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            await updateBox(box._id, form)

            if (shouldDeassign) {
                await deassignSensorBox(box._id)
            }

            if (isAssigningNew && selectedSensor) {
                await createSensor_Box3({
                    IDBox: box._id,
                    IDSensor: selectedSensor,
                    dateStart: new Date().toISOString(),
                    dateEnd: null
                })
            }

            refreshSensor2()
            fetchSensor_box()
            onSave()
            resetSensorFields()
            onClose()
        } catch (err) {
            console.error("Error updating box", err)
        }
    }

    const handleAssignOrChangeSensor = async () => {
        const current = sensor_box.find(sb =>
            (typeof sb.IDBox === "object" ? sb.IDBox._id === box._id : sb.IDBox === box._id) &&
            sb.dateEnd === null
        )

        if (current) {
            setShouldDeassign(true)
        }

        setIsAssigningNew(true)
        await fetchAvailableSensors()
    }

    const resetSensorFields = () => {
        setSelectedSensor("")
        setIsAssigningNew(false)
        setShouldDeassign(false)
    }

    const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
    const { name, value } = e.target;
    setForm((prev) => ({
        ...prev,
        [name]:
            name === "length" ||
            name === "width" ||
            name === "height" ||
            name === "maxWeigth"
                ? parseFloat(value)
                : value,
    }));
};


    return (
        <Dialog open={isOpen} onClose={() => { resetSensorFields(); onClose(); }} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true" />
            <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg z-50">
                    <p className="text-sm text-slate-500 mb-4">Box ID: #{box._id}</p>
                    <Dialog.Title className="flex justify-start items-center text-2xl font-bold text-white mb-6 bg-blue-500 p-3 rounded-xl">
                        <BoxIcon className="mx-2" /> Edit Box
                    </Dialog.Title>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={e => handleChange(e)}
                                disabled={isLocked}
                                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 ${isLocked ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            {isLocked && <p className="text-xs text-red-500 mt-1">Status cannot be changed while the box is "On Trip".</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {["length", "width", "height", "maxWeigth"].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        {field === 'maxWeigth' ? 'Max Weight (kg)' : `${field.charAt(0).toUpperCase() + field.slice(1)} (m)`}
                                    </label>
                                    <input
                                        type="number"
                                        name={field}
                                        value={(form as any)[field]}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                    />
                                    {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sensor</label>
                            <div className="flex">
                                {isAssigningNew ? (
                                    <select
                                        value={selectedSensor}
                                        onChange={(e) => setSelectedSensor(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a sensor</option>
                                        {availableSensors.map(sensor => (
                                            <option key={sensor._id} value={sensor._id}>
                                                {sensor._id} – {sensor.type}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <select disabled className="w-full px-4 py-2 border rounded-xl bg-slate-100">
                                        <option>{getSensorForBox(box._id)}</option>
                                    </select>
                                )}

                                {!isAssigningNew && (
                                    <button
                                        type="button"
                                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl ml-3 px-4"
                                        onClick={handleAssignOrChangeSensor}
                                    >
                                        Change
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex w-full gap-2 mt-6">
                            <button
                                onClick={() => { resetSensorFields(); onClose(); }}
                                className="w-full px-5 py-2 text-red-400 border border-red-400 rounded-xl hover:bg-red-50 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="w-full px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ModalEditBox
