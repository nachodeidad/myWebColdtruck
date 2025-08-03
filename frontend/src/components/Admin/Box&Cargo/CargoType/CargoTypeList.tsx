import { EditIcon, Plus } from "lucide-react"
import React, { useEffect, useState } from 'react'
import { getCargoTypes } from "../../../../services/cargoTypeService"
import { CargoType } from "../../../../types/CargoType"
import ModalEditCargoType from "./ModalEditCargoType"
import ModalRegisterCargoType from "./RegisterCargoType"

const CargoTypeList: React.FC = () => {
    const [selectedCargoType, setSelectedCargoType] = useState<CargoType | null>(null)
    const [cargoTypes, setCargoTypes] = useState<CargoType[]>([])
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [showModal, setShowModal] = useState(false)

    const fetchCargoTypes = async () => {
        try {
            const cargoData = await getCargoTypes()
            const sorted = cargoData.sort((a, b) => b._id - a._id)
            setCargoTypes(sorted)
        } catch (error) {
            console.error("Error fetching cargo types:", error)
        }
    }

    const handleEditClick = (cargoType: CargoType) => {
        setSelectedCargoType(cargoType)
        setShowModal(true)
    }

    const handleSave = () => {
        setShowModal(false)
        setSelectedCargoType(null)
        fetchCargoTypes()
    }

    useEffect(() => {
        fetchCargoTypes()
    }, [])

    return (
        <div>
            <div className="flex justify-end items-center py-5">
                <button
                    onClick={() => setShowRegisterModal(true)}
                    className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                    <Plus className={`h-5 w-5 transition-transform duration-200`} />
                    Add New Cargo Type
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-900">Cargo Type List</h3>
                    <p className="text-slate-600 text-sm mt-1">Manage and monitor Cargo Type</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-blue-50 text-slate-700 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {cargoTypes.map((cargo) => (
                                <tr key={cargo._id} className="hover:bg-slate-50 transition duration-200">
                                    <td className="px-6 py-4 font-medium text-slate-900">{cargo.name}</td>
                                    <td className="px-6 py-4 text-slate-700">{cargo.description}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleEditClick(cargo)}
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

            {selectedCargoType && (
                <ModalEditCargoType
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    cargoType={selectedCargoType}
                    onSave={handleSave}
                />
            )}

            <ModalRegisterCargoType
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onCargoTypeRegistered={fetchCargoTypes}
            />
        </div>
    )
}

export default CargoTypeList