import { Dialog } from "@headlessui/react"
import { Box, Microchip, PencilRuler, Weight, X } from "lucide-react"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useAuth } from "../../../../contexts/AuthContext"
import { createBox } from "../../../../services/boxService"
import { createSensor_Box, getSensor_boxAvailable } from "../../../../services/sensor_boxService"
import type { Box as BoxType } from "../../../../types/Box"
import type { Sensor } from "../../../../types/Sensor"

type Props = {
    isOpen: boolean
    onClose: () => void
    onBoxRegistered: () => void
    refreshSensor: () => void
}

const ModalRegisterBox: React.FC<Props> = ({ isOpen, onClose, onBoxRegistered, refreshSensor }) => {
    const [sensors, setSensors] = useState<Sensor[]>([])
    const { user } = useAuth()

    const [formBox, setFormBox] = useState({
        status: "",
        length: "",
        width: "",
        height: "",
        maxWeigth: "",
        IDAdmin: "",
    })

    const [formSensor_Box, setFormSensor_Box] = useState({ IDSensor: "", IDBox: "" })

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const data = await getSensor_boxAvailable()
                setSensors(data)
            } catch (error) {
                console.error("Error fetching sensors:", error)
            }
        }

        if (isOpen) fetchSensors()
    }, [isOpen])

    const handleSensor_Box = async (boxId: string | number) => {
        if (!formSensor_Box.IDSensor) {
            alert("Please select a sensor to link with this box.")
            return
        }

        try {
            const newSensorBox = {
                IDSensor: formSensor_Box.IDSensor,
                IDBox: Number(boxId),
                dateStart: new Date().toISOString(),
                dateEnd: null
            }
            await createSensor_Box(newSensorBox)
            setFormSensor_Box({ IDSensor: "", IDBox: "" })
            toast.success("Sensor paired successfully!")
        } catch (error) {
            console.error("Error linking sensor to box:", error)
            toast.error("Error pairing sensor.")
        }
    }

    const handleRegisterBox = async () => {
        if (!user) return

        if (
            !formBox.status ||
            !formBox.length ||
            !formBox.width ||
            !formBox.height ||
            !formBox.maxWeigth ||
            !formSensor_Box.IDSensor
        ) {
            toast("Please fill in all required fields including the sensor.", {
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

        try {
            const newBox = {
                status: formBox.status as BoxType["status"],
                length: Number(formBox.length),
                width: Number(formBox.width),
                height: Number(formBox.height),
                maxWeigth: Number(formBox.maxWeigth),
                IDAdmin: Number(user.id),
            }

            const savedBox = await createBox(newBox)
            await handleSensor_Box(savedBox._id)

            setFormBox({ status: "", length: "", width: "", height: "", maxWeigth: "", IDAdmin: "" })
            setFormSensor_Box({ IDSensor: "", IDBox: "" })
            toast.success("Box registered and sensor linked correctly.")

            onBoxRegistered()
            refreshSensor()
            onClose()
        } catch (error) {
            console.error("Error registering box or linking sensor:", error)
            toast.error("An error occurred while registering the box or pairing the sensor.")
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" />
                <Dialog.Panel className="relative z-10 max-w-4xl w-full bg-white rounded-2xl shadow-xl">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-start w-full">
                        <div>
                            <Dialog.Title className="text-2xl font-bold text-white">Add New Box</Dialog.Title>
                            <p className="text-blue-100 mt-1">Register New Boxes in the System.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-300 transition"
                            aria-label="Close modal"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Box className="h-4 w-4 text-slate-500" /> Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                                    value={formBox.status}
                                    onChange={(e) => setFormBox({ ...formBox, status: e.target.value })}
                                >
                                    <option value="">Select status</option>
                                    <option value="Available">Available</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            {["length", "width", "height"].map((dim) => (
                                <div className="space-y-2" key={dim}>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <PencilRuler className="h-4 w-4 text-slate-500" />
                                        {dim.charAt(0).toUpperCase() + dim.slice(1)} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        placeholder={`Type the ${dim} in meters`}
                                        type="number"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                                        value={(formBox as any)[dim]}
                                        onChange={(e) => setFormBox({ ...formBox, [dim]: e.target.value })}
                                    />
                                </div>
                            ))}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Weight className="h-4 w-4 text-slate-500" /> Max Weight <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="Type the Max Weight in Kilograms"
                                    type="number"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                                    value={formBox.maxWeigth}
                                    onChange={(e) => setFormBox({ ...formBox, maxWeigth: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Microchip className="h-4 w-4 text-slate-500" /> Sensor <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                                    value={formSensor_Box.IDSensor}
                                    onChange={(e) => setFormSensor_Box({ ...formSensor_Box, IDSensor: e.target.value })}
                                >
                                    <option value="">Select sensor</option>
                                    {sensors.map((d) => (
                                        <option key={d._id} value={d._id}>
                                            {d._id} {d.type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={handleRegisterBox}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                            >
                                <Box /> Register New Box
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ModalRegisterBox
