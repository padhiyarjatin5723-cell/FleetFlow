import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-8">

      <h2 className="text-xl font-bold">
        Fleet Management System
      </h2>

      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

    </div>
  );
};

export default Navbar;