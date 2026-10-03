import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  GraduationCap, 
  Award, 
  Building2, 
  Bell, 
  Target, 
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';
import API from '../api/axios';

// 1. Compact Stats Data
const compactStatsData = [
  {
    id: 1,
    title: 'Students',
    value: '1,200+',
    subtitle: 'CS, SE, AI, IT',
    icon: Users,
  },
  {
    id: 2,
    title: 'Faculty',
    value: '35+',
    subtitle: 'PhD Scholars',
    icon: GraduationCap,
  },
  {
    id: 3,
    title: 'Labs',
    value: '14+',
    subtitle: 'Tech Hubs',
    icon: Building2,
  },
  {
    id: 4,
    title: 'Placement',
    value: '96%',
    subtitle: 'Job/Studies',
    icon: Award,
  }
];

const getUrgencyStyle = (priority) => {
  if (priority === 'Emergency') {
    return 'text-red-700 bg-red-50 border-red-200';
  }
  if (priority === 'Important') {
    return 'text-amber-800 bg-amber-50 border-amber-200';
  }
  return null;
};

// Scrambles the digits of a value (keeping "," "+" "%" in place) for a short
// burst, then locks onto the real value — plays once, the first time the
// number scrolls into view.
function ShuffleNumber({ value, delay = 0 }) {
  const [display, setDisplay] = useState(value);
  const [hasPlayed, setHasPlayed] = useState(false);

  const runShuffle = () => {
    if (hasPlayed) return;
    setHasPlayed(true);

    const totalTicks = 16;
    const tickDuration = 70;
    let tick = 0;

    const interval = setInterval(() => {
      tick += 1;
      if (tick >= totalTicks) {
        clearInterval(interval);
        setDisplay(value);
        return;
      }
      const scrambled = value.replace(/[0-9]/g, () => Math.floor(Math.random() * 10));
      setDisplay(scrambled);
    }, tickDuration);
  };

  return (
    <motion.h3
      onViewportEnter={() => setTimeout(runShuffle, delay)}
      viewport={{ once: true, amount: 0.6 }}
      className="mb-1 text-3xl font-extrabold tabular-nums text-[#17243b] sm:text-4xl"
    >
      {display}
    </motion.h3>
  );
}

