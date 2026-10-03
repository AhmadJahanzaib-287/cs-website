import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const applicationTrend = [
  { month: 'Jan', applications: 148 },
  { month: 'Feb', applications: 172 },
  { month: 'Mar', applications: 159 },
  { month: 'Apr', applications: 208 },
  { month: 'May', applications: 194 },
  { month: 'Jun', applications: 236 },
];

const noticeSummary = [
  { name: 'Urgent', value: 3, color: '#d97706' },
  { name: 'Other active', value: 9, color: '#1e3a8a' },
];

export default function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <section className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(23,36,59,0.5)] sm:p-5 xl:col-span-8" aria-labelledby="application-trend-title">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 id="application-trend-title" className="text-sm font-bold text-[#25354d]">Application activity</h3>
            <p className="mt-1 text-xs text-[#8290a3]">Monthly volume · overview sample</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5f6] px-2.5 py-1 text-[10px] font-bold text-[#0e7490]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0e7490]" /> Last 6 months
          </span>
        </div>
        <div className="h-52 w-full sm:h-60" role="img" aria-label="Area chart showing monthly application activity from January to June">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={applicationTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="applicationTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0e7490" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#0e7490" stopOpacity={0.015} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e8eef4" strokeDasharray="3 5" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8290a3', fontSize: 11 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8290a3', fontSize: 10 }} />
              <Tooltip
                cursor={{ stroke: '#b9c9d8', strokeDasharray: '4 4' }}
                contentStyle={{ border: '1px solid #dce5ef', borderRadius: 8, color: '#25354d', fontSize: 12 }}
                labelStyle={{ color: '#69788d', marginBottom: 4 }}
              />
              <Area type="monotone" dataKey="applications" name="Applications" stroke="#0e7490" strokeWidth={3} fill="url(#applicationTrendFill)" activeDot={{ r: 5, fill: '#1e3a8a', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-[#dce5ef] bg-white p-4 shadow-[0_8px_24px_-22px_rgba(23,36,59,0.5)] sm:p-5 xl:col-span-4" aria-labelledby="notice-summary-title">
        <div className="mb-1">
          <h3 id="notice-summary-title" className="text-sm font-bold text-[#25354d]">Notice summary</h3>
          <p className="mt-1 text-xs text-[#8290a3]">Urgency breakdown · current overview</p>
        </div>
        <div className="relative mx-auto h-48 w-full max-w-[260px]" role="img" aria-label="Donut chart showing 3 urgent and 9 other active notices">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={noticeSummary} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="88%" paddingAngle={4} stroke="none" startAngle={90} endAngle={-270}>
                {noticeSummary.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ border: '1px solid #dce5ef', borderRadius: 8, color: '#25354d', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold tabular-nums text-[#17243b]">12</span>
            <span className="mt-0.5 text-[10px] font-semibold uppercase text-[#8290a3]">Active notices</span>
          </div>
        </div>
        <div className="flex justify-center gap-5 border-t border-[#edf1f5] pt-3">
          {noticeSummary.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-xs text-[#52647b]">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span><strong className="font-bold text-[#25354d]">{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
