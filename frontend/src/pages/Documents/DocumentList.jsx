import ResourceList from "../../components/ResourceList";

const DocumentList = () => (
  <ResourceList
    title="Documents"
    endpoint="/documents"
    columns={[
      { key: "title", label: "Title" },
      { key: "documentType", label: "Type" },
      { key: "vehicle.registrationNo", label: "Vehicle" },
      { key: "driver.fullName", label: "Driver" },
      { key: "expiryDate", label: "Expiry", type: "date" },
    ]}
  />
);

export default DocumentList;
