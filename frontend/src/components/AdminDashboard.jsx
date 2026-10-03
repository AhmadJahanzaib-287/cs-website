import React, { lazy, Suspense, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
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
  Camera,
  Trash2,
  ZoomIn,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const DashboardCharts = lazy(() => import('./admin/DashboardCharts'));

const AdminDashboard = () => {
  const { user, logoutUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [isFacultyFormOpen, setIsFacultyFormOpen] = useState(false);
  const [isFacultyProfileOpen, setIsFacultyProfileOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [passwordFields, setPasswordFields] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [avatarMessage, setAvatarMessage] = useState(null);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);
  const [cropSource, setCropSource] = useState('');
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const avatarInputRef = useRef(null);

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

  const openProfile = () => {
    setPasswordMessage(null);
    setAvatarMessage(null);
    setIsProfileOpen(true);
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage(null);

    if (passwordFields.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsPasswordSaving(true);
    try {
      const { data } = await API.put('/auth/password', {
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
      });
      setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage({ type: 'success', text: data.message || 'Password updated successfully.' });
    } catch (error) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.message || 'Could not update password. Please try again.',
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setAvatarMessage({ type: 'error', text: 'Choose a PNG, JPG, or WebP image.' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAvatarMessage({ type: 'error', text: 'Choose an image smaller than 10 MB.' });
      return;
    }

    setAvatarMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      setCropSource(reader.result);
      setCropPosition({ x: 0, y: 0 });
      setCropZoom(1);
    };
    reader.onerror = () => {
      setAvatarMessage({ type: 'error', text: 'Could not read this image file.' });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (_croppedArea, pixelArea) => {
    setCroppedAreaPixels(pixelArea);
  };

  const handleCroppedAvatarUpload = async () => {
    if (!cropSource || !croppedAreaPixels) return;

    setIsAvatarSaving(true);
    setAvatarMessage(null);
    try {
      const image = new Image();
      image.src = cropSource;
      await image.decode();

      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not prepare the cropped image.');

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const avatar = canvas.toDataURL('image/jpeg', 0.88);
      const { data } = await API.put('/auth/avatar', { avatar });
      updateUser(data.user);
      setCropSource('');
      setAvatarMessage({ type: 'success', text: data.message || 'Profile picture updated.' });
    } catch (error) {
      setAvatarMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Could not update profile picture. Please try again.',
      });
    } finally {
      setIsAvatarSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsAvatarSaving(true);
    setAvatarMessage(null);
    try {
      const { data } = await API.delete('/auth/avatar');
      updateUser(data.user);
      setAvatarMessage({ type: 'success', text: data.message || 'Profile picture removed.' });
    } catch (error) {
      setAvatarMessage({
        type: 'error',
        text: error.response?.data?.message || 'Could not remove profile picture. Please try again.',
      });
    } finally {
      setIsAvatarSaving(false);
    }
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
  const activeNavigationItem = navigationItems.find((item) => item.id === activeTab);
  const dashboardStats = [
    { label: 'Total Applications', value: '1,284', note: '+12% this month', icon: BriefcaseBusiness, tone: 'text-[#0e7490] bg-[#e8f5f6]' },
    { label: 'Total Faculty', value: '35+', note: 'PhD scholars', icon: Users, tone: 'text-[#1e3a8a] bg-[#edf2fb]' },
    { label: 'Active Notices', value: '12', note: '3 urgent', icon: Bell, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Enrolled Students', value: '850', note: 'CS, SE, AI, IT', icon: GraduationCap, tone: 'text-emerald-700 bg-emerald-50' },
  ];

  return (
    <div className="flex h-screen select-none flex-col overflow-hidden bg-[#f3f7fb] font-sans text-[#17243b] md:flex-row">

      {/* ── Mobile Top Bar ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/15 bg-[#172e6e] px-4 py-3.5 md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open dashboard navigation"
            className="rounded-md border border-white/20 bg-white/10 p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold tracking-tight text-white">
            DCS <span className="text-cyan-200">Admin</span>
          </span>
        </div>
        <button type="button" onClick={openProfile} aria-label="Open admin profile" className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/15 text-sm font-bold text-white">
          {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name ? user.name.charAt(0).toUpperCase() : 'A'}
        </button>
      </div>

      {/* ── Mobile Overlay ───────────────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-50 bg-[#10203d]/55 backdrop-blur-[2px] transition-opacity md:hidden"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`
        fixed md:static top-0 left-0 bottom-0 z-50
        w-64 shrink-0 flex flex-col justify-between overflow-y-auto bg-[#172e6e] px-3 py-3 shadow-xl shadow-[#13264c]/10 md:h-screen md:overflow-hidden
        transition-transform duration-300 ease-in-out md:w-60 lg:w-64
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div>
          {/* Sidebar Header */}
          <div className="mb-5 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <img src="/dcs-logo.png" alt="DCS Logo" className="h-10 w-10 rounded-md bg-white object-contain p-0.5" />
              <h1 className="text-base font-bold tracking-tight text-white">
                DCS <span className="text-cyan-200">Admin</span>
              </h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close dashboard navigation"
              className="rounded-md p-1.5 text-white/65 transition hover:bg-white/10 hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <p className="mb-2 px-3 text-[10px] font-bold uppercase text-blue-200/65">Workspace</p>
          <nav className="space-y-0.5" aria-label="Admin sections">
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
                    flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors duration-150 sm:text-sm
                    ${isActive
                      ? 'bg-white text-[#172e6e] font-semibold shadow-sm'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'}
                  `}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#0e7490]' : 'text-white/65'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer — Logout */}
        <div className="mt-2 shrink-0 border-t border-white/15 pt-2">
          <button type="button" onClick={openProfile} className="mb-1.5 flex w-full items-center gap-2.5 rounded-md bg-white/8 px-2.5 py-1.5 text-left transition hover:bg-white/12" aria-label="Open admin profile">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
              {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" /> : user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">{user.name}</p>
              <p className="mt-0.5 truncate text-[10px] capitalize text-blue-200/70">{user.role}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-blue-100/75 transition hover:bg-red-400/15 hover:text-white sm:text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* Desktop Sticky Header */}
        <header className="sticky top-0 z-30 hidden items-center justify-between border-b border-[#dce5ef] bg-white px-6 py-3.5 lg:px-8 md:flex">
          <div className="flex min-w-0 items-center gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#8290a3]">DCS Admin / Workspace</p>
              <p className="mt-0.5 text-sm font-semibold text-[#25354d]">{activeNavigationItem?.label || 'Dashboard'}</p>
            </div>
            <div className="ml-3 hidden w-72 items-center gap-2.5 rounded-md border border-[#dce5ef] bg-[#f7fafc] px-3 py-2 xl:flex">
            <Search className="h-4 w-4 shrink-0 text-[#8290a3]" />
            <input
              type="text"
              placeholder="Search applications, students, notices..."
              aria-label="Search dashboard"
              className="w-full border-none bg-transparent text-xs text-[#25354d] outline-none placeholder:text-[#91a0b3]"
            />
          </div>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" aria-label="Notifications" className="relative rounded-md border border-[#dce5ef] bg-white p-2.5 text-[#52647b] transition hover:bg-[#f3f7fb] hover:text-[#1e3a8a]">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#0e7490]" />
            </button>

            {/* User */}
            <div className="flex items-center gap-3 border-l border-[#dce5ef] pl-4">
              <div className="text-right">
                <p className="text-xs font-bold leading-tight text-[#25354d]">{user.name}</p>
                <p className="mt-0.5 font-mono text-[10px] font-bold uppercase text-[#0e7490]">{user.role}</p>
              </div>
              <button type="button" onClick={openProfile} aria-label="Open admin profile" className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#1e3a8a] text-sm font-bold text-white ring-2 ring-[#dce5ef]">
                {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </button>
            </div>
          </div>
        </header>

        {/* ── Tab Content Area ─────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-[#f3f7fb] p-4 sm:p-6 lg:p-8">

          {activeTab === 'downloads' && <AdminDownloadsPanel />}
          {activeTab === 'workload'  && <WorkloadManagement />}
          {activeTab === 'messages'  && <AdminMessagesPanel />}
          {activeTab === 'notices'   && <AdminNoticePanel />}

          {/* ── Faculty ── */}
          {activeTab === 'faculty' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#17243b]">Faculty Management</h2>
                  <p className="mt-1 text-xs text-[#69788d]">Manage departmental faculty members and profiles.</p>
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase text-[#0e7490]">Department overview</p>
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#17243b] sm:text-3xl">Executive Dashboard</h2>
                  <p className="mt-1.5 text-sm text-[#69788d]">DCS at PARS · Management and monitoring</p>
                </div>
                <span className="w-fit rounded-md border border-[#dce5ef] bg-white px-3 py-2 text-xs font-semibold text-[#52647b]">Academic operations</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
                {dashboardStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(23,36,59,0.5)] sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[#69788d]">{stat.label}</p>
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${stat.tone}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <h3 className="mt-3 text-2xl font-extrabold tabular-nums text-[#17243b] sm:text-3xl">{stat.value}</h3>
                      <span className="mt-1.5 inline-block text-[11px] font-semibold text-[#52647b]">{stat.note}</span>
                    </div>
                  );
                })}
              </div>

              <Suspense fallback={<div className="grid min-h-64 place-items-center rounded-lg border border-[#dce5ef] bg-white text-xs font-medium text-[#69788d]">Loading dashboard charts...</div>}>
                <DashboardCharts />
              </Suspense>

              {/* Table + Quick Actions */}
              <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
                <div className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(23,36,59,0.5)] sm:p-5 xl:col-span-8">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#25354d]">Recent Student Applications</h3>
                      <p className="mt-1 text-xs text-[#8290a3]">Latest application activity</p>
                    </div>
                    <button onClick={() => setActiveTab('students')} className="inline-flex items-center gap-1 text-xs font-bold text-[#1e3a8a] transition hover:text-[#0e7490]">
                      View directory <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-xs text-[#52647b]">
                      <thead className="border-b border-[#e3eaf1] bg-[#f7fafc] font-semibold text-[#69788d]">
                        <tr>
                          <th className="p-2.5">Student</th>
                          <th className="p-2.5">Program</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf1f5]">
                        <tr>
                          <td className="p-2.5 font-medium text-[#25354d]">Muhammad Ali</td>
                          <td className="p-2.5">BS CS</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button className="font-semibold text-[#1e3a8a] transition hover:text-[#0e7490]">View</button>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-medium text-[#25354d]">Sara Ahmed</td>
                          <td className="p-2.5">BS SE</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button className="font-semibold text-[#1e3a8a] transition hover:text-[#0e7490]">View</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(23,36,59,0.5)] sm:p-5 xl:col-span-4">
                  <h3 className="text-sm font-bold text-[#25354d]">Quick Management Actions</h3>
                  <p className="mb-4 mt-1 text-xs text-[#8290a3]">Jump to a workspace</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('programs')}
                      className="flex w-full items-center justify-between rounded-md bg-[#1e3a8a] p-3 text-xs font-bold text-white transition hover:bg-[#172e6e]"
                    >
                      <span>Manage Programs</span>
                      <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={() => setActiveTab('notices')} className="flex w-full items-center justify-between rounded-md border border-[#dce5ef] bg-[#f7fafc] p-3 text-xs font-semibold text-[#40516a] transition hover:border-[#b9dce2] hover:bg-[#edf5f7]">
                      <span>Manage Notices</span>
                      <ArrowUpRight className="h-4 w-4 text-[#0e7490]" />
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

      {isProfileOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10203d]/55 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsProfileOpen(false);
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="admin-profile-title" className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-[#dce5ef] bg-white shadow-2xl">
            <header className="flex items-start justify-between border-b border-[#e3eaf1] px-5 py-3 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#0e7490]">Account settings</p>
                <h2 id="admin-profile-title" className="mt-0.5 text-lg font-bold text-[#17243b]">Admin profile</h2>
              </div>
              <button type="button" onClick={() => setIsProfileOpen(false)} aria-label="Close profile" className="rounded-md p-2 text-[#69788d] transition hover:bg-[#f3f7fb] hover:text-[#17243b]">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[0.9fr_1.1fr] md:gap-5">
              <div className="space-y-3">
              {!cropSource && (
              <section className="flex flex-col gap-4 rounded-lg border border-[#dce5ef] bg-[#f7fafc] p-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1e3a8a] text-xl font-bold text-white">
                  {user.avatar ? <img src={user.avatar} alt={`${user.name} profile`} className="h-full w-full object-cover" /> : user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-[#25354d]">{user.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-[#69788d]">{user.email}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-[#0e7490]">{user.role}</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} className="sr-only" />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isAvatarSaving || Boolean(cropSource)}
                    className="inline-flex items-center gap-2 rounded-md border border-[#cbd8e6] bg-white px-3 py-2 text-xs font-semibold text-[#1e3a8a] transition hover:border-[#0e7490] hover:text-[#0e7490] disabled:opacity-60"
                  >
                    <Camera className="h-4 w-4" /> Change photo
                  </button>
                  {user.avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isAvatarSaving || Boolean(cropSource)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:opacity-60"
                    >
                      {isAvatarSaving && !cropSource ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Remove photo
                    </button>
                  )}
                  <span className="w-full text-[10px] text-[#8290a3] sm:text-right">PNG, JPG or WebP · max 10 MB</span>
                </div>
              </section>
              )}

              {cropSource && (
                <section className="space-y-2.5 rounded-lg border border-[#dce5ef] bg-[#f7fafc] p-3" aria-label="Adjust profile photo crop">
                  <div>
                    <h3 className="text-sm font-bold text-[#25354d]">Adjust your photo</h3>
                    <p className="mt-0.5 text-[11px] text-[#69788d]">Drag and zoom to frame your photo.</p>
                  </div>
                  <div className="relative mx-auto h-48 w-full max-w-sm overflow-hidden rounded-md bg-[#17243b]">
                    <Cropper
                      image={cropSource}
                      crop={cropPosition}
                      zoom={cropZoom}
                      aspect={1}
                      cropShape="round"
                      showGrid={false}
                      onCropChange={setCropPosition}
                      onZoomChange={setCropZoom}
                      onCropComplete={handleCropComplete}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#52647b]">
                    <ZoomIn className="h-4 w-4 shrink-0 text-[#0e7490]" />
                    <span className="w-10">Zoom</span>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.01}
                      value={cropZoom}
                      onChange={(event) => setCropZoom(Number(event.target.value))}
                      className="h-1.5 w-full cursor-pointer accent-[#1e3a8a]"
                    />
                  </label>
                  <div className="flex justify-end gap-2 border-t border-[#e3eaf1] pt-2">
                    <button
                      type="button"
                      onClick={() => setCropSource('')}
                      disabled={isAvatarSaving}
                      className="rounded-md border border-[#cbd8e6] bg-white px-3 py-2 text-xs font-semibold text-[#52647b] transition hover:bg-[#f3f7fb] disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCroppedAvatarUpload}
                      disabled={isAvatarSaving || !croppedAreaPixels}
                      className="inline-flex items-center gap-2 rounded-md bg-[#1e3a8a] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#172e6e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAvatarSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isAvatarSaving ? 'Uploading...' : 'Save cropped photo'}
                    </button>
                  </div>
                </section>
              )}

              {avatarMessage && (
                <p role={avatarMessage.type === 'error' ? 'alert' : 'status'} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] font-medium ${avatarMessage.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                  {avatarMessage.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  {avatarMessage.text}
                </p>
              )}
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3 rounded-lg border border-[#dce5ef] p-3.5 sm:p-4">
                <div className="border-b border-[#e3eaf1] pb-2">
                  <div className="flex items-center gap-2 text-[#1e3a8a]">
                    <KeyRound className="h-4 w-4" />
                    <h3 className="text-sm font-bold text-[#25354d]">Change password</h3>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#69788d]">Confirm your current password to set a new one.</p>
                </div>

                <div>
                  <label htmlFor="profile-current-password" className="mb-1 block text-xs font-semibold text-[#52647b]">Current password</label>
                  <input id="profile-current-password" name="currentPassword" type="password" autoComplete="current-password" required value={passwordFields.currentPassword} onChange={(event) => setPasswordFields((fields) => ({ ...fields, currentPassword: event.target.value }))} className="w-full rounded-md border border-[#ced8e4] bg-white px-3 py-2 text-sm text-[#17243b] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="profile-new-password" className="mb-1 block text-xs font-semibold text-[#52647b]">New password</label>
                    <input id="profile-new-password" name="newPassword" type="password" autoComplete="new-password" minLength={8} required value={passwordFields.newPassword} onChange={(event) => setPasswordFields((fields) => ({ ...fields, newPassword: event.target.value }))} className="w-full rounded-md border border-[#ced8e4] bg-white px-3 py-2 text-sm text-[#17243b] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15" />
                  </div>
                  <div>
                    <label htmlFor="profile-confirm-password" className="mb-1 block text-xs font-semibold text-[#52647b]">Confirm new password</label>
                    <input id="profile-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required value={passwordFields.confirmPassword} onChange={(event) => setPasswordFields((fields) => ({ ...fields, confirmPassword: event.target.value }))} className="w-full rounded-md border border-[#ced8e4] bg-white px-3 py-2 text-sm text-[#17243b] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15" />
                  </div>
                </div>

                {passwordMessage && (
                  <p role={passwordMessage.type === 'error' ? 'alert' : 'status'} className={`flex items-center gap-2 rounded-md border px-3 py-2 text-[11px] font-medium ${passwordMessage.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                    {passwordMessage.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                    {passwordMessage.text}
                  </p>
                )}

                <div className="flex justify-end border-t border-[#e3eaf1] pt-2">
                  <button type="submit" disabled={isPasswordSaving} className="inline-flex items-center gap-2 rounded-md bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#172e6e] disabled:cursor-not-allowed disabled:opacity-60">
                    {isPasswordSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPasswordSaving ? 'Updating...' : 'Update password'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;