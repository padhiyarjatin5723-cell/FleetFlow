import { useEffect, useMemo, useState } from "react";
import axios from "../api/axios";

const getValue = (item, key) => {
  return key.split(".").reduce((value, part) => value?.[part], item);
};

const formatValue = (value, type) => {
  if (value === undefined || value === null || value === "") return "-";

  if (type === "date") {
    return new Date(value).toLocaleDateString();
  }

  if (type === "currency") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return value;
};

const ResourceList = ({ title, endpoint, columns }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    axios
      .get(endpoint)
      .then((res) => {
        if (isMounted) {
          setItems(res.data.data || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || "Unable to load records");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [endpoint, reloadKey]);

  const hasRows = useMemo(() => items.length > 0, [items]);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete ${title.slice(0, -1)}?`)) return;

    try {
      await axios.delete(`${endpoint}/${id}`);
      setLoading(true);
      setError("");
      setReloadKey((current) => current + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete record");
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-slate-500"
                    colSpan={columns.length + 1}
                  >
                    Loading {title.toLowerCase()}...
                  </td>
                </tr>
              )}

              {!loading && !hasRows && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-sm text-slate-500"
                    colSpan={columns.length + 1}
                  >
                    No records found.
                  </td>
                </tr>
              )}

              {!loading &&
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap px-4 py-3 text-sm text-slate-700"
                      >
                        {formatValue(getValue(item, column.key), column.type)}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ResourceList;
