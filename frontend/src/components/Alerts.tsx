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
            {data.map((item) => {
              const truck = item.truck as any;
              const brand = truck.IDBrand?.name || truck.IDBrand;
              const model = truck.IDModel?.name || truck.IDModel;
              return (
                <div key={truck._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-lg">Truck {truck.plates || truck._id}</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Brand: {brand} | Model: {model} | Status: {truck.status}
                    </p>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {item.alerts.map((a) => (
                      <li key={a.IDAlert} className="px-6 py-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-1" />
                        <div className="text-sm text-gray-800">
                          <div className="font-medium">
                            {a.type} - {new Date(a.dateTime).toLocaleString()}
                          </div>
                          <div className="text-gray-600">{a.description}</div>
                          <div>
                            {a.temperature}°C / {a.humidity}%
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
