import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, AlertCircle } from 'lucide-react';

/**
 * ReusableComboBox Component
 *
 * An independent, modular, and reusable combobox (searchable select dropdown) component.
 * Features glassmorphism styling, keyboard/click selection, search filtering,
 * React Portal positioning (preventing overflow clipping), and scrollbar drag protection.
 *
 * @param {String|Number} value - Currently selected value or input string.
 * @param {Function} onChange - Callback triggered when value changes.
 * @param {Array<String|Object>} options - Options list. Array of strings or objects { label, value }.
 * @param {String} placeholder - Placeholder text for input field.
 * @param {String} label - Custom field label text.
 * @param {Boolean} required - Shows required asterisk if true.
 * @param {String} error - External error message string.
 * @param {String} className - Additional wrapper CSS classes.
 */
export default function ReusableComboBox({
  value = '',
  onChange,
  options = [],
  placeholder = 'Select or type...',
  label = '',
  required = false,
  error = null,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Normalize options array into standard { label, value } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { label: String(opt.label || opt.value), value: opt.value };
    }
    return { label: String(opt), value: opt };
  });

  // Calculate dropdown floating portal position relative to trigger input
  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  // Recalculate position on open & resize/scroll events
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Click Outside Listener with portal scrollbar drag protection
  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideInput =
        containerRef.current && containerRef.current.contains(event.target);
      const clickedInsideDropdown =
        dropdownRef.current && dropdownRef.current.contains(event.target);

      // Keep open if user clicks or drags inside input or portal dropdown scrollbar
      if (!clickedInsideInput && !clickedInsideDropdown) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on typed input or internal search term
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Option Select
  const handleSelect = (selectedOption) => {
    if (onChange) {
      onChange(selectedOption.value);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  // Get current display label
  const currentLabel =
    normalizedOptions.find(
      (opt) => String(opt.value).toLowerCase() === String(value).toLowerCase()
    )?.label || value;

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {/* Optional Label */}
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          {label} {required && <span className="text-cyan-400">*</span>}
        </label>
      )}

      {/* Input Box Trigger Container */}
      <div className="relative w-full" ref={containerRef}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={isOpen ? searchTerm : currentLabel}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onChange) onChange(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => {
              setSearchTerm('');
              setIsOpen(true);
            }}
            placeholder={placeholder}
            className={`w-full bg-slate-950/90 border ${
              error
                ? 'border-rose-500/80 focus:ring-rose-500/30'
                : 'border-slate-800/90 focus:border-cyan-500 focus:ring-cyan-500/30'
            } rounded-2xl pl-4 pr-11 py-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-medium`}
          />

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ChevronDown
              className={`w-5 h-5 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-cyan-400' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Portal Overlay Dropdown Menu */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`,
              }}
              className="z-[9999] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-2xl p-2 max-h-60 overflow-y-auto divide-y divide-slate-800/50"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((item) => {
                  const isSelected =
                    String(value).toLowerCase() === String(item.value).toLowerCase();

                  return (
                    <button
                      key={String(item.value)}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(item);
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(item);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/10 text-cyan-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-xs text-slate-500 text-center font-medium">
                  No options found
                </div>
              )}
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}