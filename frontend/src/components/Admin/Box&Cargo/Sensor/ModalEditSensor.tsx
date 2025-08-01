import { Dialog } from "@headlessui/react"
import { Microchip } from "lucide-react"
import React, { useEffect, useState } from "react"
import { updateSensor } from "../../../../services/sensorService"
import type { Sensor } from "../../../../types/Sensor"

type Props = {
  isOpen: boolean
  onClose: () => void
  sensor: Sensor
  onSave: () => void
}

const ModalEditSensor: React.FC<Props> = ({ isOpen, onClose, sensor, onSave }) => {
  const [form, setForm] = useState({
    type: sensor.type || 0,
    status: sensor.status || "Available",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: value, // no usar parseFloat
    }))
  }

  const handleSubmit = async () => {
    try {
      await updateSensor(sensor._id, form)
      onSave()
      onClose()
    } catch (err) {
      console.error("Error updating sensor", err)
    }
  }

  useEffect(() => {
    if (sensor) {
      setForm({
        type: sensor.type,
        status: sensor.status,
      })
    }
  }, [sensor])


  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true" />
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md z-10">
          <p className="text-sm text-slate-500 mb-4">Sensor ID: #{sensor._id}</p>
          <Dialog.Title className="flex justify-star items-center text-2xl font-bold text-gray-50 mb-6 bg-blue-500 p-2 rounded-xl">
            <Microchip className="mx-3" /> Sensor Edit
          </Dialog.Title>

          <div className="space-y-4">
            {/* STATUS */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="Active">Active</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>

            {/* LENGTH */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="Temperature">Temperature</option>
                <option value="Humidity">Humidity</option>
                <option value="Temp&Hum">Temp&Hum</option>
              </select>
            </div>
          </div>

          <div className="flex w-full gap-2 mt-6">
            <button
              onClick={onClose}
              className="w-full px-5 py-2 text-red-400 border-red-400 border  rounded-xl hover:bg-red-50 font-semibold"
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

export default ModalEditSensor