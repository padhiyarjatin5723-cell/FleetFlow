import { useState } from "react";
import vehicleService from "../../services/vehicle.service";

const VehicleForm = ({ vehicle, setOpen, reload }) => {
  const [formData, setFormData] = useState({
    registrationNo: vehicle?.registrationNo || "",
    make: vehicle?.make || "",
    model: vehicle?.model || "",
    year: vehicle?.year || new Date().getFullYear(),
    vehicleType: vehicle?.vehicleType || "Truck",
    capacityKg: vehicle?.capacityKg || "",
    fuelType: vehicle?.fuelType || "DIESEL",
    purchaseDate: vehicle?.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: vehicle?.status || "AVAILABLE",
    currentOdometer: vehicle?.currentOdometer || 0,
    vin: vehicle?.vin || "",
    notes: vehicle?.notes || "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Prepare payload with correct types
    const payload = {
      ...formData,
      year: parseInt(formData.year, 10),
      capacityKg: parseFloat(formData.capacityKg),
      currentOdometer: parseFloat(formData.currentOdometer),
      purchaseDate: new Date(formData.purchaseDate).toISOString(),
    };

    try {
      if (vehicle) {
        await vehicleService.updateVehicle(vehicle.id, payload);
      } else {
        await vehicleService.createVehicle(payload);
      }
      reload();
      setOpen(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong. Please check your inputs.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative col-span-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Registration Number *</label>
          <input
            type="text"
            name="registrationNo"
            required
            value={formData.registrationNo}
            onChange={handleChange}
            placeholder="e.g. GJ-01-XX-1234"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">VIN (Vehicle Identification No.)</label>
          <input
            type="text"
            name="vin"
            value={formData.vin}
            onChange={handleChange}
            placeholder="Enter VIN"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Make (Manufacturer) *</label>
          <input
            type="text"
            name="make"
            required
            value={formData.make}
            onChange={handleChange}
            placeholder="e.g. Tata, Mahindra"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Model *</label>
          <input
            type="text"
            name="model"
            required
            value={formData.model}
            onChange={handleChange}
            placeholder="e.g. Signa 4018"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Year *</label>
          <input
            type="number"
            name="year"
            required
            value={formData.year}
            onChange={handleChange}
            placeholder="e.g. 2024"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Capacity (Kg) *</label>
          <input
            type="number"
            name="capacityKg"
            required
            value={formData.capacityKg}
            onChange={handleChange}
            placeholder="e.g. 15000"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Vehicle Type *</label>
          <input
            type="text"
            name="vehicleType"
            required
            value={formData.vehicleType}
            onChange={handleChange}
            placeholder="e.g. Heavy Truck, Tanker"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Fuel Type *</label>
          <select
            name="fuelType"
            value={formData.fuelType}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          >
            <option value="PETROL">PETROL</option>
            <option value="DIESEL">DIESEL</option>
            <option value="CNG">CNG</option>
            <option value="EV">EV</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Purchase Date *</label>
          <input
            type="date"
            name="purchaseDate"
            required
            value={formData.purchaseDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Current Odometer (Km)</label>
          <input
            type="number"
            name="currentOdometer"
            value={formData.currentOdometer}
            onChange={handleChange}
            placeholder="e.g. 50000"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        {vehicle && (
          <div>
            <label className="block text-sm font-medium text-gray-700 font-sans">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ON_TRIP">ON_TRIP</option>
              <option value="IN_MAINTENANCE">IN_MAINTENANCE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </div>
        )}

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans">Notes</label>
          <textarea
            name="notes"
            rows="3"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any specific comments..."
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-150">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-5 py-2 border rounded text-gray-700 hover:bg-gray-50 font-sans"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-sm font-sans"
        >
          {vehicle ? "Update Vehicle" : "Create Vehicle"}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;