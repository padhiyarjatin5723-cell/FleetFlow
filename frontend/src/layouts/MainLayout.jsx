import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#f6f8fc] text-slate-900">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Navbar />

        <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
