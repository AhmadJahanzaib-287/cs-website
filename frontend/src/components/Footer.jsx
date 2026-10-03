import React, { useEffect, useRef } from 'react';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const handleWheel = (event) => {
      if (event.deltaY <= 0 || event.ctrlKey || !footerRef.current) return;

      const footerBounds = footerRef.current.getBoundingClientRect();
      const approachRange = 600;
      const distanceToFooter = footerBounds.top - window.innerHeight;

      if (distanceToFooter >= approachRange || footerBounds.bottom <= 0) return;

      let scrollDelta = event.deltaY;
      if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) scrollDelta *= 16;
      if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) scrollDelta *= window.innerHeight;

      const approachProgress = Math.max(0, Math.min(1, 1 - distanceToFooter / approachRange));
      const scrollFactor = 0.4 - approachProgress * 0.28;

      event.preventDefault();
      window.scrollBy(0, scrollDelta * scrollFactor);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
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
    <footer ref={footerRef} className="relative z-10 w-full bg-[#172e6e] text-blue-50">
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
                <p className="mt-1 text-base leading-snug text-blue-100">
                  University of Agriculture, Faisalabad
                </p>
              </div>
            </div>
            <div className="my-7 h-px bg-white/20" />
            <p className="max-w-sm text-sm leading-7 text-blue-100">
              The Department of Computer Science (PARS) is committed to excellence in teaching, research, and innovation, preparing students to become skilled professionals and future technology leaders.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-white">Quick Links</h3>
            <nav className="grid grid-cols-1 gap-2.5">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="w-fit text-sm text-blue-100 transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-white">Contact Information</h3>
            <div className="space-y-5 text-sm text-blue-100">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-200" />
                <span>Department of Computer Science, University of Agriculture (PARS), Faisalabad, Pakistan.</span>
              </div>
              <a href="tel:+92419200161" className="flex items-center gap-3 transition-colors hover:text-white">
                <Phone className="h-5 w-5 shrink-0 text-blue-200" />
                <span>+92 41 9200161 (Ext. 5052, 5040)</span>
              </a>
              <a href="mailto:arsal.mahmood@uaf.edu.pk" className="flex items-center gap-3 transition-colors hover:text-white">
                <Mail className="h-5 w-5 shrink-0 text-blue-200" />
                <span>arsal.mahmood@uaf.edu.pk</span>
              </a>
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 shrink-0 text-blue-200" />
                <span>Monday - Friday | 8:00 AM - 4:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-bold text-white">Follow Us</h3>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-lg font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-[#1e3a8a]">
                f
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-[#1e3a8a]">
                ig
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white hover:text-[#1e3a8a]">
                in
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-blue-100 sm:flex-row sm:px-8 lg:px-10">
          <p>© {new Date().getFullYear()} Department of Computer Science, UAF. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="transition-colors hover:text-white">Privacy Policy</a>
            <span className="text-blue-200/60">|</span>
            <a href="#terms" className="transition-colors hover:text-white">Terms &amp; Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}