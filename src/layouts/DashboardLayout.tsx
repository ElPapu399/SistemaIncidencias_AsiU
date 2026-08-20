import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
