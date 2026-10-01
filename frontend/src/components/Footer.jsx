import React from 'react';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Degrees Offered', href: '#programs' },
    { label: 'Class Formation', href: '#programs' },
    { label: 'Campus Life', href: '#about' },
    { label: 'Announcements', href: '#notices' },
    { label: 'Application Generator', href: '/applications' },
    { label: 'Downloads', href: '/downloads' },
    { label: 'Contact Us', href: '#contact' },
  ];

  return (
    <footer className="w-full bg-[#303078] text-indigo-50 relative z-10">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1.5fr_0.8fr] gap-10 lg:gap-14">
          <div>
            <div className="flex items-start gap-4">
              <img
                src="/dcs-logo.png"
                alt="Department of Computer Science logo"
                className="w-16 h-16 object-contain shrink-0"
              />
              <div>
                <h2 className="text-xl font-bold leading-tight text-white">
                  Department of Computer Science
                </h2>
                <p className="mt-1 text-base text-indigo-100 leading-snug">
                  University of Agriculture, Faisalabad
                </p>
              </div>
            </div>
            <div className="h-px bg-indigo-200/25 my-7" />
            <p className="max-w-sm text-sm leading-7 text-indigo-100/90">
              The Department of Computer Science (PARS) is committed to excellence in teaching, research, and innovation, preparing students to become skilled professionals and future technology leaders.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-5">Quick Links</h3>
            <nav className="grid grid-cols-1 gap-2.5">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="w-fit text-sm text-indigo-100 hover:text-white hover:translate-x-1 transition-transform duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-5">Contact Information</h3>
            <div className="space-y-5 text-sm text-indigo-100">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-indigo-200" />
                <span>Department of Computer Science, University of Agriculture (PARS), Faisalabad, Pakistan.</span>
              </div>
              <a href="tel:+92419200161" className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone className="w-5 h-5 shrink-0 text-indigo-200" />
                <span>+92 41 9200161 (Ext. 5052, 5040)</span>
              </a>
              <a href="mailto:arsal.mahmood@uaf.edu.pk" className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail className="w-5 h-5 shrink-0 text-indigo-200" />
                <span>arsal.mahmood@uaf.edu.pk</span>
              </a>
              <div className="flex items-center gap-3">
                <Clock3 className="w-5 h-5 shrink-0 text-indigo-200" />
                <span>Monday - Friday | 8:00 AM - 4:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-5">Follow Us</h3>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="w-12 h-12 rounded-full border border-indigo-200/50 flex items-center justify-center text-lg font-bold hover:bg-white hover:text-[#303078] transition-colors">
                f
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="w-12 h-12 rounded-full border border-indigo-200/50 flex items-center justify-center text-lg font-bold hover:bg-white hover:text-[#303078] transition-colors">
                ig
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="w-12 h-12 rounded-full border border-indigo-200/50 flex items-center justify-center text-sm font-bold hover:bg-white hover:text-[#303078] transition-colors">
                in
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-indigo-200/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-indigo-100">
          <p>© {new Date().getFullYear()} Department of Computer Science, UAF. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span className="text-indigo-200/60">|</span>
            <a href="#terms" className="hover:text-white transition-colors">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}