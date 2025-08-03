"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { getTrips } from "../services/tripService"
import { getRuteGeometry } from "../services/ruteService"
import MapView from "./Map/MapView"
import type { Trip } from "../types"

const MyTrips: React.FC = () => {
  const { user } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [path, setPath] = useState<[number, number][]>([])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const data = await getTrips()
        const myTrips = data.filter((t) =>
          typeof t.IDDriver === "object"
            ? t.IDDriver.id === user.id
            : t.IDDriver === Number(user.id),
        )
        setTrips(myTrips)
        if (myTrips.length) {
          setSelectedTrip(myTrips[0])
          const rId = typeof myTrips[0].IDRute === 'object' ? myTrips[0].IDRute._id : myTrips[0].IDRute
          getRuteGeometry(Number(rId)).then(setPath).catch(() => setPath([]))
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  if (!user) return null

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mis Rutas Programadas</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto space-y-4">
          {trips.length > 1 && (
            <select
              className="border rounded p-2"
              value={selectedTrip?._id ?? ""}
              onChange={(e) => {
                const t = trips.find((tr) => tr._id === Number(e.target.value)) || null
                setSelectedTrip(t)
                if (t) {
                  const rId = typeof t.IDRute === 'object' ? t.IDRute._id : t.IDRute
                  getRuteGeometry(Number(rId)).then(setPath).catch(() => setPath([]))
                } else {
                  setPath([])
                }
              }}
            >
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {typeof t.IDRute === 'object' ? t.IDRute.name : t.IDRute}
                </option>
              ))}
            </select>
          )}
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Ruta
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Salida
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {trips.map((trip) => (
                <tr key={trip._id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm text-slate-800">
                    {typeof trip.IDRute === "object" ? trip.IDRute.name : trip.IDRute}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-800">
                    {new Date(trip.scheduledDepartureDate).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-800">{trip.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedTrip && path.length > 1 && (
            <MapView
              origin={path[0]}
              destination={path[path.length - 1]}
              path={path}
            />
          )}
        </div>
      )}
    </div>
  )
}

export default MyTrips
