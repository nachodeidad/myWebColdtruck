import { Box, EditIcon, Microchip, PencilRuler, Weight } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "../../../contexts/AuthContext"
import { createBox, getBoxs } from "../../../services/boxService"
import { createCargoType, getCargoTypes } from "../../../services/cargoTypeService"
import { createSensor_Box } from "../../../services/sensor_boxService"
import { createSensor, getSensors, getSensorsActive } from "../../../services/sensorService"
import { Box as BoxType } from "../../../types/Box"
import { CargoType } from "../../../types/CargoType"
import { Sensor } from "../../../types/Sensor"

const BoxManagement = () => {
    const [cargoTypes, setCargoTypes] = useState<CargoType[]>([])
    const [boxes, setBoxes] = useState<BoxType[]>([])
    const [sensors, setSensors] = useState<Sensor[]>([])
    const [sensorsN, setSensorsN] = useState<Sensor[]>([])
    const [formCargo, setFormCargo] = useState({
        name: "",
        description: "",
    })

    const [formSensor, setFormSensor] = useState({
        _id: "",
        type: "Temp&Hum",
        status: "Active",
    });

    const fetchSensorsN = async () => {
        try {
            const sensorData = await getSensors();

            // Ordenar por fecha de creación descendente (asumiendo que tienes un campo como createdAt)
            const sortedSensors = sensorData
            .filter((s): s is Sensor & { createdAt: string } => !!s.createdAt)
            .sort(
                (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );


            setSensorsN(sortedSensors);
        } catch (error) {
            console.error("Error fetching sensors:", error);
        }
    };



    const handleRegisterSensor = async () => {
    if (!formSensor._id || !formSensor.type || !formSensor.status) {
        alert("Please enter sensor ID and type.");
        return;
    }

    try {
        const newSensor = {
            _id: formSensor._id,
            type: formSensor.type as Sensor["type"],
            status: formSensor.status as Sensor["status"],
        };

        const savedSensor = await createSensor(newSensor);

        setFormSensor({ _id: "", type: "Temp&Hum", status: "Active" });

        await fetchSensorsN();

        alert("Sensor registered successfully.");
    } catch (error) {
        console.error("Error registering sensor:", error);
        alert("An error occurred while registering the sensor.");
    }
    };


    const [formBox, setFormBox] = useState({
        status: "",
        length: "",
        width: "",
        height: "",
        maxWeigth: "",
        IDAdmin: "",
    })

    const [formSensor_Box, setFormSensor_Box] = useState({
        IDSensor: "",
        IDBox: "",
    })

const handleSensor_Box = async (boxId: string | number) => {
    if (!formSensor_Box.IDSensor) {
        alert("Please select a sensor to link with this box.");
        return;
    }

    try {
        const newSensorBox = {
            IDSensor: formSensor_Box.IDSensor,
            IDBox: Number(boxId),
        };

        const newLink = await createSensor_Box(newSensorBox);
        setFormSensor_Box({ IDSensor: "", IDBox: "" });

        alert("Sensor vinculado correctamente");
    } catch (error) {
        console.error("Error linking sensor to box:", error);
        alert("Error al vincular el sensor.");
    }
};

    const { user } = useAuth()

    const fetchCargoTypes = async () => {
        try {
            const cargoData = await getCargoTypes();
            setCargoTypes(cargoData);
        } catch (error) {
            console.error("Error fetching cargo types:", error);
        }
    };

const fetchBox = async () => {
    try {
        const boxData = await getBoxs();
        console.log("boxData", boxData);
        const sortedBoxes = boxData.sort((a, b) => b._id - a._id);
        setBoxes(sortedBoxes);
    } catch (error) {
        console.error("Error fetching boxes:", error);
    }
};


    useEffect(() => {
        fetchSensorsN();
    }, []);


const handleRegister = async () => {
    if (!formCargo.name || !formCargo.description) {
        alert("Please fill in all required fields");
        return;
    }

    try {
        const newCargo = await createCargoType(formCargo);
        setCargoTypes([...cargoTypes, newCargo]);
        setFormCargo({ name: "", description: "" });
        await fetchCargoTypes();
        await fetchBox();
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
            const data = await getBoxs();
            setBoxes(data);
        } catch (error) {
            console.error("Error fetching boxes:", error);
        }
        };
        
        fetchBoxes();
    }, []);

