import { useEffect, useState } from "react";
import dashboardService from "../../services/dashboard.service";
import SummaryCards from "../../components/dashboard/SummaryCards";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardService.getSummary();
      setSummary(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <SummaryCards summary={summary} />

    </div>
  );
};

export default Dashboard;