import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import reportsService from "../../services/reports.service";

const VehicleReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      try {
        const res = await reportsService.getVehicleReport(id);
        if (isMounted) {
          setReport(res.data.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Unable to load vehicle report.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const renderField = (key, value) => (
    <div key={key} className="grid grid-cols-[180px_1fr] gap-3 py-2 border-b border-slate-100">
      <div className="text-sm font-semibold text-slate-600">{key}</div>
      <div className="text-sm text-slate-800">{JSON.stringify(value)}</div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Report</h1>
          <p className="mt-2 text-sm text-slate-500">Report details for vehicle ID {id}.</p>
        </div>
        <Link
          to="/reports"
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Back to Reports
        </Link>
      </div>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading report...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
      )}

      {!loading && !error && report && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {Object.entries(report).map(([key, value]) => renderField(key, value))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleReport;
