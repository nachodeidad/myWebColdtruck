import { Dialog } from "@headlessui/react";
import { Calendar, ChevronDown, Loader2, MapPin, Route, Search, Truck, User, X } from "lucide-react";
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
        alert("Arrival date cannot be before the departure date.");
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
          borderRadius: "8px",
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
      toast.success("Trip added successfully!");
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
    } catch (err) {
      console.error(err);
      toast.error("Error adding trip!");
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
          className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent hover:border-slate-400 cursor-pointer flex items-center justify-between"
          onClick={() => onToggle(!show)}
        >
          <div className="flex items-center gap-2 flex-1">
            <Icon className="h-4 w-4 text-slate-500" />
            <span className={`${displayValue ? "text-slate-900" : "text-slate-500"}`}>
              {displayValue || placeholder}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${show ? "rotate-180" : ""}`} />
        </div>

        {show && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-hidden">
            <div className="p-3 border-b border-slate-100">
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
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredData.length === 0 ? (
                <div className="px-4 py-3 text-slate-500 text-sm">No results found</div>
              ) : (
                filteredData.map(item => {
                  const display = typeof displayField === "function" ? displayField(item) : item[displayField];
                  const id = String(item[idField]);
                  return (
                    <div
                      key={id}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-b-0"
                      onMouseDown={e => {
                        e.preventDefault();
                        onSelect(id);
                        onToggle(false);
                        onSearchChange("");
                      }}
                    >
                      <div className="text-sm font-medium text-slate-900">{display}</div>
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
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-xl w-full max-w-5xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white flex items-center justify-between">
            <h2 className="text-2xl font-bold">Assign New Trip</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Driver Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
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
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
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
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
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

              {/* Box Selection */}
              <div className="space-y-2 lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  Box <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  data={boxs}
                  value={form.IDBox}
                  onSelect={value => handleChange({ target: { name: "IDBox", value } } as any)}
                  searchValue={boxSearch}
                  onSearchChange={setBoxSearch}
                  show={showBoxDropdown}
                  onToggle={setShowBoxDropdown}
                  placeholder="Select box"
                  displayField={(box: Box) => {
                    const volume = (box.length * box.width * box.height).toFixed(0);
                    return `#${box._id} − ${volume} m³ − ${box.maxWeigth} Kg`;
                  }}
                  icon={Truck}
                />
              </div>

              {/* Cargo Type Selection */}
              <div className="space-y-2 lg:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
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
                  icon={Truck}
                />
              </div>

              {/* Departure Date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Scheduled Departure <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="scheduledDepartureDate"
                  value={form.scheduledDepartureDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400"
                  disabled={submitting}
                  min={minDateTime}
                />
              </div>

              {/* Arrival Date */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Scheduled Arrival <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="scheduledArrivalDate"
                  value={form.scheduledArrivalDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400"
                  disabled={submitting}
                  min={form.scheduledDepartureDate}
                />
              </div>
            </div>

            {selectedRute && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Route Preview</h3>
                <MapView
                  origin={selectedRute.origin.coordinates}
                  destination={selectedRute.destination.coordinates}
                  path={path}
                />
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Assigning Trip...
                  </>
                ) : (
                  <>
                    <MapPin className="h-5 w-5" />
                    Assign Trip
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

