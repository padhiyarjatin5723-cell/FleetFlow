const VehicleTable = ({ vehicles, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-500">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
          <tr>
            <th className="px-6 py-4">Registration</th>
            <th className="px-6 py-4">Make / Model</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Capacity (Kg)</th>
            <th className="px-6 py-4">Fuel Type</th>
            <th className="px-6 py-4">Odometer</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                No vehicles registered. Click "Add Vehicle" to create one.
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle) => {
              // Select status badge classes
              let badgeColor = "bg-gray-100 text-gray-800";
              if (vehicle.status === "AVAILABLE") badgeColor = "bg-green-100 text-green-800";
              else if (vehicle.status === "ON_TRIP") badgeColor = "bg-blue-100 text-blue-800";
              else if (vehicle.status === "IN_MAINTENANCE") badgeColor = "bg-yellow-100 text-yellow-800";
              else if (vehicle.status === "OUT_OF_SERVICE") badgeColor = "bg-red-100 text-red-800";

              return (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                    {vehicle.registrationNo}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {vehicle.vehicleType}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {vehicle.capacityKg?.toLocaleString()} Kg
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {vehicle.fuelType}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {vehicle.currentOdometer?.toLocaleString() || 0} Km
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(vehicle)}
                      className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(vehicle.id)}
                      className="inline-flex items-center rounded border border-transparent bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleTable;