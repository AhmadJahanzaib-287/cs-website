import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Building2,
  GraduationCap,
  Bell,
  Shield,
  Server,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Trash2,
  Mail,
  Phone,
  Globe,
  Sliders,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const SETTINGS_TABS = [
  { id: 'general', label: 'Department Profile', icon: Building2 },
  { id: 'academic', label: 'Academic & Admissions', icon: GraduationCap },
  { id: 'announcements', label: 'Alerts & Notices', icon: Bell },
  { id: 'security', label: 'Admin & Security', icon: Shield },
  { id: 'system', label: 'System & Maintenance', icon: Server },
];

const BACKUP_SETTING_FIELDS = [
  'departmentName', 'shortCode', 'universityName', 'campusLocation', 'contactEmail', 'contactPhone',
  'websiteUrl', 'departmentHead', 'currentAcademicSession', 'activeSemesters', 'defaultClassCapacity',
  'admissionPortalOpen', 'admissionDeadline', 'studentApplicationsAcceptance', 'emergencyNoticeActive',
  'emergencyNoticeText', 'contactEmailNotifications', 'sessionTimeoutMinutes', 'maintenanceMode', 'systemBackupEmail',
];

const AdminSettingsPanel = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const backupInputRef = useRef(null);

  // Portal Settings State
  const [settings, setSettings] = useState({
    departmentName: 'Department of Computer Science',
    shortCode: 'DCS - UAF',
    universityName: 'University of Agriculture, Faisalabad (PARS Campus)',
    campusLocation: 'Sub Campus PARS, Jhang Road, Faisalabad, Pakistan',
    contactEmail: 'cs@uaf.edu.pk',
    contactPhone: '+92 41 9200161-70',
    websiteUrl: 'https://dcs.uaf.edu.pk',
    departmentHead: 'Prof. Dr. Chairperson DCS',
    currentAcademicSession: 'Fall 2026',
    activeSemesters: ['1st', '3rd', '5th', '7th'],
    defaultClassCapacity: 50,
    admissionPortalOpen: true,
    admissionDeadline: '2026-11-15',
    studentApplicationsAcceptance: true,
    emergencyNoticeActive: false,
    emergencyNoticeText: 'Admissions are open for Fall 2026 session. Apply online before Oct 30.',
    contactEmailNotifications: true,
    sessionTimeoutMinutes: 120,
    maintenanceMode: false,
    systemBackupEmail: 'admin@uaf.edu.pk',
  });

  // Password change state
  const [passwordFields, setPasswordFields] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [invitationSaving, setInvitationSaving] = useState(false);
  const [invitationAlert, setInvitationAlert] = useState(null);

  // System counts
  const [systemStats, setSystemStats] = useState({
    studentsCount: 0,
    facultyCount: 0,
    applicationsCount: 0,
    noticesCount: 0,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/settings');
      if (res.data.success && res.data.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const [stuRes, facRes, appRes, notRes] = await Promise.allSettled([
        API.get('/students/stats'),
        API.get('/faculty'),
        API.get('/applications'),
        API.get('/notices'),
      ]);

      setSystemStats({
        studentsCount: stuRes.status === 'fulfilled' ? stuRes.value.data?.stats?.total || 0 : 0,
        facultyCount: facRes.status === 'fulfilled' ? facRes.value.data?.data?.length || 0 : 0,
        applicationsCount: appRes.status === 'fulfilled' ? appRes.value.data?.stats?.total || 0 : 0,
        noticesCount: notRes.status === 'fulfilled' ? notRes.value.data?.data?.length || 0 : 0,
      });
    } catch (err) {
      console.error('Error fetching system stats:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchSystemStats();
  }, []);

  const handleInputChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSemesterToggle = (sem) => {
    setSettings((prev) => {
      const current = prev.activeSemesters || [];
      const exists = current.includes(sem);
      return {
        ...prev,
        activeSemesters: exists ? current.filter((s) => s !== sem) : [...current, sem],
      };
    });
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setAlert(null);

    try {
      const res = await API.put('/settings', settings);
      if (res.data.success) {
        setSettings(res.data.data);
        window.dispatchEvent(new CustomEvent('portal-settings-updated', { detail: res.data.data }));
        setAlert({ type: 'success', message: 'Settings saved and updated successfully!' });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    if (passwordFields.newPassword.length < 8) {
      setPasswordAlert({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await API.put('/auth/password', {
        currentPassword: passwordFields.currentPassword,
        newPassword: passwordFields.newPassword,
      });

      if (res.data.success) {
        setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordAlert({ type: 'success', message: 'Password updated successfully!' });
      }
    } catch (err) {
      console.error('Password change error:', err);
      setPasswordAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    setInvitationAlert(null);
    setInvitationSaving(true);
    try {
      const { data } = await API.post('/auth/admin-invitations', { email: invitationEmail });
      setInvitationEmail('');
      setInvitationAlert({ type: 'success', message: data.message });
    } catch (err) {
      setInvitationAlert({
        type: 'error',
        message: err.response?.data?.message || 'Could not send the invitation.',
      });
    } finally {
      setInvitationSaving(false);
    }
  };

  const handleExportSystemBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      exportedBy: user?.email,
      settings,
      systemStats,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DCS_Portal_Config_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSystemBackup = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const backup = JSON.parse(await file.text());
      const source = backup.settings;
      if (!source || typeof source !== 'object' || Array.isArray(source)) {
        throw new Error('This file does not contain portal settings.');
      }

      const importedSettings = Object.fromEntries(
        BACKUP_SETTING_FIELDS
          .filter((field) => Object.hasOwn(source, field))
          .map((field) => [field, source[field]])
      );
      if (!Object.keys(importedSettings).length) {
        throw new Error('No recognized portal settings were found in this backup.');
      }

      setSettings((current) => ({ ...current, ...importedSettings }));
      setAlert({ type: 'success', message: 'Backup settings loaded. Review them, then select Save All Settings to apply.' });
    } catch (error) {
      setAlert({ type: 'error', message: error.message || 'Could not read the selected backup file.' });
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear this browser tab\'s session storage? This does not log you out or clear cookies.')) {
      sessionStorage.clear();
      setAlert({ type: 'success', message: 'This tab\'s session storage was cleared.' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 border-b border-[#d5e1ec] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase text-[#0e7490]">
            <span className="h-px w-7 bg-[#0e7490]" /> System Preferences & Portal Configuration
          </p>
          <h2 className="text-2xl font-extrabold text-[#17243b] sm:text-3xl">Portal Settings</h2>
          <p className="mt-1.5 text-sm text-[#69788d]">
            Configure department metadata, academic sessions, admission portal status, alerts, and security.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#1e3a8a] px-5 text-xs font-bold text-white shadow-xs transition hover:bg-[#172e6e] disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{saving ? 'Saving Changes...' : 'Save All Settings'}</span>
        </button>
      </div>

      {/* Alert Notice */}
      {alert && (
        <div
          className={`flex items-center justify-between rounded-lg border px-4 py-3 text-xs font-semibold ${
            alert.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{alert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Main Layout: Sidebar Tabs + Content Area ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-[#dce5ef] bg-white p-2 shadow-xs">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
              Settings Sections
            </p>
            <nav className="space-y-1">
              {SETTINGS_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${
                      isActive
                        ? 'bg-[#1e3a8a] text-white shadow-xs'
                        : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#17243b]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-cyan-200' : 'text-[#64748b]'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick summary info in sidebar */}
            <div className="mt-4 border-t border-[#f1f5f9] p-3 text-[11px] text-[#64748b]">
              <div className="flex items-center justify-between py-1">
                <span>Active Session:</span>
                <strong className="text-[#17243b]">{settings.currentAcademicSession}</strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Admission Portal:</span>
                <span
                  className={`font-bold ${
                    settings.admissionPortalOpen ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {settings.admissionPortalOpen ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-9">
          <div className="rounded-xl border border-[#dce5ef] bg-white p-6 shadow-xs">
            {/* ── 1. General & Department Profile ── */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-[#17243b]">Department & Institute Profile</h3>
                  <p className="mt-0.5 text-xs text-[#69788d]">
                    These details appear across public headers, contact pages, and generated PDF reports.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">
                      Department Official Title
                    </label>
                    <input
                      type="text"
                      value={settings.departmentName}
                      onChange={(e) => handleInputChange('departmentName', e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">Department Acronym</label>
                    <input
                      type="text"
                      value={settings.shortCode}
                      onChange={(e) => handleInputChange('shortCode', e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">Chairperson / Head of Dept</label>
                    <input
                      type="text"
                      value={settings.departmentHead}
                      onChange={(e) => handleInputChange('departmentHead', e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">University / Campus Name</label>
                    <input
                      type="text"
                      value={settings.universityName}
                      onChange={(e) => handleInputChange('universityName', e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">Campus Physical Address</label>
                    <input
                      type="text"
                      value={settings.campusLocation}
                      onChange={(e) => handleInputChange('campusLocation', e.target.value)}
                      className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">Official Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94a3b8]" />
                      <input
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        className="w-full rounded-md border border-[#cbd5e1] py-2 pl-9 pr-3 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">Helpline Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94a3b8]" />
                      <input
                        type="text"
                        value={settings.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        className="w-full rounded-md border border-[#cbd5e1] py-2 pl-9 pr-3 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">Official Portal Website URL</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#94a3b8]" />
                      <input
                        type="url"
                        value={settings.websiteUrl}
                        onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                        className="w-full rounded-md border border-[#cbd5e1] py-2 pl-9 pr-3 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. Academic & Admissions Settings ── */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#17243b]">Academic Sessions & Admission Control</h3>
                  <p className="mt-0.5 text-xs text-[#69788d]">
                    Govern active terms, online admission portals, and student application intake.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">
                      Current Academic Session
                    </label>
                    <input
                      type="text"
                      value={settings.currentAcademicSession}
                      onChange={(e) => handleInputChange('currentAcademicSession', e.target.value)}
                      placeholder="e.g. Fall 2026 or Spring 2027"
                      className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">
                      Default Maximum Class Capacity
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={200}
                      value={settings.defaultClassCapacity}
                      onChange={(e) => handleInputChange('defaultClassCapacity', Number(e.target.value))}
                      className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                    />
                  </div>

                  {/* Active Semesters Pills */}
                  <div className="sm:col-span-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4">
                    <label className="mb-2 block text-xs font-semibold text-[#475569]">
                      Active Semesters in Session
                    </label>
                    <p className="text-[11px] text-[#64748b] mb-3">
                      Select which semesters are currently conducting classes:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'].map((sem) => {
                        const isSelected = (settings.activeSemesters || []).includes(sem);
                        return (
                          <button
                            key={sem}
                            type="button"
                            onClick={() => handleSemesterToggle(sem)}
                            className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                              isSelected
                                ? 'bg-[#1e3a8a] text-white shadow-xs'
                                : 'bg-white border border-[#cbd5e1] text-[#64748b] hover:bg-[#edf2f7]'
                            }`}
                          >
                            {sem} Semester {isSelected && '✓'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admissions toggle card */}
                  <div className="sm:col-span-2 rounded-lg border border-[#e2e8f0] p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#17243b]">Admission Portal Open / Closed</p>
                        <p className="text-[11px] text-[#64748b]">
                          Controls whether prospective students can view admission forms on the public site.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.admissionPortalOpen}
                          onChange={(e) => handleInputChange('admissionPortalOpen', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0e7490]"></div>
                      </label>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#475569]">
                        Admission Application Deadline
                      </label>
                      <input
                        type="date"
                        value={settings.admissionDeadline}
                        onChange={(e) => handleInputChange('admissionDeadline', e.target.value)}
                        className="rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
                      />
                    </div>
                  </div>

                  {/* Application generation acceptance */}
                  <div className="sm:col-span-2 rounded-lg border border-[#e2e8f0] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#17243b]">Accept Student Applications</p>
                      <p className="text-[11px] text-[#64748b]">
                        Allow enrolled students to submit character certificate, leave, and bonafide requests.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.studentApplicationsAcceptance}
                        onChange={(e) => handleInputChange('studentApplicationsAcceptance', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e3a8a]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. Alerts & Public Notices ── */}
            {activeTab === 'announcements' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#17243b]">Portal Announcements & Notifications</h3>
                  <p className="mt-0.5 text-xs text-[#69788d]">
                    Manage the top ticker marquee alert, public popups, and department communication triggers.
                  </p>
                </div>

                {/* Emergency Ticker Switch */}
                <div className="rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-amber-600" />
                      <div>
                        <p className="text-xs font-bold text-[#17243b]">Emergency Banner / Marquee Ticker</p>
                        <p className="text-[11px] text-[#64748b]">
                          Show a prominent banner across the top of the DCS website for urgent updates.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emergencyNoticeActive}
                        onChange={(e) => handleInputChange('emergencyNoticeActive', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">
                      Ticker Notice Text
                    </label>
                    <textarea
                      rows={2}
                      value={settings.emergencyNoticeText}
                      onChange={(e) => handleInputChange('emergencyNoticeText', e.target.value)}
                      placeholder="e.g. Midterm examinations commence from next Monday. All students must collect roll slips."
                      className="w-full rounded-md border border-[#cbd5e1] p-3 text-xs font-medium text-[#1e293b] outline-none transition focus:border-[#0e7490]"
                    />
                  </div>
                </div>

                {/* Email notification switch */}
                <div className="rounded-xl border border-[#cbd5e1] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#17243b]">Accept Public Contact Messages</p>
                    <p className="text-[11px] text-[#64748b]">
                      Allow visitors to submit messages that are saved in the admin inbox. Email delivery is not configured.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.contactEmailNotifications}
                      onChange={(e) => handleInputChange('contactEmailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0e7490]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* ── 4. Admin Account & Security ── */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#17243b]">Admin Security & Authentication</h3>
                  <p className="mt-0.5 text-xs text-[#69788d]">
                    Update your login credentials and configure administrative session timeouts.
                  </p>
                </div>

                {/* Active Admin Profile Card */}
                <div className="flex items-center justify-between rounded-xl border border-[#cbd5e1] bg-[#f8fafc] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
                      {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#17243b]">{user?.name}</p>
                      <p className="text-[11px] text-[#64748b]">{user?.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-800">
                        {user?.role?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {user?.role === 'superadmin' && (
                  <form onSubmit={handleInviteAdmin} className="space-y-4 rounded-xl border border-[#cbd5e1] p-5">
                    <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3 text-sm font-semibold text-[#1e3a8a]">
                      <Mail className="h-4 w-4" />
                      <span>Invite an administrator</span>
                    </div>
                    <p className="text-xs leading-5 text-[#64748b]">
                      Send a single-use setup link to their email. They will choose their username and password; the link expires in 24 hours.
                    </p>
                    {invitationAlert && (
                      <div
                        role={invitationAlert.type === 'error' ? 'alert' : 'status'}
                        className={`rounded-lg border px-3 py-2.5 text-xs ${
                          invitationAlert.type === 'error'
                            ? 'border-rose-200 bg-rose-50 text-rose-800'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {invitationAlert.message}
                      </div>
                    )}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <label className="sr-only" htmlFor="admin-invitation-email">New administrator email</label>
                      <input
                        id="admin-invitation-email"
                        type="email"
                        autoComplete="email"
                        required
                        maxLength={254}
                        value={invitationEmail}
                        onChange={(e) => setInvitationEmail(e.target.value)}
                        placeholder="new-admin@example.com"
                        className="min-w-0 flex-1 rounded-lg border border-[#cbd5e1] px-3 py-2.5 text-sm outline-none focus:border-[#0e7490]"
                      />
                      <button
                        type="submit"
                        disabled={invitationSaving}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#172e6e] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {invitationSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                        {invitationSaving ? 'Sending…' : 'Send setup link'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Change Password Form */}
                <form onSubmit={handlePasswordSubmit} className="rounded-xl border border-[#cbd5e1] p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3 text-xs font-bold text-[#1e3a8a]">
                    <KeyRound className="h-4 w-4" />
                    <span>Change Admin Password</span>
                  </div>

                  {passwordAlert && (
                    <div
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                        passwordAlert.type === 'error'
                          ? 'border-rose-200 bg-rose-50 text-rose-800'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {passwordAlert.type === 'error' ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                      <span>{passwordAlert.message}</span>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#475569]">Current Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordFields.currentPassword}
                      onChange={(e) =>
                        setPasswordFields((prev) => ({ ...prev, currentPassword: e.target.value }))
                      }
                      className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#475569]">New Password *</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={passwordFields.newPassword}
                        onChange={(e) =>
                          setPasswordFields((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#475569]">Confirm New Password *</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={8}
                        value={passwordFields.confirmPassword}
                        onChange={(e) =>
                          setPasswordFields((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        className="w-full rounded-md border border-[#cbd5e1] px-3 py-2 text-xs font-medium text-[#1e293b]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="inline-flex items-center gap-1.5 text-xs text-[#64748b] hover:text-[#1e293b]"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                    </button>

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#1e3a8a] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#172e6e] disabled:opacity-60"
                    >
                      {passwordSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Update Password</span>
                    </button>
                  </div>
                </form>

                {/* Session Timeout */}
                <div className="rounded-xl border border-[#cbd5e1] p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#17243b]">Admin Session Inactivity Timeout</p>
                    <p className="text-[11px] text-[#64748b]">
                      Automatically expire idle dashboard sessions for security.
                    </p>
                  </div>
                  <select
                    value={settings.sessionTimeoutMinutes}
                    onChange={(e) => handleInputChange('sessionTimeoutMinutes', Number(e.target.value))}
                    className="rounded-md border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-medium text-[#1e293b]"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={120}>2 Hours</option>
                    <option value={720}>12 Hours</option>
                    <option value={1440}>24 Hours</option>
                  </select>
                </div>
              </div>
            )}

            {/* ── 5. System & Maintenance ── */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[#17243b]">System Operations & Maintenance</h3>
                  <p className="mt-0.5 text-xs text-[#69788d]">
                    Database metrics, maintenance switch, and full configuration backups.
                  </p>
                </div>

                {/* Database Metrics */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-center">
                    <p className="text-[11px] font-semibold text-[#64748b]">Students Enrolled</p>
                    <p className="mt-1 text-xl font-extrabold text-[#17243b]">{systemStats.studentsCount}</p>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-center">
                    <p className="text-[11px] font-semibold text-[#64748b]">Faculty Profiles</p>
                    <p className="mt-1 text-xl font-extrabold text-[#17243b]">{systemStats.facultyCount}</p>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-center">
                    <p className="text-[11px] font-semibold text-[#64748b]">Applications Logged</p>
                    <p className="mt-1 text-xl font-extrabold text-[#17243b]">{systemStats.applicationsCount}</p>
                  </div>
                  <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-center">
                    <p className="text-[11px] font-semibold text-[#64748b]">Department Notices</p>
                    <p className="mt-1 text-xl font-extrabold text-[#17243b]">{systemStats.noticesCount}</p>
                  </div>
                </div>

                {/* Maintenance Mode Toggle */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-rose-900">Portal Maintenance Mode</p>
                    <p className="text-[11px] text-rose-700">
                      When enabled, public visitors will see a "Under Maintenance" splash screen while admins can still log in.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {/* Backup & Purge Tools */}
                <div className="rounded-xl border border-[#cbd5e1] p-4 space-y-3">
                  <p className="text-xs font-bold text-[#17243b]">Diagnostics & Backup Actions</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={backupInputRef}
                      type="file"
                      accept="application/json,.json"
                      onChange={handleImportSystemBackup}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={handleExportSystemBackup}
                      className="inline-flex items-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs font-bold text-[#17243b] shadow-xs hover:bg-[#f8fafc]"
                    >
                      <Download className="h-4 w-4 text-[#0e7490]" />
                      <span>Download Config Backup (JSON)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => backupInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs font-bold text-[#17243b] shadow-xs hover:bg-[#f8fafc]"
                    >
                      <RefreshCw className="h-4 w-4 text-[#0e7490]" />
                      <span>Import Config Backup</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearCache}
                      className="inline-flex items-center gap-2 rounded-md border border-[#cbd5e1] bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4 text-rose-600" />
                      <span>Purge Local Portal Cache</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPanel;
