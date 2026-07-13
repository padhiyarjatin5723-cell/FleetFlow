import ResourceList from "../../components/ResourceList";

const DriverList = () => (
  <ResourceList
    title="Drivers"
    endpoint="/drivers"
    columns={[
      { key: "employeeCode", label: "Code" },
      { key: "fullName", label: "Name" },
      { key: "phone", label: "Phone" },
      { key: "licenseNumber", label: "License" },
      { key: "licenseExpiry", label: "License Expiry", type: "date" },
      { key: "status", label: "Status" },
    ]}
  />
);

export default DriverList;
