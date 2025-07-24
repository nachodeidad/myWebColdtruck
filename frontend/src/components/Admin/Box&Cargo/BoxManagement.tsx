import { Box, Microchip, PencilRuler, Weight } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { createBox, getBoxs } from "../../../services/boxService"
import { createCargoType, getCargoTypes } from "../../../services/cargoTypeService"
import { getSensorsActive } from "../../../services/sensorService"
import { Box as BoxType } from "../../../types/Box"
import { CargoType } from "../../../types/CargoType"
import { Sensor } from "../../../types/Sensor"

const BoxManagement = () => {
    const [cargoTypes, setCargoTypes] = useState<CargoType[]>([])
    const [boxes, setBoxes] = useState<BoxType[]>([])
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [formCargo, setFormCargo] = useState({
        name: "",
        description: "",
    })

    const [formBox, setFormBox] = useState({
        status: "",
        length: "",
        width: "",
        height: "",
        maxWeigth: "",
        IDAdmin: "",
    })

    const [formSensor_Box, setSensor_Box] = useState({
        IDSensor: "",
        IDBox: "",
    })
    const { user } = useAuth()

    const handleRegister = async () => {
    if (!formCargo.name || !formCargo.description) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        const newCargo = await createCargoType(formCargo);
        setCargoTypes([...cargoTypes, newCargo]);
        setFormCargo({ name: "", description: "" }); // limpiar campos
        alert("Funciona cargo type ahorita lo cambio por una noti chila")
    } catch (error) {
        console.error("Error creating cargo type:", error);
        alert("There was an error registering the cargo type.");
    }
    };

    useEffect(() => {
        const fetchCargoTypes = async () => {
        try {
            const data = await getCargoTypes();
            setCargoTypes(data);
        } catch (error) {
            console.error("Error fetching cargo types:", error);
        }
        };

        fetchCargoTypes();
    }, []);

    useEffect(() => {
        const fetchSensors = async () => {
        try {
            const data = await getSensorsActive();
            setSensors(data);
        } catch (error) {
            console.error("Error fetching cargo types:", error);
        }
        };

        fetchSensors();
    }, []);


    useEffect(() => {
        const fetchBoxes = async () => {
        try {
            const data = await getBoxs(); // ✅ Llamada correcta
            setBoxes(data);
        } catch (error) {
            console.error("Error fetching boxes:", error);
        }
        };

        fetchBoxes();
    }, []);

    const handleRegisterBox = async () => {
    if(!user) {
        return
    }

    if (
        !formBox.status ||
        !formBox.length ||
        !formBox.width ||
        !formBox.height ||
        !formBox.maxWeigth
    ) {
    alert("Please fill in all required fields.");
        return;
    }
    try {
        const newBox = {
            status: formBox.status as "Available" | "On Trip" | "Under Maintenance" | "Inactive",
            length: Number(formBox.length),
            width: Number(formBox.width),
            height: Number(formBox.height),
            maxWeigth: Number(formBox.maxWeigth),
            IDAdmin: Number(user.id),
            };

            const savedBox = await createBox(newBox);
            setBoxes([...boxes, savedBox]);

            // Limpiar formulario
            setFormBox({
            status: "",
            length: "",
            width: "",
            height: "",
            maxWeigth: "",
            IDAdmin: "",
            });

            alert("Funciona box ahorita lo cambio por una noti chila")
        } catch (error) {
            console.error("Error registering box:", error);
        }
    };

    
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-xl">
                                        <Box className="h-6 w-6 text-white" />
                                    </div>
                                    <h1 className="text-4xl font-bold text-slate-900">Box Management</h1>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="text-sm">Total Boxs:</span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                        {boxes.length}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">Add New Box</h2>
                        <p className="text-blue-100 mt-1">Register New Boxes in the System.</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Status Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Box className="h-4 w-4 text-slate-500" />
                                        Status
                                    <span className="text-red-500">*</span>
                                </label>
                                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                                    value={formBox.status}
                                    onChange={(e) =>
                                        setFormBox({ ...formBox, status: e.target.value })
                                    }
                                    >
                                    <option value="Available">Available</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            {/* Length Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <PencilRuler className="h-4 w-4 text-slate-500" />
                                        Length
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="Type the length in meters"
                                    type="number"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                                    value={formBox.length}
                                    onChange={(e) =>
                                        setFormBox({ ...formBox, length: e.target.value })
                                    }
                                />
                            </div>
                            {/* Width Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <PencilRuler className="h-4 w-4 text-slate-500" />
                                        Width
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="Type the width in meters"
                                    type="number"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                                    value={formBox.width}
                                    onChange={(e) =>
                                        setFormBox({ ...formBox, width: e.target.value })
                                    }
                                    />
                            </div>
                            {/* Height Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <PencilRuler className="h-4 w-4 text-slate-500" />
                                        Height
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="Type the height in meters"
                                    type="number"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                                    value={formBox.height}
                                    onChange={(e) =>
                                        setFormBox({ ...formBox, height: e.target.value })
                                    }
                                    />
                            </div>
                            {/* Max Weight Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Weight className="h-4 w-4 text-slate-500" />
                                        Max Weight
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="Type the Max Weight in Kilograms"
                                    type="number"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                                    value={formBox.maxWeigth}
                                    onChange={(e) =>
                                        setFormBox({ ...formBox, maxWeigth: e.target.value })
                                    }
                                />
                            </div>
                            {/* Max Weight Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Microchip className="h-4 w-4 text-slate-500" />
                                        Sensor
                                    <span className="text-red-500">*</span>
                                </label>
                                <select className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                                    value={formSensor_Box.IDSensor}
                                    onChange={(e) =>
                                        setSensor_Box({ ...formSensor_Box, IDSensor: e.target.value })
                                    }
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
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed">
                                <Box></Box>
                                Register New Box
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mb-10 mt-20">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 rounded-xl">
                                        <Box className="h-6 w-6 text-white" />
                                    </div>
                                    <h1 className="text-4xl font-bold text-slate-900">Cargo Type Management</h1>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className="text-sm">Total Types:</span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                        {cargoTypes.length}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mb-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                        <h2 className="text-2xl font-bold text-white">Add New Cargo Type</h2>
                        <p className="text-blue-100 mt-1">Register New Cargo Types in the System.</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {/* Driver Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Weight className="h-4 w-4 text-slate-500" />
                                        Name
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={formCargo.name}
                                    onChange={(e) =>
                                        setFormCargo({ ...formCargo, name: e.target.value })
                                    }
                                    placeholder="Type the Max Weight in Kilograms"
                                    type="Text"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"/>
                            </div>
                            {/* Driver Selection */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                    <Weight className="h-4 w-4 text-slate-500" />
                                        Description
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    placeholder="Type the Max Weight in Kilograms"
                                    type="Text"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"
                                    value={formCargo.description}
                                    onChange={(e) =>
                                        setFormCargo({ ...formCargo, description: e.target.value })
                                    }
                                    />
                            </div>
                        </div>
                        <div className="pt-4">
                            <button
                                onClick={handleRegister}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                            >
                                <Box />
                                Register New Cargo Type
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BoxManagement