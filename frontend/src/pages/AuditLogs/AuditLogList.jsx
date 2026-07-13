import ResourceList from "../../components/ResourceList";

const AuditLogList = () => (
  <ResourceList
    title="Audit Logs"
    endpoint="/audit-logs"
    columns={[
      { key: "action", label: "Action" },
      { key: "entityType", label: "Entity" },
      { key: "entityId", label: "Entity ID" },
      { key: "ipAddress", label: "IP Address" },
      { key: "createdAt", label: "Created", type: "date" },
    ]}
  />
);

export default AuditLogList;
