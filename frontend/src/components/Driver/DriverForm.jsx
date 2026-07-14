import React, { useState } from "react";
import driverService from "../../services/driver.service";

const DriverForm = ({ driver, setOpen, reload }) => {
  const [formData, setFormData] = useState({
    fullName: driver?.fullName || "",
    employeeCode: driver?.employeeCode || "",
    email: driver?.email || "",
    phone: driver?.phone || "",
    licenseNumber: driver?.licenseNumber || "",
    licenseExpiry: driver?.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    experienceYears: driver?.experienceYears || 0,
    status: driver?.status || "AVAILABLE",
    joiningDate: driver?.joiningDate ? new Date(driver.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    address: driver?.address || "",
    emergencyContact: driver?.emergencyContact || "",
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

    const payload = {
      ...formData,
      experienceYears: parseInt(formData.experienceYears, 10),
      licenseExpiry: new Date(formData.licenseExpiry).toISOString(),
      joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : null,
    };

    try {
      if (driver) {
        await driverService.updateDriver(driver.id, payload);
      } else {
        await driverService.createDriver(payload);
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
          <label className="block text-sm font-medium text-gray-700 font-sans">Full Name *</label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Employee Code *</label>
          <input
            type="text"
            name="employeeCode"
            required
            value={formData.employeeCode}
            onChange={handleChange}
            placeholder="e.g. EMP123"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. john@example.com"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Phone *</label>
          <input
            type="text"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. 9876543210"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">License Number *</label>
          <input
            type="text"
            name="licenseNumber"
            required
            value={formData.licenseNumber}
            onChange={handleChange}
            placeholder="e.g. DL-XXXXXXXXXXXXX"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">License Expiry *</label>
          <input
            type="date"
            name="licenseExpiry"
            required
            value={formData.licenseExpiry}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Experience (Years)</label>
          <input
            type="number"
            name="experienceYears"
            value={formData.experienceYears}
            onChange={handleChange}
            placeholder="e.g. 5"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Joining Date</label>
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 font-sans">Emergency Contact</label>
          <input
            type="text"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
            placeholder="e.g. 9876543211"
            className="mt-1 block w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white text-black"
          />
        </div>

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
            <option value="ON_LEAVE">ON_LEAVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 font-sans">Address</label>
          <textarea
            name="address"
            rows="2"
            value={formData.address}
            onChange={handleChange}
            placeholder="Driver address details..."
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
          {driver ? "Update Driver" : "Create Driver"}
        </button>
      </div>
    </form>
  );
};

export default DriverForm;
