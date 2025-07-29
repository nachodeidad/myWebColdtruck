"use client"

import React, { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { getTrips } from "../../../services/tripService"
import { getAlerts } from "../../../services/alertService"
import type { Trip, Alert as AlertDef } from "../../../types"

interface AlertLog {
  id: number
  type: string
  description: string
  dateTime: string
  temperature?: number
  humidity?: number
  tripId: number
  truckPlates?: string
}

const AlertManagement: React.FC = () => {
  const [logs, setLogs] = useState<AlertLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trips, alertDefs] = await Promise.all([getTrips(), getAlerts()])
        const defsMap = new Map(alertDefs.map((d) => [d._id, d]))
        const aggregated: AlertLog[] = []
        trips.forEach((trip) => {
          trip.alerts?.forEach((alert) => {
            const def = defsMap.get(alert.IDAlert)
            if (def) {
              aggregated.push({
                id: aggregated.length + 1,
                type: def.type,
                description: def.description,
                dateTime: alert.dateTime,
                temperature: alert.temperature,
                humidity: alert.humidity,
                tripId: trip._id,
                truckPlates:
                  typeof trip.IDTruck === "object" &&
                  trip.IDTruck !== null &&
                  "plates" in (trip.IDTruck as any)
                    ? (trip.IDTruck as any).plates
                    : undefined,
              })
            }
          })
        })
        setLogs(aggregated)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-10 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">System Alerts</h1>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading alerts...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts generated</h3>
            <p className="mt-1 text-sm text-gray-500">Alerts will appear here when trips report incidents.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-slate-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Trip</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Truck</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Temp (&deg;C)</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Humidity (%)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.dateTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.tripId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.truckPlates || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.temperature !== undefined ? log.temperature : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.humidity !== undefined ? log.humidity : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertManagement
