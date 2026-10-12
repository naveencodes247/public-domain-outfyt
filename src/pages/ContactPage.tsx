import React, { useState } from 'react';
import { Send, CheckCircle2, Mail, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#A77B3D] font-semibold flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-[#CDA66B]" />
          <span>Get in Touch</span>
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold text-[#171717] tracking-tight">
          Contact & Feedback
        </h1>
        <p className="text-sm text-[#66615B] max-w-xl">
          Have an outfit recommendation, retailer correction, styling inquiry, or general feedback? We would love to hear from you.
        </p>
      </div>

      {/* Direct Email Support Card */}
      <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#F7F3EB] border border-[#E5DDD0] flex items-center justify-center text-[#CDA66B] shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#171717] block">
              Direct Editorial & Support Email
            </span>
            <p className="text-xs text-[#66615B] mt-0.5">
              For fastest response, email our team directly anytime:
            </p>
          </div>
        </div>
        <a
          href="mailto:supportoutfyt.co.in@gmail.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F7F3EB] hover:bg-[#EFE6D8] border border-[#E5DDD0] hover:border-[#CDA66B] text-[#171717] text-xs font-semibold transition shrink-0 group"
        >
          <Mail className="w-3.5 h-3.5 text-[#A77B3D]" />
          <span className="group-hover:text-[#A77B3D] transition-colors">
            supportoutfyt.co.in@gmail.com
          </span>
        </a>
      </div>

      {/* Contact Form Card */}
      <div className="p-8 rounded-2xl bg-[#FFFFFF] border border-[#E5DDD0] shadow-xs">
        <h2 className="text-base font-semibold text-[#171717] mb-1">
          Send Us a Note
        </h2>
        <p className="text-xs text-[#66615B] mb-6">
          Fill out the form below and our team will get back to you.
        </p>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-[#171717]">Message Received</h3>
            <p className="text-xs text-[#66615B] max-w-sm mx-auto">
              Thank you for contacting OutFyt.co.in. Our editorial team will review your inquiry shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', subject: '', message: '' });
              }}
              className="text-xs text-[#A77B3D] hover:underline font-semibold pt-2 cursor-pointer"
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#171717]">Your Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Aarav Sharma"
                  className="w-full bg-[#F7F3EB] border border-[#E5DDD0] focus:border-[#CDA66B] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#66615B] outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#171717]">Your Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="aarav@example.com"
                  className="w-full bg-[#F7F3EB] border border-[#E5DDD0] focus:border-[#CDA66B] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#66615B] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#171717]">Subject *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Styling Curation / Affiliate Inquiry / Suggestion"
                className="w-full bg-[#F7F3EB] border border-[#E5DDD0] focus:border-[#CDA66B] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#66615B] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#171717]">Message *</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you discover or curate outfits?"
                className="w-full bg-[#F7F3EB] border border-[#E5DDD0] focus:border-[#CDA66B] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#66615B] outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#CDA66B] hover:bg-[#A77B3D] text-[#FFFFFF] font-semibold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactPage;
