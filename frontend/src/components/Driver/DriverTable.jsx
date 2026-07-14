import React from "react";

const DriverTable = ({ drivers, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-gray-500">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-700">
          <tr>
            <th className="px-6 py-4">Employee Code</th>
            <th className="px-6 py-4">Full Name</th>
            <th className="px-6 py-4">Phone</th>
            <th className="px-6 py-4">License Details</th>
            <th className="px-6 py-4">Experience</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {drivers.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                No drivers registered. Click "Add Driver" to create one.
              </td>
            </tr>
          ) : (
            drivers.map((driver) => {
              let badgeColor = "bg-gray-100 text-gray-800";
              if (driver.status === "AVAILABLE") badgeColor = "bg-green-100 text-green-800";
              else if (driver.status === "ON_TRIP") badgeColor = "bg-blue-100 text-blue-800";
              else if (driver.status === "ON_LEAVE") badgeColor = "bg-yellow-100 text-yellow-800";
              else if (driver.status === "SUSPENDED") badgeColor = "bg-red-100 text-red-800";

              const isLicenseExpired = new Date(driver.licenseExpiry) < new Date();

              return (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 font-semibold text-gray-900">
                    {driver.employeeCode}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                    {driver.fullName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {driver.phone}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="font-medium text-gray-900">{driver.licenseNumber}</div>
                    <div className={`text-xs ${isLicenseExpired ? "text-red-500 font-bold" : "text-gray-500"}`}>
                      Expiry: {new Date(driver.licenseExpiry).toLocaleDateString()} {isLicenseExpired && "(EXPIRED)"}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {driver.experienceYears} Years
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(driver)}
                      className="inline-flex items-center rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(driver.id)}
                      className="inline-flex items-center rounded border border-transparent bg-red-100 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
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

export default DriverTable;
