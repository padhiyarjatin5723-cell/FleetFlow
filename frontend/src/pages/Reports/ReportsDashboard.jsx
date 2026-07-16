import { useEffect, useState } from "react";
import reportsService from "../../services/reports.service";

const reportItems = [
  { key: "monthly", label: "Monthly Overview" },
  { key: "expenses", label: "Expense Summary" },
  { key: "maintenance", label: "Maintenance Summary" },
];

const ReportsDashboard = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      try {
        const [monthlyRes, expenseRes, maintenanceRes] = await Promise.all([
          reportsService.getMonthlyReport(),
          reportsService.getExpenseReport(),
          reportsService.getMaintenanceReport(),
        ]);

        if (isMounted) {
          setReports({
            monthly: monthlyRes.data.data,
            expenses: expenseRes.data.data,
            maintenance: maintenanceRes.data.data,
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

    loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="mt-2 text-sm text-slate-500">
            Fleet summaries and detailed export-ready reports.
          </p>
        </div>
        <button
          type="button"
          onClick={() => reportsService.exportReport()}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Export Report
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {reportItems.map((item) => (
          <div
            key={item.key}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">
              {loading ? "..." : Array.isArray(reports[item.key]) ? reports[item.key].length : "Ready"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsDashboard;
