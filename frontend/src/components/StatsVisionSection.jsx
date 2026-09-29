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
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  }
  if (priority === 'Important') {
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
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
      className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-1 tabular-nums"
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
    <section className="relative py-12 px-4 sm:px-8 bg-[#0b0f19] text-slate-100 overflow-hidden select-none min-h-[85vh] flex items-center justify-center">
      
      {/* Background Glow Orb — same style as Academic Programs section so both blend seamlessly */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      {/* Main Content Container - Confined Width for Single Screen */}
      <div className="max-w-5xl mx-auto w-full space-y-10 relative z-10 flex flex-col justify-center">
        
        {/* ================= TOP SECTION: STATS CARDS ================= */}
        <div>
          <div className="mb-6 flex justify-center w-full">
            <span className="text-xs sm:text-sm font-extrabold tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-500/10">
              Department Compact Stats
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="relative p-5 sm:p-6 rounded-2xl bg-slate-950/30 border border-slate-800 hover:border-blue-700/60 backdrop-blur-2xl shadow-xl flex flex-col items-center text-center group overflow-hidden transition-all duration-300"
                >
                  <div className="p-2.5 rounded-xl bg-blue-950 border border-blue-800/60 text-blue-400 shadow-lg mb-3">
                    <Icon className="w-5 h-5" />
                  </div>

                  <ShuffleNumber value={stat.value} delay={stat.id * 100} />

                  <p className="text-xs font-bold text-slate-200">
                    {stat.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {stat.subtitle}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM SECTION: VISION & ANNOUNCEMENTS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Vision — plain flowing text, no card/panel treatment */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-7 px-1 sm:px-2 py-2"
          >
            <div className="flex items-center gap-2.5 text-cyan-400 mb-4">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Our Vision & Educational Mission
              </h2>
            </div>

            <p className="text-slate-300 text-xs sm:text-[13px] leading-relaxed font-normal max-w-xl">
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
            className="md:col-span-5 rounded-2xl bg-slate-950/30 border border-slate-800/60 p-5 sm:p-6 backdrop-blur-2xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60 flex-wrap gap-1">
              <div className="flex items-center gap-2 text-amber-400">
                <Bell className="w-5 h-5 animate-bounce" />
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  Notices Feed
                </h3>
              </div>
            </div>

            {notices.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No active notices right now.
              </p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {notices.map((item) => {
                  const urgencyStyle = getUrgencyStyle(item.priority);
                  return (
                    <div 
                      key={item._id}
                      onClick={() => setSelectedNotice(item)}
                      className="p-3 rounded-lg bg-slate-900/30 border border-slate-800/50 hover:border-cyan-500/30 transition-all duration-200 cursor-pointer group backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {new Date(item.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: '2-digit',
                          })}
                        </span>
                        {urgencyStyle && (
                          <span className={`px-1.5 py-0.2 text-[8px] font-bold rounded-sm border ${urgencyStyle}`}>
                            {item.priority}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[11px] font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                    </div>
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
              className="relative w-full max-w-sm bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden"
            >
              <button
                onClick={() => setSelectedNotice(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center px-7 pt-10 pb-8 sm:px-8 sm:pt-11 sm:pb-9">
                <div className="w-16 h-16 rounded-2xl border bg-cyan-500/10 border-cyan-500/30 flex items-center justify-center mb-5">
                  <Bell className="w-8 h-8 text-cyan-400" />
                </div>

                <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border bg-slate-800/60 text-slate-300 border-slate-700 mb-4">
                  {selectedNotice.priority} Announcement
                </span>

                <h3 className="text-lg font-black text-white mb-2.5 leading-snug">
                  {selectedNotice.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">
                  {selectedNotice.description}
                </p>

                {selectedNotice.linkUrl && (
                  <a
                    href={selectedNotice.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition mb-5"
                  >
                    {selectedNotice.linkText || 'Click here for further information'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}

                <p className="text-[11px] text-slate-500 font-mono border-t border-slate-800/80 pt-4 w-full">
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