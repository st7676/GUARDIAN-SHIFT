import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Users, BarChart3, Settings, Clock, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Helper function to convert page names to routes
const getPageRoute = (pageName) => {
  if (pageName === 'Dashboard') return '/';
  return `/${pageName.toLowerCase()}`;
};

const NAV_ITEMS = [
  { name: 'Dashboard', icon: Calendar, page: 'Dashboard', adminOnly: true },
  { name: 'Nurses', icon: Users, page: 'Nurses', adminOnly: true },
  { name: 'Requests', icon: Clock, page: 'Availability', adminOnly: false },
  { name: 'My Schedule', icon: Calendar, page: 'MySchedule', adminOnly: false },
  { name: 'Reports', icon: BarChart3, page: 'Reports', adminOnly: true },
  { name: 'Settings', icon: Settings, page: 'Settings', adminOnly: false },
];

export default function Layout({ children, currentPageName }) {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [currentNurse, setCurrentNurse] = React.useState(null);
  const [nurses, setNurses] = React.useState([]);

  React.useEffect(() => {
    base44.auth.me().then(user => setCurrentUser(user)).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      base44.entities.Nurse.filter({ is_active: true }).then(allNurses => {
        setNurses(allNurses);
        const nurse = allNurses.find(n => n.user_id === currentUser.id);
        setCurrentNurse(nurse);
      });
    }
  }, [currentUser]);

  const isHeadNurse = currentNurse?.is_head_nurse || false;
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (item.adminOnly && !isHeadNurse) return false;
    if (item.page === 'Nurses' && !isHeadNurse) return false;
    return true;
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={getPageRoute('Dashboard')} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800">NurseShift</span>
            </Link>

            {/* Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {visibleNavItems.map(item => (
                <Link
                  key={item.page}
                  to={getPageRoute(item.page)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    currentPageName === item.page
                      ? "bg-sky-100 text-sky-700"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
                ))}
                </div>

                {/* Logout Button */}
                <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-slate-600 hover:text-red-600"
                >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">התנתק</span>
                </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="flex justify-around py-2">
          {visibleNavItems.map(item => (
            <Link
              key={item.page}
              to={getPageRoute(item.page)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg",
                currentPageName === item.page
                  ? "text-sky-600"
                  : "text-slate-500"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Page Content */}
      <main className="pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}