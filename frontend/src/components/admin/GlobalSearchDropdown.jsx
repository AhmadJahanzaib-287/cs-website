import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  Loader2,
  GraduationCap,
  Users,
  Bell,
  BriefcaseBusiness,
  Layers,
  Download,
  Eye,
  Edit2,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';
import API from '../../api/axios';

const CATEGORY_CONFIG = {
  all: { label: 'All', icon: Sparkles, color: 'text-[#1e3a8a] bg-blue-50' },
  students: { label: 'Students', icon: GraduationCap, color: 'text-emerald-700 bg-emerald-50' },
  faculty: { label: 'Faculty', icon: Users, color: 'text-[#1e3a8a] bg-blue-50' },
  notices: { label: 'Notices', icon: Bell, color: 'text-amber-700 bg-amber-50' },
  applications: { label: 'Applications', icon: BriefcaseBusiness, color: 'text-[#0e7490] bg-[#e8f5f6]' },
  workload: { label: 'Workload', icon: Layers, color: 'text-purple-700 bg-purple-50' },
  downloads: { label: 'Downloads', icon: Download, color: 'text-cyan-700 bg-cyan-50' },
};

const GlobalSearchDropdown = ({ onNavigate, onViewItem, onEditItem }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    students: [],
    faculty: [],
    notices: [],
    applications: [],
    workload: [],
    downloads: [],
  });
  const [totalMatches, setTotalMatches] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Global Keyboard shortcut: Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Outside click to close
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const executeSearch = useCallback(async (searchQuery) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setResults({
        students: [],
        faculty: [],
        notices: [],
        applications: [],
        workload: [],
        downloads: [],
      });
      setTotalMatches(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get('/search', { params: { q: trimmed } });
      if (res.data.success) {
        setResults(res.data.results);
        setTotalMatches(res.data.totalMatches);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(value);
    }, 220);
  };

  const handleClear = () => {
    setQuery('');
    setResults({
      students: [],
      faculty: [],
      notices: [],
      applications: [],
      workload: [],
      downloads: [],
    });
    setTotalMatches(0);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleItemNavigate = (item) => {
    setIsOpen(false);
    if (onNavigate) {
      onNavigate(item.tab, item);
    }
  };

  const handleItemView = (e, item) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onViewItem) {
      onViewItem(item);
    }
  };

  const handleItemEdit = (e, item) => {
    e.stopPropagation();
    setIsOpen(false);
    if (onEditItem) {
      onEditItem(item);
    }
  };

  // Filter items based on active category
  const filteredList = [];
  const categoriesToScan = activeCategory === 'all'
    ? ['students', 'faculty', 'notices', 'applications', 'workload', 'downloads']
    : [activeCategory];

  categoriesToScan.forEach((cat) => {
    const items = results[cat] || [];
    items.forEach((item) => filteredList.push(item));
  });

  const getCategoryCount = (cat) => {
    if (cat === 'all') return totalMatches;
    return (results[cat] || []).length;
  };

  const getItemIcon = (category) => {
    switch (category) {
      case 'students': return GraduationCap;
      case 'faculty': return Users;
      case 'notices': return Bell;
      case 'applications': return BriefcaseBusiness;
      case 'workload': return Layers;
      case 'downloads': return Download;
      default: return Sparkles;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md xl:max-w-lg">
      {/* Search Input Bar */}
      <div
        className={`flex items-center gap-2 rounded-lg border bg-[#f7fafc] px-3 py-2 transition-all ${
          isOpen
            ? 'border-[#0e7490] bg-white shadow-md ring-2 ring-[#0e7490]/15'
            : 'border-[#dce5ef] hover:border-[#b9c9d8]'
        }`}
      >
        <Search className={`h-4 w-4 shrink-0 ${isOpen ? 'text-[#0e7490]' : 'text-[#8290a3]'}`} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim() || totalMatches > 0) setIsOpen(true);
          }}
          placeholder="Search students, notices, faculty, workload..."
          aria-label="Universal admin search"
          className="w-full border-none bg-transparent text-xs font-medium text-[#25354d] outline-none placeholder:text-[#91a0b3]"
        />

        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#0e7490]" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded p-0.5 text-[#8290a3] transition hover:bg-[#e2e8f0] hover:text-[#17243b]"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden select-none items-center gap-0.5 rounded border border-[#cbd5e1] bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#8290a3] sm:inline-flex">
            <span>Ctrl</span><span>K</span>
          </kbd>
        )}
      </div>

      {/* Floating Results Flyout Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[82vh] overflow-hidden rounded-xl border border-[#dce5ef] bg-white shadow-2xl transition-all sm:min-w-[540px]">
          {/* Header Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#e3eaf1] bg-[#f8fafc] p-2.5 text-xs">
            {Object.keys(CATEGORY_CONFIG).map((catKey) => {
              const cfg = CATEGORY_CONFIG[catKey];
              const count = getCategoryCount(catKey);
              const isActive = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                    isActive
                      ? 'bg-[#1e3a8a] text-white shadow-xs'
                      : 'text-[#64748b] hover:bg-[#edf2f7] hover:text-[#17243b]'
                  }`}
                >
                  <span>{cfg.label}</span>
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-[#e2e8f0] text-[#475569]'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Result List */}
          <div className="max-h-[56vh] divide-y divide-[#f1f5f9] overflow-y-auto p-1.5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-xs font-semibold text-[#0e7490]">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Searching directory across department records...</span>
              </div>
            ) : filteredList.length > 0 ? (
              filteredList.map((item) => {
                const IconComponent = getItemIcon(item.category);
                return (
                  <div
                    key={item.category + item.id}
                    onClick={() => handleItemNavigate(item)}
                    className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg p-2.5 transition hover:bg-[#f3f7fb]"
                  >
                    {/* Left Icon + Title/Subtitle */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          CATEGORY_CONFIG[item.category]?.color || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-xs font-bold text-[#17243b] group-hover:text-[#1e3a8a]">
                            {item.title}
                          </p>
                          <span
                            className={`rounded-full px-2 py-0.2 text-[9px] font-extrabold uppercase tracking-wider ${
                              item.badgeColor === 'emerald'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.badgeColor === 'rose'
                                ? 'bg-rose-100 text-rose-800'
                                : item.badgeColor === 'amber'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.badge}
                          </span>
                        </div>

                        <p className="truncate text-[11px] text-[#64748b]">
                          <span className="font-semibold text-[#0e7490]">[{item.categoryLabel}]</span>{' '}
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right Action Controls: View, Edit, Navigate */}
                    <div className="flex shrink-0 items-center gap-1 opacity-90 transition group-hover:opacity-100">
                      {/* View Button */}
                      <button
                        type="button"
                        onClick={(e) => handleItemView(e, item)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#cbd5e1] bg-white px-2 py-1 text-[11px] font-semibold text-[#475569] shadow-2xs transition hover:border-[#0e7490] hover:bg-[#eef8fa] hover:text-[#0e7490]"
                        title="View details"
                      >
                        <Eye className="h-3 w-3" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={(e) => handleItemEdit(e, item)}
                        className="inline-flex items-center gap-1 rounded-md border border-[#cbd5e1] bg-white px-2 py-1 text-[11px] font-semibold text-[#1e3a8a] shadow-2xs transition hover:border-[#1e3a8a] hover:bg-[#edf2fb]"
                        title="Edit record"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      {/* Navigate Direction Button */}
                      <button
                        type="button"
                        onClick={() => handleItemNavigate(item)}
                        className="inline-flex items-center gap-1 rounded-md bg-[#1e3a8a] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs transition hover:bg-[#172e6e]"
                        title={`Go to ${item.tab} section`}
                      >
                        <span>Open</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : query.trim() ? (
              <div className="py-12 text-center text-xs">
                <Search className="mx-auto mb-2 h-7 w-7 text-[#94a3b8]" />
                <p className="font-bold text-[#334155]">No matching records found for "{query}"</p>
                <p className="mt-1 text-[#64748b]">
                  Try searching by student roll number, faculty member name, notice keyword, or application ID.
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#64748b]">
                <Command className="mx-auto mb-2 h-6 w-6 text-[#94a3b8]" />
                <p className="font-semibold text-[#334155]">Type keywords to search across DCS Portal</p>
                <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                  Search students by roll number or name, faculty profiles, notices, applications, and workload.
                </p>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between border-t border-[#e2e8f0] bg-[#f8fafc] px-4 py-2 text-[11px] text-[#64748b]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#17243b]">{totalMatches}</span> matches found
            </div>
            <div className="flex items-center gap-3">
              <span>Press <kbd className="font-mono font-bold text-[#17243b]">Esc</kbd> to exit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchDropdown;

