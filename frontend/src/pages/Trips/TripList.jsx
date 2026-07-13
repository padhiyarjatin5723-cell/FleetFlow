import ResourceList from "../../components/ResourceList";

const TripList = () => (
  <ResourceList
    title="Trips"
    endpoint="/trips"
    columns={[
      { key: "tripNumber", label: "Trip No" },
      { key: "vehicle.registrationNo", label: "Vehicle" },
      { key: "driver.fullName", label: "Driver" },
      { key: "source", label: "Source" },
      { key: "destination", label: "Destination" },
      { key: "scheduledStart", label: "Start", type: "date" },
      { key: "status", label: "Status" },
    ]}
  />
);

export default TripList;
