import { Dialog } from "@headlessui/react"
import { Weight, X } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { createCargoType } from "../../../../services/cargoTypeService"

interface Props {
    isOpen: boolean
    onClose: () => void
    onCargoTypeRegistered: () => void
}

const ModalRegisterCargoType: React.FC<Props> = ({ isOpen, onClose, onCargoTypeRegistered }) => {
    const [formCargo, setFormCargo] = useState({ name: "", description: "" })

    const handleRegisterCargoType = async () => {
        if (!formCargo.name || !formCargo.description) {
            alert("Please fill in all required fields")
            return
        }

        try {
            await createCargoType(formCargo)
            setFormCargo({ name: "", description: "" })
            onCargoTypeRegistered()
            onClose()
            toast.success("Cargo type added correctly.")
        } catch (error) {
            console.error("Error creating cargo type:", error)
            toast.error("There was an error registering the cargo type.")
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="fixed inset-0 bg-black bg-opacity-50" />
                <Dialog.Panel className="relative z-10 max-w-2xl w-full bg-white rounded-2xl shadow-xl">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex justify-between items-start w-full">
                        <div>
                            <Dialog.Title className="text-2xl font-bold text-white">Add New Cargo Type</Dialog.Title>
                            <p className="text-blue-100 mt-1">Register New Cargo Types in the System.</p>
                        </div>
                        <div>
                            <button
                                onClick={onClose}
                                className="text-white hover:text-gray-300 transition"
                                aria-label="Close modal"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name Cargo Type */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Weight className="h-4 w-4 text-slate-500" />
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formCargo.name}
                                    onChange={(e) => setFormCargo({ ...formCargo, name: e.target.value })}
                                    placeholder="Enter cargo type name"
                                    type="text"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                                />
                            </div>
                            {/* Description Cargo Type */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Weight className="h-4 w-4 text-slate-500" />
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formCargo.description}
                                    onChange={(e) => setFormCargo({ ...formCargo, description: e.target.value })}
                                    placeholder="Enter description"
                                    type="text"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={handleRegisterCargoType}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                            >
                                <Weight /> Register New Cargo Type
                            </button>
                        </div>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ModalRegisterCargoType