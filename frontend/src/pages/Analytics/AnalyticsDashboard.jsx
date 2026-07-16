import { useEffect, useState } from "react";
import analyticsService from "../../services/analytics.service";

const metricCards = [
  { key: "costPerKm", label: "Cost / km", unit: "₹" },
  { key: "fuelEfficiency", label: "Fuel Efficiency", unit: "km/l" },
  { key: "vehicleUtilization", label: "Vehicle Utilization", unit: "%" },
  { key: "driverPerformance", label: "Driver Performance", unit: "%" },
  { key: "roi", label: "ROI", unit: "%" },
];

const getMetricValue = (summary, key) => {
  if (!summary) return "-";
  return summary[key] ?? "-";
};

const AnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const [costRes, fuelRes, utilizationRes, driverRes, roiRes] = await Promise.all([
          analyticsService.getCostPerKm(),
          analyticsService.getFuelEfficiency(),
          analyticsService.getVehicleUtilization(),
          analyticsService.getDriverPerformance(),
          analyticsService.getRoi(),
        ]);

        if (isMounted) {
          setSummary({
            costPerKm: costRes.data.data,
            fuelEfficiency: fuelRes.data.data,
            vehicleUtilization: utilizationRes.data.data,
            driverPerformance: driverRes.data.data,
            roi: roiRes.data.data,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="mt-2 text-sm text-slate-500">
            Overview of fleet performance and efficiency metrics.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <div
            key={card.key}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">
              {loading ? "..." : getMetricValue(summary, card.key)} {card.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
