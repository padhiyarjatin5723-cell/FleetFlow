import { useCallback, useEffect, useState } from "react";
import driverService from "../../services/driver.service";
import DriverTable from "../../components/Driver/DriverTable";
import DriverModal from "../../components/Driver/DriverModal";

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await driverService.getDrivers();
      setDrivers(res.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load drivers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadDrivers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDrivers]);

  const handleAdd = () => {
    setSelectedDriver(null);
    setOpen(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Driver Profile?")) return;

    try {
      await driverService.deleteDriver(id);
      loadDrivers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete driver");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Drivers Registry</h1>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-medium shadow-sm font-sans"
        >
          Add Driver
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading drivers...</div>
      ) : (
        <DriverTable
          drivers={drivers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DriverModal
        open={open}
        setOpen={setOpen}
        driver={selectedDriver}
        reload={loadDrivers}
      />
    </div>
  );
};

export default DriverList;
