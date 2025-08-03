import { Dialog } from "@headlessui/react"
import { Microchip, X } from "lucide-react"
import React, { useState } from "react"
import toast from "react-hot-toast"
import { createSensor } from "../../../../services/sensorService"
import { Sensor } from "../../../../types/Sensor"

type Props = {
    isOpen: boolean
    onClose: () => void
    onSensorRegistered: () => void
}

const ModalRegisterSensor: React.FC<Props> = ({ isOpen, onClose, onSensorRegistered }) => {
    const [formSensor, setFormSensor] = useState({ _id: "", type: "Temp&Hum", status: "Active" })

    const handleRegisterSensor = async () => {
        if (!formSensor._id || !formSensor.type || !formSensor.status) {
            alert("Please enter sensor ID and type.")
            return
        }

        try {
            const newSensor = {
                _id: formSensor._id,
                type: formSensor.type as Sensor["type"],
                status: formSensor.status as Sensor["status"],
            }

            await createSensor(newSensor)
            setFormSensor({ _id: "", type: "Temp&Hum", status: "Active" })
            toast.success("Sensor added successfully!")
            onSensorRegistered()
            onClose()
        } catch (error) {
            console.error("Error registering sensor:", error)
            toast.error("An error occurred while adding the sensor!")
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" />
                <Dialog.Panel className="relative z-10 max-w-2xl w-full bg-white rounded-2xl shadow-xl">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-start">
                        <div>
                            <Dialog.Title className="text-2xl font-bold text-white">Add New Sensor</Dialog.Title>
                            <p className="text-blue-100 mt-1">Register New Sensor in the System.</p>
                        </div>
                        <button onClick={onClose} className="text-white hover:text-gray-300 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            {/* ID SENSOR */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Microchip className="h-4 w-4 text-slate-500" />
                                    ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formSensor._id}
                                    onChange={(e) => setFormSensor({ ...formSensor, _id: e.target.value })}
                                    placeholder="Type the ID of Sensor"
                                    type="text"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={handleRegisterSensor}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                            >
                                <Microchip /> Register New Sensor
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ModalRegisterSensor