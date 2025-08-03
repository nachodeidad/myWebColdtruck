import { Box, Microchip, Weight } from "lucide-react"
import { useEffect, useState } from "react"
import { getBoxs } from "../../../services/boxService"
import { getCargoTypes } from "../../../services/cargoTypeService"
import { getSensors, getSensorsActive } from "../../../services/sensorService"
import { Box as BoxType } from "../../../types/Box"
import { CargoType } from "../../../types/CargoType"
import { Sensor } from "../../../types/Sensor"
import BoxList from "./Box/BoxList"
import CargoTypeList from "./CargoType/CargoTypeList"
import SensorList from "./Sensor/SensorList"

const Management: React.FC = () => {
    const [cargoTypes, setCargoTypes] = useState<CargoType[]>([])
    const [boxes, setBoxes] = useState<BoxType[]>([])
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [sensorsN, setSensorsN] = useState<Sensor[]>([])
    const [activeTab, setActiveTab] = useState<'boxes' | 'cargo' | 'sensors'>('boxes')

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

    const fetchCargoTypes = async () => {
        try {
            const cargoData = await getCargoTypes()
            setCargoTypes(cargoData)
        } catch (error) {
            console.error("Error fetching cargo types:", error)
        }
    }

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

    useEffect(() => {
        fetchCargoTypes()
    }, [])

    useEffect(() => {
        const fetchSensors = async () => {
            try {
                const data = await getSensorsActive()
                setSensors(data)
            } catch (error) {
                console.error("Error fetching cargo types:", error)
            }
        }

        fetchSensors()
    }, [])

    const tabClasses = (tab: string) =>
        `cursor-pointer p-4 rounded-xl duration-500 ${activeTab === tab
            ? 'bg-blue-600 text-white shadow-xl scale-105'
            : 'bg-blue-50 hover:bg-blue-200 text-slate-900'
        }`

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div>
                    <div className="mb-1">
                        <div className="flex lg:flex-row lg:items-center lg:justify-center gap-10">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
                                {/* BOTON BOX MANAGEMENT */}
                                <div onClick={() => setActiveTab('boxes')} className={tabClasses('boxes')}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl">
                                            <Box className={`h-6 w-6 ${activeTab === 'boxes' ? 'text-blue-600' : 'text-blue-500'}`} />
                                        </div>
                                        <h1 className="text-3xl font-bold ">Box Management</h1>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span>Total Boxes:</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-800">
                                            {boxes.length}
                                        </span>
                                    </div>
                                </div>

                                {/* BOTON CARGO MANAGEMENT */}
                                <div onClick={() => setActiveTab('cargo')} className={tabClasses('cargo')}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl">
                                            <Weight className={`h-6 w-6 ${activeTab === 'cargo' ? 'text-blue-600' : 'text-blue-500'}`} />
                                        </div>
                                        <h1 className="text-3xl font-bold ">Cargo Management</h1>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span>Total Cargo Types:</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-800">
                                            {cargoTypes.length}
                                        </span>
                                    </div>
                                </div>

                                {/* BOTON SENSOR MANAGEMENT */}
                                <div onClick={() => setActiveTab('sensors')} className={tabClasses('sensors')}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-xl">
                                            <Microchip className={`h-6 w-6 ${activeTab === 'sensors' ? 'text-blue-600' : 'text-blue-500'}`} />
                                        </div>
                                        <h1 className="text-3xl font-bold ">Sensor Management</h1>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span>Total Sensors:</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-800">
                                            {sensors.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Renderizado */}
                    {activeTab === 'boxes' && <BoxList />}
                    {activeTab === 'cargo' && <CargoTypeList />}
                    {activeTab === 'sensors' && <SensorList />}
                </div>
            </div>
        </div>
    )
}

export default Management