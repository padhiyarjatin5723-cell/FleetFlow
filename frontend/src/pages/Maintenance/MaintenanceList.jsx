import ResourceList from "../../components/ResourceList";

const MaintenanceList = () => (
  <ResourceList
    title="Maintenance"
    endpoint="/maintenance"
    columns={[
      { key: "title", label: "Title" },
      { key: "vehicle.registrationNo", label: "Vehicle" },
      { key: "serviceDate", label: "Service Date", type: "date" },
      { key: "nextServiceDate", label: "Next Service", type: "date" },
      { key: "cost", label: "Cost", type: "currency" },
      { key: "status", label: "Status" },
    ]}
  />
);

export default MaintenanceList;
