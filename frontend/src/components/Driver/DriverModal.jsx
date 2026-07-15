import DriverForm from "./DriverForm";

const DriverModal = ({ open, setOpen, driver, reload }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-[700px]">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {driver ? "Edit Driver" : "Add Driver"}
          </h2>
          <button onClick={() => setOpen(false)} className="text-xl">
            ✕
          </button>
        </div>
        <DriverForm driver={driver} setOpen={setOpen} reload={reload} />
      </div>
    </div>
  );
};

export default DriverModal;
