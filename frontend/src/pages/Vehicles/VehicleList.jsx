import { useCallback, useEffect, useState } from "react";
import vehicleService from "../../services/vehicle.service";
import VehicleTable from "../../components/Vehicle/VehicleTable";
import VehicleModal from "../../components/Vehicle/VehicleModal";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const loadVehicles = useCallback(async () => {
    const res = await vehicleService.getVehicles();
    setVehicles(res.data.data);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadInitialVehicles = async () => {
      const res = await vehicleService.getVehicles();

      if (isMounted) {
        setVehicles(res.data.data);
      }
    };

    loadInitialVehicles();

    return () => {
      isMounted = false;
    };
  }, [loadVehicles]);

  const handleAdd = () => {
    setSelectedVehicle(null);
    setOpen(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete Vehicle?")) return;

    await vehicleService.deleteVehicle(id);

    loadVehicles();
  };

  return (
    <div>

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          Vehicles
        </h1>

        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-5 py-2 rounded"
        >
          Add Vehicle
        </button>

      </div>

      <VehicleTable
        vehicles={vehicles}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <VehicleModal
        open={open}
        setOpen={setOpen}
        vehicle={selectedVehicle}
        reload={loadVehicles}
      />

    </div>
  );
};

export default VehicleList;
