import ResourceList from "../../components/ResourceList";

const FuelList = () => (
  <ResourceList
    title="Fuel Logs"
    endpoint="/fuel"
    columns={[
      { key: "fuelDate", label: "Date", type: "date" },
      { key: "vehicle.registrationNo", label: "Vehicle" },
      { key: "quantity", label: "Liters" },
      { key: "pricePerLiter", label: "Price/L", type: "currency" },
      { key: "totalAmount", label: "Total", type: "currency" },
      { key: "stationName", label: "Station" },
    ]}
  />
);

export default FuelList;