export default function StatsVisionSection() {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Fetch real notices for the feed — newest posted notice appears at the top
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await API.get('/notices/public-list');
        if (response.data.success) {
          setNotices(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching notices feed:', error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#f3f7fb] px-4 py-16 text-[#17243b] sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-6xl space-y-14">
        
        {/* ================= TOP SECTION: STATS CARDS ================= */}
        <div>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#0e7490]">
                <span className="h-px w-7 bg-[#0e7490]" /> Department at a glance
              </p>
              <h2 className="text-2xl font-extrabold text-[#17243b] sm:text-3xl">A growing community of innovators</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-[#69788d]">The people, spaces, and outcomes shaping our department.</p>
          </div>

          <div className="grid grid-cols-2 border-y border-[#d5e1ec] sm:grid-cols-4">
            {compactStatsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ 
                    duration: 0.6, 
                    ease: [0.16, 1, 0.3, 1],
                    delay: stat.id * 0.1
                  }}
                  className="group flex min-h-40 flex-col items-start justify-center border-b border-[#d5e1ec] py-5 pl-3 pr-2 transition-colors hover:bg-white/45 sm:min-h-44 sm:border-b-0 sm:px-5 sm:first:pl-0 sm:last:pr-0 [&:nth-child(odd)]:border-r [&:nth-child(odd)]:border-[#d5e1ec] sm:[&:nth-child(odd)]:border-r-0 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-[#d5e1ec]"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-white text-[#1e3a8a] shadow-sm ring-1 ring-[#dce5ef] transition-colors group-hover:text-[#0e7490]">
                    <Icon className="h-4 w-4" />
                  </div>

                  <ShuffleNumber value={stat.value} delay={stat.id * 100} />

                  <p className="text-xs font-bold text-[#34435a]">
                    {stat.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#69788d]">
                    {stat.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM SECTION: VISION & ANNOUNCEMENTS ================= */}
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-12">
          
          {/* LEFT: Vision — plain flowing text, no card/panel treatment */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="py-1 md:col-span-7 md:pr-8"
          >
            <div className="mb-5 flex items-center gap-3 text-[#0e7490]">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-[#1e3a8a] shadow-sm ring-1 ring-[#dce5ef]">
                <Target className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-extrabold leading-snug text-[#17243b] sm:text-2xl">
                Our Vision & Educational Mission
              </h2>
            </div>

            <p className="max-w-2xl text-sm font-normal leading-7 text-[#58677d] sm:text-base">
              The Department of Computer Science at the University of Agriculture Faisalabad (PARS Campus)
              is dedicated to building a strong foundation of computing excellence in the region. Through
              industry-aligned curricula spanning Software Engineering, Artificial Intelligence, Cybersecurity,
              and Data Science, we equip students with the practical skills and research mindset needed to
              solve real-world problems. Our faculty and research labs actively collaborate with national and
              international partners, driving innovation in emerging technologies while nurturing the next
              generation of engineers, entrepreneurs, and researchers who will help shape Pakistan's digital
              future — one graduating class at a time.
            </p>
          </motion.div>

          {/* RIGHT: Announcements Panel — dynamic Notices Feed */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-[#d5e1ec] pt-5 md:col-span-5 md:border-l md:border-t-0 md:pl-8 md:pt-0"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#d5e1ec] pb-3">
              <div className="flex items-center gap-2.5 text-[#1e3a8a]">
                <Bell className="h-4 w-4" />
                <h3 className="text-lg font-extrabold tracking-tight text-[#17243b]">
                  Notices Feed
                </h3>
              </div>
              <span className="text-xs font-medium text-[#69788d]">Latest updates</span>
            </div>

            {notices.length === 0 ? (
              <p className="py-8 text-sm text-[#69788d]">
                No active notices right now.
              </p>
            ) : (
              <div className="max-h-[340px] divide-y divide-[#dce5ef] overflow-y-auto pr-1">
                {notices.map((item) => {
                  const urgencyStyle = getUrgencyStyle(item.priority);
                  return (
                    <button
                      key={item._id}
                      onClick={() => setSelectedNotice(item)}
                      type="button"
                      className="group w-full py-3 text-left transition-colors hover:bg-white/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#0e7490]"
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-[#69788d]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#0e7490]" />
                          {new Date(item.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                          })}
                        </span>
                        {urgencyStyle && (
                          <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-bold ${urgencyStyle}`}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold leading-snug text-[#25354d] transition-colors group-hover:text-[#0e7490]">
                        {item.title}
                      </h4>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

        </div>

      </div>

      {/* Feed Item Detail Popup */}
      <AnimatePresence>
        {selectedNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
            onClick={() => setSelectedNotice(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-xl border border-[#dce5ef] bg-white shadow-2xl"
            >
              <button
                onClick={() => setSelectedNotice(null)}
                aria-label="Close notice"
                className="absolute right-4 top-4 rounded-md p-2 text-[#69788d] transition hover:bg-[#edf3f8] hover:text-[#17243b]"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-start px-6 pb-7 pt-10 text-left sm:px-8 sm:pb-8">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md border border-[#dce5ef] bg-[#f3f7fb]">
                  <Bell className="h-5 w-5 text-[#1e3a8a]" />
                </div>

                <span className="mb-3 rounded-sm border border-[#dce5ef] bg-[#f3f7fb] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#52647b]">
                  {selectedNotice.priority} Announcement
                </span>

                <h3 className="mb-2.5 pr-8 text-xl font-extrabold leading-snug text-[#17243b]">
                  {selectedNotice.title}
                </h3>
                <p className="mb-5 whitespace-pre-wrap text-sm leading-7 text-[#58677d]">
                  {selectedNotice.description}
                </p>

                {selectedNotice.linkUrl && (
                  <a
                    href={selectedNotice.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#1e3a8a] transition hover:text-[#0e7490]"
                  >
                    {selectedNotice.linkText || 'Click here for further information'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}

                <p className="w-full border-t border-[#e3eaf1] pt-4 text-xs text-[#69788d]">
                  Posted: {new Date(selectedNotice.startDate).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}