import ResourceList from "../../components/ResourceList";

const ExpenseList = () => (
  <ResourceList
    title="Expenses"
    endpoint="/expenses"
    columns={[
      { key: "expenseDate", label: "Date", type: "date" },
      { key: "trip.tripNumber", label: "Trip" },
      { key: "expenseType", label: "Type" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "description", label: "Description" },
    ]}
  />
);

export default ExpenseList;
