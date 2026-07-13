import ResourceList from "../../components/ResourceList";

const NotificationList = () => (
  <ResourceList
    title="Notifications"
    endpoint="/notifications"
    columns={[
      { key: "title", label: "Title" },
      { key: "message", label: "Message" },
      { key: "type", label: "Type" },
      { key: "isRead", label: "Read" },
      { key: "createdAt", label: "Created", type: "date" },
    ]}
  />
);

export default NotificationList;
