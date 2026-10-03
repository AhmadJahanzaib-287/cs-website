import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const getScrollY = () =>
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

    const handleScroll = () => {
      const y = getScrollY();
      setVisible(y > 30); // very small threshold — shows as soon as Hero starts moving
    };

    // Listen on multiple targets so it works no matter which element actually scrolls
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    // Check once immediately in case the page is already scrolled on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
          // Starts fully off-screen to the left, slides RIGHT into its resting spot.
          initial={{ x: -1200, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -1200, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          // Fixed to the viewport, sits near the bottom-RIGHT corner, above other content.
          className="fixed bottom-16 right-10 lg:right-16 z-[999] flex h-14 w-14 items-center justify-center rounded-full border border-[#cbd8e6] bg-white/95 text-[#1e3a8a] shadow-lg shadow-[#1e3a8a]/15 backdrop-blur-md transition-colors hover:border-[#0e7490] hover:bg-[#1e3a8a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490]"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}