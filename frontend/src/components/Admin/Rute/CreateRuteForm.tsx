import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import {
  AlertCircle,
  Droplets,
  Loader2,
  Map as MapIcon,
  MapPin,
  RotateCcw,
  RouteIcon,
  Save,
  Search,
  Thermometer,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { useAuth } from "../../../contexts/AuthContext";
import { createRute } from "../../../services/ruteService";
import type { Rute } from "../../../types/Rute";

type LocationPickerProps = {
  onPick: (coords: [number, number]) => void;
};

// Icono para los marcadores del mapa
const pinIcon = new L.Icon({
  iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Icono diferente para el marcador temporal
const tempPinIcon = new L.Icon({
  iconUrl: "https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Props {
  onCreated: (rute: Rute) => void;
}

const provider = new OpenStreetMapProvider();

function LocationPicker({ onPick }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lng, e.latlng.lat]);
    },
  });
  return null;
}

export const CreateRuteForm: React.FC<Props> = ({ onCreated }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    maxTemp: "",
    minTemp: "",
    maxHum: "",
    minHum: "",
  });

  // Estado de búsquedas de lugares
  const [originQuery, setOriginQuery] = useState("");
  const [originResults, setOriginResults] = useState<any[]>([]);
  const [origin, setOrigin] = useState<{ coords: [number, number], address: string } | null>(null);

  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinationResults, setDestinationResults] = useState<any[]>([]);
  const [destination, setDestination] = useState<{ coords: [number, number], address: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado para selección en mapa - SEPARADO para no interferir
  const [tempSelection, setTempSelection] = useState<{ coords: [number, number] } | null>(null);
  const [selecting, setSelecting] = useState<"origin" | "destination" | null>(null);

  // Busca lugares para origen/destino
  const handleOriginSearch = async () => {
    const results = await provider.search({ query: originQuery });
    setOriginResults(results);
  };
  const handleDestinationSearch = async () => {
    const results = await provider.search({ query: destinationQuery });
    setDestinationResults(results);
  };

  // Selecciona resultado búsqueda
  const selectOrigin = (result: any) => {
    setOrigin({
      coords: [parseFloat(result.x), parseFloat(result.y)],
      address: result.label,
    });
    setOriginQuery(result.label);
    setOriginResults([]);
  };

  const selectDestination = (result: any) => {
    setDestination({
      coords: [parseFloat(result.x), parseFloat(result.y)],
      address: result.label,
    });
    setDestinationQuery(result.label);
    setDestinationResults([]);
  };

  const clearPoints = () => {
    setOrigin(null);
    setOriginQuery("");
    setOriginResults([]);
    setDestination(null);
    setDestinationQuery("");
    setDestinationResults([]);
    setTempSelection(null);
    setSelecting(null);
  };

  // Función para confirmar la selección temporal
  const confirmTempSelection = () => {
    if (!tempSelection) return;

    const addressText = `Point: ${tempSelection.coords[1].toFixed(5)}, ${tempSelection.coords[0].toFixed(5)}`;

    if (selecting === "origin") {
      setOrigin({
        coords: tempSelection.coords,
        address: addressText,
      });
      setOriginQuery(addressText);
    } else if (selecting === "destination") {
      setDestination({
        coords: tempSelection.coords,
        address: addressText,
      });
      setDestinationQuery(addressText);
    }

    // Limpiar estado temporal
    setTempSelection(null);
    setSelecting(null);
  };

  // Función para cancelar selección temporal
  const cancelTempSelection = () => {
    setTempSelection(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (
      !user ||
      !form.name ||
      !form.maxTemp ||
      !form.minTemp ||
      !form.maxHum ||
      !form.minHum ||
      !origin ||
      !destination
    ) {
      // setError("Please complete all fields and select origin and destination");
      toast.error("Please complete all fields and select origin and destination");
      return;
    }

    const payload = {
      name: form.name.trim(),
      maxTemp: Number(form.maxTemp),
      minTemp: Number(form.minTemp),
      maxHum: Number(form.maxHum),
      minHum: Number(form.minHum),
      origin: {
        type: "Point" as const,
        coordinates: origin.coords,
      },
      destination: {
        type: "Point" as const,
        coordinates: destination.coords,
      },
      IDAdmin: Number(user.id),
    };

    try {
      setLoading(true);
      const rute = await createRute(payload);
      onCreated(rute);
      setForm({
        name: "",
        maxTemp: "",
        minTemp: "",
        maxHum: "",
        minHum: "",
      });
      clearPoints();
      toast.success("Rute added successfully!")
      setError("");
    } catch (err) {
      console.error(err);
      setError("Error creating route. Please try again.");
      toast.error("Error creating route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----------- UI ---------------------
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 flex gap-5">
        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
          <RouteIcon className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Add New Route</h2>
          <p className="text-green-100 mt-1">
            Define route parameters and select addresses (OpenStreetMap or Interactive Map)
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* Route Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">
              Route Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Route Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter route name"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Thermometer className="h-4 w-4 text-slate-500" />
                  Max Temperature (°C) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxTemp"
                  value={form.maxTemp}
                  onChange={handleChange}
                  placeholder="e.g., 35"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Thermometer className="h-4 w-4 text-slate-500" />
                  Min Temperature (°C) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="minTemp"
                  value={form.minTemp}
                  onChange={handleChange}
                  placeholder="e.g., 10"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Droplets className="h-4 w-4 text-slate-500" />
                  Max Humidity (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="maxHum"
                  value={form.maxHum}
                  onChange={handleChange}
                  placeholder="e.g., 80"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Droplets className="h-4 w-4 text-slate-500" />
                  Min Humidity (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="minHum"
                  value={form.minHum}
                  onChange={handleChange}
                  placeholder="e.g., 30"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Address Search Section */}
          <div className="bg-slate-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-slate-900 mb-4">
              Route Points
            </h4>

            {/* BOTONES para seleccionar en mapa */}
            <div className="flex flex-wrap gap-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setSelecting("origin");
                  setTempSelection(null);
                }}
                className={`inline-flex items-center px-3 py-2 rounded-lg gap-2 transition-colors ${
                  selecting === "origin" 
                    ? "bg-indigo-700 text-white" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
                disabled={loading}
              >
                <MapIcon className="h-4 w-4" />
                {selecting === "origin" ? "Seleccionando origen..." : "Seleccionar origen en mapa"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelecting("destination");
                  setTempSelection(null);
                }}
                className={`inline-flex items-center px-3 py-2 rounded-lg gap-2 transition-colors ${
                  selecting === "destination" 
                    ? "bg-indigo-700 text-white" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
                disabled={loading}
              >
                <MapIcon className="h-4 w-4" />
                {selecting === "destination" ? "Seleccionando destino..." : "Seleccionar destino en mapa"}
              </button>
            </div>

            {/* MODO MAPA */}
            {selecting && (
              <div className="mb-6">
                <div className="mb-2 text-slate-800 font-medium bg-blue-50 p-3 rounded-lg border border-blue-200">
                  📍 Haz clic en el mapa para seleccionar {selecting === "origin" ? "el origen" : "el destino"}
                  {tempSelection && (
                    <div className="mt-2 text-blue-700">
                      ✓ Punto seleccionado: {tempSelection.coords[1].toFixed(5)}, {tempSelection.coords[0].toFixed(5)}
                    </div>
                  )}
                </div>
                
                <MapContainer
                  center={
                    // Si hay una coordenada previa, centra ahí, si no, el centro default
                    selecting === "origin" && origin
                      ? [origin.coords[1], origin.coords[0]]
                      : selecting === "destination" && destination
                      ? [destination.coords[1], destination.coords[0]]
                      : [32.51, -117.02]
                  }
                  zoom={12}
                  style={{ height: 350, width: "100%" }}
                  className="rounded-xl border shadow"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    onPick={(coords) => setTempSelection({ coords })}
                  />

                  {/* Marcador temporal - AZUL */}
                  {tempSelection && (
                    <Marker 
                      position={[tempSelection.coords[1], tempSelection.coords[0]]} 
                      icon={tempPinIcon}
                    >
                      <Popup>
                        <div className="text-center">
                          <div className="font-semibold mb-2">¿Usar este punto?</div>
                          <div className="text-sm text-gray-600 mb-3">
                            {tempSelection.coords[1].toFixed(5)}, {tempSelection.coords[0].toFixed(5)}
                          </div>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={confirmTempSelection}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                            >
                              ✓ Confirmar
                            </button>
                            <button
                              onClick={cancelTempSelection}
                              className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                            >
                              ✗ Cancelar
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Marcadores confirmados - ROJOS */}
                  {origin && (
                    <Marker position={[origin.coords[1], origin.coords[0]]} icon={pinIcon}>
                      <Popup>
                        <div>
                          <div className="font-semibold text-green-700">🚀 Origen</div>
                          <div className="text-sm">{origin.address}</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {destination && (
                    <Marker position={[destination.coords[1], destination.coords[0]]} icon={pinIcon}>
                      <Popup>
                        <div>
                          <div className="font-semibold text-red-700">🎯 Destino</div>
                          <div className="text-sm">{destination.address}</div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
                
                <div className="mt-3 flex gap-2">
                  {tempSelection && (
                    <button
                      type="button"
                      onClick={confirmTempSelection}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✓ Confirmar selección
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelecting(null);
                      setTempSelection(null);
                    }}
                    className="px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg transition-colors"
                  >
                    Cancelar selección
                  </button>
                </div>
              </div>
            )}

            {/* Selección por texto/búsqueda */}
            <div className="space-y-4">
              {/* Origin search */}
              <div className="mb-3">
                <label className="block font-medium mb-1">
                  Origin (search for place/address):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={originQuery}
                    onChange={(e) => setOriginQuery(e.target.value)}
                    placeholder="Type address or place..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleOriginSearch}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </button>
                </div>
                {originResults.length > 0 && (
                  <ul className="mt-2 bg-white border rounded-lg shadow max-h-48 overflow-auto">
                    {originResults.map((r) => (
                      <li
                        key={r.x + r.y}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                        onClick={() => selectOrigin(r)}
                      >
                        {r.label}
                      </li>
                    ))}
                  </ul>
                )}
                {origin && (
                  <div className="mt-2 p-3 bg-blue-200 border border-blue-300 rounded-lg">
                    <div className="text-blue-700 text-sm">
                      <b>🚀 Origen seleccionado:</b> {origin.address}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Destination search */}
              <div>
                <label className="block font-medium mb-1">
                  Destination (search for place/address):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={destinationQuery}
                    onChange={(e) => setDestinationQuery(e.target.value)}
                    placeholder="Type address or place..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={handleDestinationSearch}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </button>
                </div>
                {destinationResults.length > 0 && (
                  <ul className="mt-2 bg-white border rounded-lg shadow max-h-48 overflow-auto">
                    {destinationResults.map((r) => (
                      <li
                        key={r.x + r.y}
                        className="px-4 py-2 cursor-pointer hover:bg-blue-50"
                        onClick={() => selectDestination(r)}
                      >
                        {r.label}
                      </li>
                    ))}
                  </ul>
                )}
                {destination && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-red-700 text-sm">
                      <b>🎯 Destino seleccionado:</b> {destination.address}
                    </div>
                  </div>
                )}
              </div>
              
              {(origin || destination) && (
                <button
                  type="button"
                  onClick={clearPoints}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors mt-2"
                  disabled={loading}
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear All Points
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Route...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Create Route
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRuteForm;