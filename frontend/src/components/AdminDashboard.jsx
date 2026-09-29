import React from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import AdminDownloadsPanel from './downloads/AdminDownloadsPanel';
import WorkloadManagement from './workload/WorkloadManagement';
import AdminNoticePanel from "./notice/AdminNoticePanel";
import AdminMessagesPanel from './AdminMessagesPanel';
import FacultyForm from "./faculty/components/FacultyForm";
import FacultyCard from "./faculty/FacultyCard";
import FacultyProfile from "./faculty/FacultyProfile";
import { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Bell,
  BriefcaseBusiness,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  ArrowUpRight,
  Download,
  Mail,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isFacultyFormOpen, setIsFacultyFormOpen] = useState(false);
  const [isFacultyProfileOpen, setIsFacultyProfileOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const fetchFacultyData = async () => {
    try {
      const response = await API.get('/faculty');
      if (response.data.success) {
        setFacultyList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty records:', error);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'faculty') {
      fetchFacultyData();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (!user) return (
    <div className="p-10 text-gray-500 bg-gray-100 min-h-screen flex items-center justify-center font-medium">
      Loading...
    </div>
  );

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard',           icon: LayoutDashboard },
    { id: 'notices',   label: 'Notices',             icon: Bell },
    { id: 'students',  label: 'Students',            icon: GraduationCap },
    { id: 'faculty',   label: 'Faculty',             icon: Users },
    { id: 'programs',  label: 'Programs',            icon: BookOpen },
    { id: 'downloads', label: 'Downloads',           icon: Download },
    { id: 'messages',  label: 'Messages',            icon: Mail },
    { id: 'workload',  label: 'Workload Management', icon: BriefcaseBusiness },
    { id: 'settings',  label: 'Settings',            icon: Settings },
  ];

  return (
    <div className="h-screen bg-gray-100 text-gray-800 flex flex-col md:flex-row font-sans select-none overflow-hidden">

      {/* ── Mobile Top Bar ───────────────────────────────────────────── */}
      <div className="md:hidden flex items-center justify-between px-5 py-4 sticky top-0 z-40 border-b border-white/20 bg-[#1e3a8a]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-white/80 hover:text-white rounded-lg bg-white/10 border border-white/20 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-lg text-white tracking-tight">
            DCS <span className="text-violet-300">Admin</span>
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
          {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </div>
      </div>

      {/* ── Mobile Overlay ───────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-gray-900/50 z-50 md:hidden transition-opacity"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50
        w-50 p-4 flex flex-col justify-between bg-[#1e3a8a]
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-2.5">
              <img src="/dcs-logo.png" alt="DCS Logo" className="w-9 h-9 lg:w-11 lg:h-11 object-contain drop-shadow" />
              <h1 className="text-lg font-black tracking-tight text-white">
                DCS <span className="text-violet-300">Admin</span>
              </h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-white/60 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm
                    transition-colors duration-150 cursor-pointer font-medium
                    ${isActive
                      ? 'bg-white/15 text-white border-l-2 border-violet-300 font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/10 border-l-2 border-transparent'}
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-violet-300' : 'text-white/50'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — Logout */}
        <div className="pt-4 border-t border-white/15">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-red-300 hover:text-white hover:bg-red-500/20 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Desktop Sticky Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2.5 w-96 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-lg">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search applications, students, notices..."
              className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 w-full text-xs"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Bell */}
            <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-800 cursor-pointer relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-600 rounded-full" />
            </div>

            {/* User */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-xs font-bold text-gray-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-violet-600 uppercase font-mono font-bold mt-0.5">{user.role}</p>
              </div>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-sm bg-[#1e3a8a]"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* ── Tab Content Area ─────────────────────────────────────────── */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-gray-100">

          {activeTab === 'downloads' && <AdminDownloadsPanel />}
          {activeTab === 'workload'  && <WorkloadManagement />}
          {activeTab === 'messages'  && <AdminMessagesPanel />}
          {activeTab === 'notices'   && <AdminNoticePanel />}

          {/* ── Faculty ── */}
          {activeTab === 'faculty' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Faculty Management</h2>
                  <p className="text-xs text-gray-500 mt-1">Manage departmental faculty members and profiles.</p>
                </div>
                <button
                  onClick={() => { setEditingFaculty(null); setIsFacultyFormOpen(true); }}
                  className="px-4 py-2 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition cursor-pointer bg-[#1e3a8a] hover:bg-[#172e6e]"
                >
                  <Plus className="w-4 h-4" /> Add Faculty
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facultyList.map((member) => (
                  <FacultyCard
                    key={member._id || member.id}
                    member={member}
                    onViewProfile={() => { setSelectedFaculty(member); setIsFacultyProfileOpen(true); }}
                    onEdit={() => { setEditingFaculty(member); setIsFacultyFormOpen(true); }}
                  />
                ))}
              </div>

              {isFacultyFormOpen && (
                <FacultyForm
                  initialData={editingFaculty}
                  onCancel={() => { setIsFacultyFormOpen(false); setEditingFaculty(null); }}
                  onSuccess={fetchFacultyData}
                />
              )}
              {isFacultyProfileOpen && (
                <FacultyProfile
                  member={selectedFaculty}
                  onBack={() => { setIsFacultyProfileOpen(false); setSelectedFaculty(null); }}
                />
              )}
            </div>
          )}

          {/* ── Dashboard ── */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">Executive Dashboard</h2>
                <p className="text-xs text-gray-500 mt-1">DCS @ PARS Official Management & Monitoring Portal</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500">Total Applications</p>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 mt-1">1,284</h3>
                  <span className="text-[10px] font-bold mt-2 inline-block text-blue-700">+12% this month</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500">Total Faculty</p>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 mt-1">35+</h3>
                  <span className="text-[10px] font-bold mt-2 inline-block text-violet-600">PhD Scholars</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500">Active Notices</p>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 mt-1">12</h3>
                  <span className="text-[10px] font-bold mt-2 inline-block text-amber-600">3 Urgent</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500">Enrolled Students</p>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-800 mt-1">850</h3>
                  <span className="text-[10px] font-bold mt-2 inline-block text-emerald-600">CS, SE, AI, IT</span>
                </div>
              </div>

              {/* Table + Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 p-5 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Recent Student Applications</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600">
                      <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                        <tr>
                          <th className="p-2.5">Student</th>
                          <th className="p-2.5">Program</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr>
                          <td className="p-2.5 font-medium text-gray-800">Muhammad Ali</td>
                          <td className="p-2.5">BS CS</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button className="text-blue-700 font-semibold hover:underline cursor-pointer">View</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-gray-800">Sara Ahmed</td>
                          <td className="p-2.5">BS SE</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button className="text-blue-700 font-semibold hover:underline cursor-pointer">View</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-4 p-5 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-800 mb-4">Quick Management Actions</h3>
                  <div className="space-y-2.5">
                    <button
                      className="w-full flex items-center justify-between p-3 rounded-lg text-white text-xs font-bold transition cursor-pointer bg-[#1e3a8a] hover:bg-[#172e6e]"
                    >
                      <span>+ Add New Program</span>
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold transition cursor-pointer">
                      <span>Post Notice / News</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Applications ── */}
          {activeTab === 'applications' && (
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Student Applications Management</h2>
              <p className="text-xs text-gray-500">Review, approve, or reject incoming student enrollment forms.</p>
            </div>
          )}

          {/* ── Students ── */}
          {activeTab === 'students' && (
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Registered Students Directory</h2>
              <p className="text-xs text-gray-500">Manage enrolled student profiles across CS, SE, AI, and IT departments.</p>
            </div>
          )}

          {/* ── Programs ── */}
          {activeTab === 'programs' && (
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Academic Programs Control</h2>
              <p className="text-xs text-gray-500">Configure degree requirements, course structures, and seat allocations.</p>
            </div>
          )}

          {/* ── Settings ── */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Admin Portal Settings</h2>
              <p className="text-xs text-gray-500">System configuration, security settings, and access control.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;