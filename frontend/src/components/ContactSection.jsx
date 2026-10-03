import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Send,
  Loader2,
} from 'lucide-react';
import API from '../api/axios';

const directionsUrl = 'https://www.google.com/maps/search/?api=1&query=Department+of+Computer+Science+University+of+Agriculture+Faisalabad';
const mapEmbedUrl = 'https://maps.google.com/maps?q=Department%20of%20Computer%20Science%2C%20University%20of%20Agriculture%20Faisalabad&t=&z=14&ie=UTF8&iwloc=&output=embed';

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }

    setStatus('sending');
    try {
      const { data } = await API.post('/contact', formData);
      if (data.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-[#f3f7fb] px-4 py-16 text-[#17243b] sm:px-8 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0e7490]/40 to-transparent" />
      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.55 }}
          className="mb-10 grid gap-5 md:mb-12 md:grid-cols-[1fr_auto] md:items-end"
        >
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase text-[#0e7490]">
              <span className="h-px w-7 bg-[#0e7490]" /> Department of Computer Science
            </p>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-[#17243b] sm:text-5xl">
              Let&apos;s start a conversation.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#58677d] md:pb-1 md:text-base">
            Questions about our programs, admissions, or the department? Send a note and our team will be glad to help.
          </p>
        </motion.div>

        <div className="grid items-start gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55 }}
            className="space-y-7"
          >
            <div className="divide-y divide-[#dce5ef] border-y border-[#dce5ef]">
              <a href="mailto:cs@uaf.edu.pk" className="group flex items-start gap-4 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#1e3a8a] shadow-sm ring-1 ring-[#dce5ef]">
                  <Mail className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase text-[#69788d]">Email the department</span>
                  <span className="mt-1 block break-all text-sm font-semibold text-[#17243b] group-hover:text-[#0e7490]">cs@uaf.edu.pk</span>
                </span>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#8290a3] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0e7490]" />
              </a>

              <a href="tel:+92419200161" className="group flex items-start gap-4 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#1e3a8a] shadow-sm ring-1 ring-[#dce5ef]">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase text-[#69788d]">Call the department</span>
                  <span className="mt-1 block text-sm font-semibold text-[#17243b] group-hover:text-[#0e7490]">+92 41 9200161</span>
                  <span className="mt-0.5 block text-xs text-[#69788d]">Extensions 5052, 5040</span>
                </span>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-[#8290a3] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0e7490]" />
              </a>

              <div className="flex items-start gap-4 py-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#1e3a8a] shadow-sm ring-1 ring-[#dce5ef]">
                  <Clock3 className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase text-[#69788d]">Office hours</span>
                  <span className="mt-1 block text-sm font-semibold text-[#17243b]">Monday to Friday</span>
                  <span className="mt-0.5 block text-xs text-[#69788d]">8:00 AM to 4:00 PM</span>
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#dce5ef] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-[#0e7490]" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#17243b]">Find us on campus</p>
                    <p className="truncate text-xs text-[#69788d]">University of Agriculture, Faisalabad</p>
                  </div>
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-[#1e3a8a] hover:text-[#0e7490]"
                >
                  <Navigation className="h-3.5 w-3.5" /> Directions
                </a>
              </div>
              <iframe
                title="Map to the Department of Computer Science, University of Agriculture Faisalabad"
                src={mapEmbedUrl}
                className="h-56 w-full border-0 sm:h-64"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="relative rounded-xl border border-[#e0e7ef] bg-white p-5 shadow-[0_18px_55px_-35px_rgba(23,36,59,0.35)] sm:p-8"
          >
            <div className="mb-7 border-b border-[#e7edf3] pb-5">
              <p className="text-xs font-bold uppercase text-[#0e7490]">Send a message</p>
              <h3 className="mt-1.5 text-xl font-bold text-[#17243b]">How can we help?</h3>
              <p className="mt-1 text-sm text-[#69788d]">Fields marked with * are required.</p>
            </div>

            {status === 'success' ? (
              <div className="flex min-h-64 flex-col items-center justify-center py-10 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e6f5f2] text-[#0e7490]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-[#17243b]">Message sent</h3>
                <p className="mb-6 max-w-xs text-sm leading-6 text-[#69788d]">
                  Thank you for contacting the department. We&apos;ll get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="inline-flex items-center gap-2 rounded-md bg-[#1e3a8a] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#172e6e]"
                >
                  <Mail className="h-4 w-4" /> Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-xs font-bold text-[#34435a]">Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-md border border-[#ced8e4] bg-white px-3.5 py-3 text-sm text-[#17243b] placeholder-[#91a0b3] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-xs font-bold text-[#34435a]">Email *</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-md border border-[#ced8e4] bg-white px-3.5 py-3 text-sm text-[#17243b] placeholder-[#91a0b3] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="mb-2 block text-xs font-bold text-[#34435a]">Subject</label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange('subject', e.target.value)}
                    placeholder="What is your message about?"
                    className="w-full rounded-md border border-[#ced8e4] bg-white px-3.5 py-3 text-sm text-[#17243b] placeholder-[#91a0b3] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-2 block text-xs font-bold text-[#34435a]">Message *</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    placeholder="Write your message here..."
                    required
                    className="w-full resize-y rounded-md border border-[#ced8e4] bg-white px-3.5 py-3 text-sm text-[#17243b] placeholder-[#91a0b3] outline-none transition focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/15"
                  />
                </div>

                {error && (
                  <p role="alert" className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#1e3a8a] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#172e6e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0e7490] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {status === 'sending' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {status === 'sending' ? 'Sending message...' : 'Send message'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}