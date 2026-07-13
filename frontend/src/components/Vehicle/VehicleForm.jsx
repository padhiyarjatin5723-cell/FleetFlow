import { useState } from "react";
import vehicleService from "../../services/vehicle.service";

const VehicleForm = ({
  vehicle,
  setOpen,
  reload,
}) => {
  const [formData, setFormData] = useState({
    registrationNumber:
      vehicle?.registrationNumber || "",
    model: vehicle?.model || "",
    manufacturer:
      vehicle?.manufacturer || "",
    type: vehicle?.type || "CAR",
    status:
      vehicle?.status || "AVAILABLE",
    year: vehicle?.year || "",
    capacity: vehicle?.capacity || "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (vehicle) {
        await vehicleService.updateVehicle(
          vehicle.id,
          formData
        );
      } else {
        await vehicleService.createVehicle(
          formData
        );
      }

      reload();
      setOpen(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-4"
    >

      <input
        name="registrationNumber"
        placeholder="Registration Number"
        value={formData.registrationNumber}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        name="manufacturer"
        placeholder="Manufacturer"
        value={formData.manufacturer}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        name="model"
        placeholder="Model"
        value={formData.model}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="number"
        name="year"
        placeholder="Year"
        value={formData.year}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <input
        type="number"
        name="capacity"
        placeholder="Capacity"
        value={formData.capacity}
        onChange={handleChange}
        className="border p-2 rounded"
      />

      <select
        name="type"
        value={formData.type}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="CAR">CAR</option>
        <option value="TRUCK">TRUCK</option>
        <option value="BUS">BUS</option>
        <option value="VAN">VAN</option>
      </select>

      <select
        name="status"
        value={formData.status}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="AVAILABLE">
          AVAILABLE
        </option>

        <option value="IN_USE">
          IN_USE
        </option>

        <option value="MAINTENANCE">
          MAINTENANCE
        </option>

      </select>

      <div className="col-span-2 flex justify-end gap-3 mt-4">

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-5 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>

      </div>

    </form>
  );
};

export default VehicleForm;