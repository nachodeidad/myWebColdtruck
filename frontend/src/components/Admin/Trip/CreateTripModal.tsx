import { Dialog } from "@headlessui/react";
import { Calendar, ChevronDown, Loader2, MapPin, Route, Search, Truck, User, X, Package, Calendar as CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getRuteGeometry } from "../../../services/ruteService";
import { createTrip, type TripInput } from "../../../services/tripService";
import { Box } from "../../../types/Box";
import { CargoType } from "../../../types/CargoType";
import type { Rute, Truck as TruckType, User as UserType } from "../../../types";
import MapView from "../../Map/MapView";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  drivers: UserType[];
  rutes: Rute[];
  trucks: TruckType[];
  cargoTypes: CargoType[];
  boxs: Box[];
  userId: number;
}

const CreateTripModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCreated,
  drivers,
  rutes,
  trucks,
  cargoTypes,
  boxs,
  userId,
}) => {
  const [form, setForm] = useState({
    scheduledDepartureDate: "",
    scheduledArrivalDate: "",
    IDDriver: "",
    IDRute: "",
    IDTruck: "",
    IDCargoType: "",
    IDBox: "",
  });

  const [driverSearch, setDriverSearch] = useState("");
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const [ruteSearch, setRuteSearch] = useState("");
  const [showRuteDropdown, setShowRuteDropdown] = useState(false);
  const [truckSearch, setTruckSearch] = useState("");
  const [showTruckDropdown, setShowTruckDropdown] = useState(false);
  const [boxSearch, setBoxSearch] = useState("");
  const [showBoxDropdown, setShowBoxDropdown] = useState(false);
  const [cargoSearch, setCargoSearch] = useState("");
  const [showCargoDropdown, setShowCargoDropdown] = useState(false);

  const [minDateTime, setMinDateTime] = useState("");
  const [selectedRute, setSelectedRute] = useState<Rute | null>(null);
  const [path, setPath] = useState<[number, number][]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Bloquea el scroll del fondo al abrir el modal
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const now = new Date();
    setMinDateTime(now.toISOString().slice(0, 16));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "IDRute" && value) {
      const r = rutes.find(rt => rt._id === Number(value)) || null;
      setSelectedRute(r);
      if (r) {
        getRuteGeometry(r._id)
          .then(geom => setPath(geom))
          .catch(() => setPath([]));
      } else {
        setPath([]);
      }
    }

    if (name === "scheduledDepartureDate") {
      if (form.scheduledArrivalDate && new Date(form.scheduledArrivalDate) < new Date(value)) {
        setForm(prev => ({
          ...prev,
          scheduledDepartureDate: value,
          scheduledArrivalDate: "",
        }));
        return;
      }
    }

    if (name === "scheduledArrivalDate") {
      if (form.scheduledDepartureDate && new Date(value) < new Date(form.scheduledDepartureDate)) {
        toast.error("Arrival date cannot be before the departure date.");
        return;
      }
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.IDDriver ||
      !form.IDRute ||
      !form.IDTruck ||
      !form.IDCargoType ||
      !form.IDBox ||
      !form.scheduledDepartureDate ||
      !form.scheduledArrivalDate
    ) {
      toast("Please complete all fields", {
        icon: "⚠️",
        style: {
          background: "#facc15",
          color: "#1f2937",
          padding: "16px",
          borderRadius: "12px",
          fontWeight: "500",
        },
      });
      return;
    }

    const payload: TripInput = {
      scheduledDepartureDate: new Date(form.scheduledDepartureDate).toISOString(),
      scheduledArrivalDate: new Date(form.scheduledArrivalDate).toISOString(),
      IDDriver: Number(form.IDDriver),
      IDAdmin: userId,
      IDRute: Number(form.IDRute),
      IDTruck: Number(form.IDTruck),
      IDCargoType: Number(form.IDCargoType),
      IDBox: Number(form.IDBox),
    };

    try {
      setSubmitting(true);
      await createTrip(payload);
      toast.success("Trip assigned successfully!", {
        style: {
          background: "#10b981",
          color: "white",
          padding: "16px",
          borderRadius: "12px",
          fontWeight: "500",
        },
      });
      onCreated();
      onClose();
      setForm({
        scheduledDepartureDate: "",
        scheduledArrivalDate: "",
        IDDriver: "",
        IDRute: "",
        IDTruck: "",
        IDCargoType: "",
        IDBox: "",
      });
      setDriverSearch("");
      setRuteSearch("");
      setTruckSearch("");
      setBoxSearch("");
      setCargoSearch("");
      setSelectedRute(null);
      setPath([]);
    } catch (err) {
      console.error(err);
      toast.error("Error assigning trip. Please try again.", {
        style: {
          background: "#ef4444",
          color: "white",
          padding: "16px",
          borderRadius: "12px",
          fontWeight: "500",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const SearchableSelect = ({
    data,
    value,
    onSelect,
    searchValue,
    onSearchChange,
    show,
    onToggle,
    placeholder,
    displayField,
    idField = "_id",
    icon: Icon,
  }: {
    data: any[];
    value: string;
    onSelect: (value: string) => void;
    searchValue: string;
    onSearchChange: (value: string) => void;
    show: boolean;
    onToggle: (show: boolean) => void;
    placeholder: string;
    displayField: string | ((item: any) => string);
    idField?: string;
    icon: React.ComponentType<any>;
  }) => {
    const filteredData = data.filter(item => {
      const display = typeof displayField === "function" ? displayField(item) : item[displayField];
      return display.toLowerCase().includes(searchValue.toLowerCase());
    });

    const selectedItem = data.find(item => String(item[idField]) === value);
    const displayValue = selectedItem
      ? typeof displayField === "function"
        ? displayField(selectedItem)
        : selectedItem[displayField]
      : "";

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (show && !target.closest(`[data-dropdown-id="${placeholder}"]`)) {
          onToggle(false);
        }
      };

      if (show) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [show, onToggle, placeholder]);

    return (
      <div className="relative" data-dropdown-id={placeholder}>
        <div
          className={`w-full px-4 py-3 border-2 rounded-xl bg-white transition-all duration-300 cursor-pointer flex items-center justify-between group hover:shadow-md ${
            show 
              ? "border-blue-500 ring-4 ring-blue-500/10 shadow-md" 
              : value 
                ? "border-green-300 hover:border-green-400" 
                : "border-slate-200 hover:border-slate-300"
          }`}
          onClick={() => onToggle(!show)}
        >
          <div className="flex items-center gap-3 flex-1">
            <Icon className={`h-5 w-5 transition-colors ${
              show ? "text-blue-500" : value ? "text-green-500" : "text-slate-400"
            }`} />
            <span className={`font-medium transition-colors ${
              displayValue ? "text-slate-900" : "text-slate-500"
            }`}>
              {displayValue || placeholder}
            </span>
          </div>
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-all duration-300 ${
            show ? "rotate-180 text-blue-500" : ""
          }`} />
        </div>

        {show && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-64 overflow-hidden animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={e => {
                    e.stopPropagation();
                    onSearchChange(e.target.value);
                  }}
                  onFocus={e => e.stopPropagation()}
                  onKeyDown={e => e.stopPropagation()}
                  placeholder={`Search ${placeholder.toLowerCase()}...`}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filteredData.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="text-slate-400 text-sm">No results found</div>
                </div>
              ) : (
                filteredData.map(item => {
                  const display = typeof displayField === "function" ? displayField(item) : item[displayField];
                  const id = String(item[idField]);
                  return (
                    <div
                      key={id}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-b border-slate-100/50 last:border-b-0 hover:border-blue-100"
                      onMouseDown={e => {
                        e.preventDefault();
                        onSelect(id);
                        onToggle(false);
                        onSearchChange("");
                      }}
                    >
                      <div className="text-sm font-medium text-slate-900 hover:text-blue-700 transition-colors">
                        {display}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Overlay mejorado */}
<div className="fixed inset-0 bg-black bg-opacity-50 z-40" aria-hidden="true" />
      
      {/* Modal wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-200">
          {/* Header mejorado */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-8 py-6 text-white flex items-center justify-between flex-shrink-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-20"></div>
            <div className="relative flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create New Trip</h2>
                <p className="text-blue-100 text-sm font-medium">Assign resources and schedule delivery</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="relative text-white/80 hover:text-white transition-all duration-200 p-2 hover:bg-white/20 rounded-xl"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Contenido con scroll mejorado */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
            <div className="p-8 space-y-8">
              {/* Sección de recursos */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Resource Assignment</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Driver Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <User className="h-4 w-4 text-slate-500" />
                      Driver <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      data={drivers}
                      value={form.IDDriver}
                      onSelect={value => handleChange({ target: { name: "IDDriver", value } } as any)}
                      searchValue={driverSearch}
                      onSearchChange={setDriverSearch}
                      show={showDriverDropdown}
                      onToggle={setShowDriverDropdown}
                      placeholder="Select driver"
                      displayField={(driver: UserType) => `${driver.name} ${driver.lastName}`}
                      idField="id"
                      icon={User}
                    />
                  </div>

                  {/* Route Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Route className="h-4 w-4 text-slate-500" />
                      Route <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      data={rutes}
                      value={form.IDRute}
                      onSelect={value => handleChange({ target: { name: "IDRute", value } } as any)}
                      searchValue={ruteSearch}
                      onSearchChange={setRuteSearch}
                      show={showRuteDropdown}
                      onToggle={setShowRuteDropdown}
                      placeholder="Select route"
                      displayField="name"
                      icon={Route}
                    />
                  </div>

                  {/* Truck Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Truck className="h-4 w-4 text-slate-500" />
                      Truck <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      data={trucks}
                      value={form.IDTruck}
                      onSelect={value => handleChange({ target: { name: "IDTruck", value } } as any)}
                      searchValue={truckSearch}
                      onSearchChange={setTruckSearch}
                      show={showTruckDropdown}
                      onToggle={setShowTruckDropdown}
                      placeholder="Select truck"
                      displayField="plates"
                      icon={Truck}
                    />
                  </div>
                </div>
              </div>

              {/* Sección de carga */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Cargo Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Box Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Package className="h-4 w-4 text-slate-500" />
                      Container Box <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      data={boxs}
                      value={form.IDBox}
                      onSelect={value => handleChange({ target: { name: "IDBox", value } } as any)}
                      searchValue={boxSearch}
                      onSearchChange={setBoxSearch}
                      show={showBoxDropdown}
                      onToggle={setShowBoxDropdown}
                      placeholder="Select container box"
                      displayField={(box: Box) => {
                        const volume = (box.length * box.width * box.height).toFixed(1);
                        return `Box #${box._id} • ${volume}m³ • ${box.maxWeigth}kg capacity`;
                      }}
                      icon={Package}
                    />
                  </div>

                  {/* Cargo Type Selection */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <Package className="h-4 w-4 text-slate-500" />
                      Cargo Type <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      data={cargoTypes}
                      value={form.IDCargoType}
                      onSelect={value => handleChange({ target: { name: "IDCargoType", value } } as any)}
                      searchValue={cargoSearch}
                      onSearchChange={setCargoSearch}
                      show={showCargoDropdown}
                      onToggle={setShowCargoDropdown}
                      placeholder="Select cargo type"
                      displayField="name"
                      icon={Package}
                    />
                  </div>
                </div>
              </div>

              {/* Sección de fechas */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Schedule</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Departure Date */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarIcon className="h-4 w-4 text-slate-500" />
                      Scheduled Departure <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduledDepartureDate"
                      value={form.scheduledDepartureDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-300"
                      disabled={submitting}
                      min={minDateTime}
                    />
                  </div>

                  {/* Arrival Date */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CalendarIcon className="h-4 w-4 text-slate-500" />
                      Scheduled Arrival <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduledArrivalDate"
                      value={form.scheduledArrivalDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-300"
                      disabled={submitting}
                      min={form.scheduledDepartureDate}
                    />
                  </div>
                </div>
              </div>

              {/* Mapa de ruta */}
              {selectedRute && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Route Preview</h3>
                      <p className="text-sm text-slate-600">Preview of the selected delivery route</p>
                    </div>
                  </div>
                  <div className="h-96 rounded-xl overflow-hidden border-2 border-slate-200 shadow-inner bg-slate-50">
                    <MapView
                      origin={selectedRute.origin.coordinates}
                      destination={selectedRute.destination.coordinates}
                      path={path}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer mejorado */}
          <div className="px-8 py-6 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                <span className="text-red-500">*</span> Required fields
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none disabled:cursor-not-allowed min-w-[200px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Trip...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5" />
                    Create Trip
                  </>
                )}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CreateTripModal;