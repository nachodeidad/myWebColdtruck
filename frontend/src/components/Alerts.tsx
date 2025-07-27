"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Truck } from "lucide-react";
import { getAlertsByTruck } from "../services/alertService";
import type { Trip, AlertInfo, Truck as TruckType } from "../types";

interface AlertsByTruck {
  truck: TruckType;
  alerts: AlertInfo[];
}

const Alerts: React.FC = () => {
  const [data, setData] = useState<AlertsByTruck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const alerts = await getAlertsByTruck();
        setData(alerts);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">System Alerts</h2>
        {loading ? (
          <p>Loading...</p>
        ) : data.length === 0 ? (
          <p>No alerts</p>
        ) : (
          <div className="space-y-8">
            {data.map((item) => (
              <div key={(item.truck as any)._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-200">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-lg">Truck {(item.truck as any).plates || (item.truck as any)._id}</h3>
                </div>
                <ul className="divide-y divide-gray-100">
                  {item.alerts.map((a) => (
                    <li key={a.IDAlert} className="px-6 py-4 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-gray-800">
                        {new Date(a.dateTime).toLocaleString()} - {a.temperature}°C / {a.humidity}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
