import StatCard from "./StatCard";

const summaryCards = [
  { key: "totalVehicles", title: "Total Vehicles" },
  { key: "availableVehicles", title: "Available Vehicles" },
  { key: "totalDrivers", title: "Total Drivers" },
  { key: "availableDrivers", title: "Available Drivers" },
  { key: "totalTrips", title: "Total Trips" },
  { key: "activeTrips", title: "Active Trips" },
  { key: "pendingMaintenance", title: "Pending Maintenance" },
  { key: "totalExpenses", title: "Total Expenses", format: "currency" },
];

const formatValue = (value, format) => {
  if (value === undefined || value === null) return "-";

  if (format === "currency") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  return value;
};

const SummaryCards = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => (
        <StatCard
          key={card.key}
          title={card.title}
          value={formatValue(summary?.[card.key], card.format)}
        />
      ))}
    </div>
  );
};

export default SummaryCards;