const handleRegisterBox = async () => {
    if (!user) return;

    if (
        !formBox.status ||
        !formBox.length ||
        !formBox.width ||
        !formBox.height ||
        !formBox.maxWeigth ||
        !formSensor_Box.IDSensor
    ) {
        alert("Please fill in all required fields including the sensor.");
        return;
    }

    try {
        const newBox = {
        status: formBox.status as
            | "Available"
            | "On Trip"
            | "Under Maintenance"
            | "Inactive",
        length: Number(formBox.length),
        width: Number(formBox.width),
        height: Number(formBox.height),
        maxWeigth: Number(formBox.maxWeigth),
        IDAdmin: Number(user.id),
        };

        const savedBox = await createBox(newBox);

        setBoxes([...boxes, savedBox]);

        await handleSensor_Box(savedBox._id);

        setFormBox({
        status: "",
        length: "",
        width: "",
        height: "",
        maxWeigth: "",
        IDAdmin: "",
        });

        setFormSensor_Box({
        IDSensor: "",
        IDBox: "",
        });

        alert("Box registrada y sensor vinculado correctamente.");
    } catch (error) {
        console.error("Error registering box or linking sensor:", error);
        alert("Ocurrió un error al registrar la caja o vincular el sensor.");
    }
};

    const statusStyles = {
        Available:        'bg-green-100  text-green-800',
        'On Trip':        'bg-blue-100   text-blue-800',
        'Under Maintenance': 'bg-yellow-100 text-yellow-800',
        Inactive:         'bg-red-100   text-red-800',
    };
    
    const statusSensorStyles = {
        Active:        'bg-green-100  text-green-800',
        'Out of Service':        'bg-blue-100   text-blue-800',
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div>
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
                                        <option value="">Select status</option>
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
                                            setFormSensor_Box({ ...formSensor_Box, IDSensor: e.target.value })
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
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-900">
                            Boxs List

                            </h3>
                            <p className="text-slate-600 text-sm mt-1">Manage and monitor Boxs</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        m3
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Max Weight
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                {boxes.map((box) => (
                                    <tr key={box._id} className="hover:bg-slate-50 transition-colors duration-150">
                                    
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium  ${
                                            statusStyles[box.status] || statusStyles.Inactive
                                        }`}>
                                        {box.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-sm text-slate-700">
                                        {((box.length * box.width * box.height)).toFixed(2)} m³
                                        </div>
                                    </td>

                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-sm text-slate-700">
                                        {box.maxWeigth} kg
                                        </div>
                                    </td>

                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <button
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150 hover:shadow-md"
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
                </div>
                <div>
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
                                {/* Name Cargo Type */}
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
                                {/* Description Cargo Type */}
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
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-900">
                            Cargo Type List

                            </h3>
                            <p className="text-slate-600 text-sm mt-1">Manage and monitor Cargo Type</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                {cargoTypes.map((cargo) => (
                                    <tr key={cargo._id} className="hover:bg-slate-50 transition-colors duration-150">
                                    
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-slate-900">
                                        {cargo.name}
                                        </span>
                                    </td>

                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <div className="text-sm text-slate-700">
                                        {cargo.description}
                                        </div>
                                    </td>

                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <button
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150 hover:shadow-md"
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
                </div>
                <div>
                    <div className="mb-10 mt-20">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-600 rounded-xl">
                                            <Box className="h-6 w-6 text-white" />
                                        </div>
                                        <h1 className="text-4xl font-bold text-slate-900">Sensor Management</h1>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <span className="text-sm">Total Sensor:</span>
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                            {sensors.length}
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
                            <h2 className="text-2xl font-bold text-white">Add New Sensor</h2>
                            <p className="text-blue-100 mt-1">Register New Sensor in the System.</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {/* ID SENSOR */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                        <Microchip className="h-4 w-4 text-slate-500" />
                                            ID
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={formSensor._id}
                                        onChange={(e) =>
                                            setFormSensor({ ...formSensor, _id: e.target.value })
                                        }
                                        placeholder="Type the ID of Sensor"
                                        type="Text"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400 appearance-none"/>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={handleRegisterSensor}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
                                >
                                    <Box />
                                    Register New Sensor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-900">
                            Sensor List

                            </h3>
                            <p className="text-slate-600 text-sm mt-1">Manage and monitor Sensor</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-8 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
{sensorsN.map((sensorN) => (
    <tr key={sensorN._id} className="hover:bg-slate-50 transition-colors duration-150">
        <td className="px-8 py-6 whitespace-nowrap">
            <span className="text-sm font-semibold text-slate-900">
                {sensorN._id}
            </span>
        </td>

        <td className="px-8 py-6 whitespace-nowrap">
            <span className="text-sm font-semibold text-slate-900">
                {sensorN.type}
            </span>
        </td>

        <td className="px-8 py-6 whitespace-nowrap">
            <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    statusSensorStyles[sensorN.status]
                }`}
            >
                {sensorN.status}
            </div>
        </td>

        <td className="px-8 py-6 whitespace-nowrap">
            <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150 hover:shadow-md"
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
            </div>
        </div>
    )
}

export default BoxManagement