"use client"

import { Dialog } from "@headlessui/react"
import { BoxIcon } from "lucide-react"
import React, { useEffect, useState } from "react"
import { updateBox } from "../../../../services/boxService"
import type { Box } from "../../../../types/Box"

interface Props {
    isOpen: boolean
    onClose: () => void
    box: Box
    onSave: () => void
}

const STATUS_OPTIONS = ["Available", "Inactive", "Under Maintenance"]

const ModalEditBox: React.FC<Props> = ({ isOpen, onClose, box, onSave }) => {
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: name === "length" || name === "width" || name === "height" || name === "maxWeigth"
                ? parseFloat(value)
                : value,
        }))
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
            onSave()
            onClose()
        } catch (err) {
            console.error("Error updating box", err)
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true" />
            <div className="flex items-center justify-center min-h-screen px-4">
                <Dialog.Panel className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg z-50">
                    <p className="text-sm text-slate-500 mb-4">Box ID: #{box._id}</p>
                    <Dialog.Title className="flex justify-star items-center text-2xl font-bold text-gray-50 mb-6 bg-blue-500 p-2 rounded-xl">
                        <BoxIcon className="mx-3"/> Edit Box
                    </Dialog.Title>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                disabled={isLocked}
                                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 ${isLocked ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                            >
                                {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            {isLocked && <p className="text-xs text-red-500 mt-1">Status cannot be changed while the box is "On Trip".</p>}
                        </div>

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

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 text-red-400 border-red-400 border  rounded-xl hover:bg-red-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                        >
                            Save
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}

export default ModalEditBox
