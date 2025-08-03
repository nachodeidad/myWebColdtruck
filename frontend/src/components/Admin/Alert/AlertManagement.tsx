import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Clock, Droplets, Filter, Route, Search, Thermometer, TrendingDown, TrendingUp, Truck } from 'lucide-react'
import React, { useEffect, useState } from "react"
import { getAlerts } from "../../../services/alertService"
import { getTrips } from "../../../services/tripService"

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
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

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
              // Determine severity based on type and values

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
                    : undefined
              })
            }
          })
        })

        // Sort by most recent date
        aggregated.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
        setLogs(aggregated)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getAlertConfig = (type: string) => {
    const lowerType = type.toLowerCase()

    if (lowerType.includes('low') && lowerType.includes('temperature')) {
      return {
        icon: <TrendingDown className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        title: 'Low Temperature',
        category: 'temperature'
      }
    }
    if (lowerType.includes('high') && lowerType.includes('temperature')) {
      return {
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-200',
        borderColor: 'border-blue-200',
        title: 'High Temperature',
        category: 'temperature'
      }
    }
    if (lowerType.includes('low') && lowerType.includes('humidity')) {
      return {
        icon: <Droplets className="w-6 h-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: 'Low Humidity',
        category: 'humidity'
      }
    }
    if (lowerType.includes('high') && lowerType.includes('humidity')) {
      return {
        icon: <Droplets className="w-6 h-6" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-200',
        borderColor: 'border-orange-200',
        title: 'High Humidity',
        category: 'humidity'
      }
    }

    return {
      icon: <AlertTriangle className="w-6 h-6" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      title: 'General Alert',
      category: 'general'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredLogs = logs.filter(log => {
    const alertConfig = getAlertConfig(log.type)
    const typeMatch = selectedFilter === 'all' || alertConfig.category === selectedFilter
    const searchMatch = searchTerm === '' ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.truckPlates?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.tripId.toString().includes(searchTerm)

    return typeMatch && searchMatch
  })

  const alertCounts = {
    total: logs.length,
    temperature: logs.filter(l => getAlertConfig(l.type).category === 'temperature').length,
    humidity: logs.filter(l => getAlertConfig(l.type).category === 'humidity').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Alert Center</h1>
              <p className="text-slate-600 mt-1">System alert monitoring and management</p>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{alertCounts.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Thermometer className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Temperature</p>
                  <p className="text-2xl font-bold text-gray-900">{alertCounts.temperature}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Droplets className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Humidity</p>
                  <p className="text-2xl font-bold text-gray-900">{alertCounts.humidity}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>

              <div className="flex flex-col md:flex-row gap-3 flex-1">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All types</option>
                  <option value="temperature">Temperature</option>
                  <option value="humidity">Humidity</option>
                  <option value="general">General</option>
                </select>

                <div className="relative w-full md:flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by description, plate or trip..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading alerts...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {logs.length === 0 ? 'No alerts generated' : 'No alerts found'}
            </h3>
            <p className="text-gray-500">
              {logs.length === 0
                ? 'Alerts will appear here when trips report incidents.'
                : 'Try adjusting the filters to see more results.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredLogs.map((log) => {
              const alertConfig = getAlertConfig(log.type)

              return (
                <div
                  key={log.id}
                  className={`bg-white rounded-2xl shadow-sm border-2 hover:shadow-lg transition-all duration-300 overflow-hidden`}
                >
                  {/* Card Header */}
                  <div className={`${alertConfig.bgColor} px-6 py-4 border-b border-gray-200`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-white rounded-lg ${alertConfig.color}`}>
                          {alertConfig.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">
                            {alertConfig.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDate(log.dateTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {log.description}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {log.temperature !== undefined && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Thermometer className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Temperature</span>
                          </div>
                          <p className="text-lg font-bold text-blue-700">{log.temperature}°C</p>
                        </div>
                      )}

                      {log.humidity !== undefined && (
                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Droplets className="w-4 h-4 text-orange-600" />
                            <span className="text-xs font-medium text-orange-600">Humidity</span>
                          </div>
                          <p className="text-lg font-bold text-orange-700">{log.humidity}%</p>
                        </div>
                      )}
                    </div>

                    {/* Trip and Truck Info */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Route className="w-4 h-4" />
                        <span>Trip #{log.tripId}</span>
                      </div>

                      {log.truckPlates && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Truck className="w-4 h-4" />
                          <span>Truck {log.truckPlates}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(log.dateTime).toLocaleString('en-US')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AlertManagement