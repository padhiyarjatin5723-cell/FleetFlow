const VehicleTable = ({
    vehicles,
    onEdit,
    onDelete,
  }) => {
    return (
      <table className="w-full bg-white shadow rounded">
  
        <thead>
  
          <tr className="bg-gray-100">
  
            <th className="p-3">Registration</th>
            <th className="p-3">Model</th>
            <th className="p-3">Type</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
  
          </tr>
  
        </thead>
  
        <tbody>
  
          {vehicles.map((vehicle) => (
  
            <tr
              key={vehicle.id}
              className="border-t"
            >
  
              <td className="p-3">
                {vehicle.registrationNumber}
              </td>
  
              <td className="p-3">
                {vehicle.model}
              </td>
  
              <td className="p-3">
                {vehicle.type}
              </td>
  
              <td className="p-3">
                {vehicle.status}
              </td>
  
              <td className="p-3 flex gap-2">
  
                <button
                  onClick={() => onEdit(vehicle)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
  
                <button
                  onClick={() => onDelete(vehicle.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
  
              </td>
  
            </tr>
  
          ))}
  
        </tbody>
  
      </table>
    );
  };
  
  export default VehicleTable;