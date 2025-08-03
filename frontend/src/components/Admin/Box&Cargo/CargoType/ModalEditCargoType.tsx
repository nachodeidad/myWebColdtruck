import { Dialog } from "@headlessui/react"
import { Boxes } from "lucide-react"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { updateCargoType } from "../../../../services/cargoTypeService"
import { CargoType } from '../../../../types/CargoType'

type Props = {
    isOpen: boolean
    onClose: () => void
    cargoType: CargoType
    onSave: () => void
}

const ModalEditCargoType: React.FC<Props> = ({ isOpen, onClose, cargoType, onSave }) => {
    const [form, setForm] = useState({
        name: cargoType.name || "",
        description: cargoType.description || "",
    })

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async () => {
        try {
            await updateCargoType(cargoType._id, form)
            toast.success("Cargo updated successfully!")
            onSave()
            onClose()
        } catch (err) {
            toast.error("Error updating cargo type")
            console.error("Error updating cargo type", err)
        }
    }

    useEffect(() => {
        if (cargoType) {
            setForm({
                name: cargoType.name,
                description: cargoType.description,
            })
        }
    }, [cargoType])

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true" />
            <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md z-10">
                    <p className="text-sm text-slate-500 mb-4">Cargo Type ID: #{cargoType._id}</p>
                    <Dialog.Title className="flex justify-star items-center text-2xl font-bold text-gray-50 mb-6 bg-blue-500 p-2 rounded-xl">
                        <Boxes className="mx-3" /> Edit Cargo Type
                    </Dialog.Title>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="string"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        {/* WIDTH */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="string"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>
                    <div className="flex w-full gap-2 mt-6">
                        <button
                            onClick={onClose}
                            className="w-full px-5 py-2 bg-red-400 text-white border-red-400 border  rounded-xl hover:bg-red-600 font-semibold"
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
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ModalEditCargoType