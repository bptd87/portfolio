import React, { useState } from 'react';
import { Mail, MapPin, Send, Linkedin, Instagram, Youtube, ExternalLink, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { SOCIAL_LINKS } from '../data/social-links';
import { publicAnonKey } from '../utils/supabase/info';
import { useSiteSettings } from '../hooks/useSiteSettings';
const contactIllustrationSrc = '/images/brandon-with-cat.png';

export function Contact() {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch(`https://zuycsuajiuqsvopiioer.supabase.co/functions/v1/make-server-74296234/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Thanks for reaching out! I\'ll get back to you soon.'
        });
        // Clear form
        setFormData({
          name: '',
          email: '',
          projectType: '',
          message: ''
        });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try emailing me directly.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pb-16 md:pb-24 pt-24 md:pt-32">
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        {/* Hero Section with Illustration */}
        <div className="mb-16 md:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase opacity-60 mb-4" style={{ fontFamily: 'VT323, monospace' }}>
                GET IN TOUCH
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                Let's Create Something Extraordinary
              </h1>
              <p className="text-base md:text-lg opacity-70 leading-relaxed max-w-xl">
                Whether you're producing theater, developing experiential installations, or need visualization for your next project—I'd love to collaborate. Drop me a message and let's bring your vision to life.
              </p>
            </div>

            {/* Right: Illustration */}
            <div className="relative">
              <style>{`
                @keyframes float {
                  0%, 100% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(-20px);
                  }
                }
                
                @keyframes pulse-glow {
                  0%, 100% {
                    filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.4));
                  }
                  50% {
                    filter: drop-shadow(0 0 40px rgba(168, 85, 247, 0.6));
                  }
                }
                
                .contact-illustration {
                  animation: float 6s ease-in-out infinite;
                  transition: transform 0.3s ease;
                }
                
                .contact-illustration:hover {
                  animation: float 6s ease-in-out infinite, pulse-glow 2s ease-in-out infinite;
                  transform: scale(1.02);
                }
              `}</style>
              <img
                src={contactIllustrationSrc}
                alt="Brandon at work with his cat"
                className="w-full h-auto contact-illustration max-w-md mx-auto"
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form - 2 columns on desktop */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-neutral-500/60 dark:bg-neutral-800/60 border border-white/10 rounded-3xl p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl mb-8 italic" style={{ fontFamily: 'Playfair Display, serif' }}>
                Send a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name & Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase opacity-60 mb-3" style={{ fontFamily: 'VT323, monospace' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs tracking-[0.2em] uppercase opacity-60 mb-3" style={{ fontFamily: 'VT323, monospace' }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Project Type */}
                <div>
                  <style>{`
                    select.dark-mode-select option {
                      background-color: #1a1a1a;
                      color: #ffffff;
                    }
                    
                    @media (prefers-color-scheme: dark) {
                      select.dark-mode-select option {
                        background-color: #1a1a1a;
                        color: #ffffff;
                      }
                    }
                  `}</style>
                  <label className="block text-xs tracking-[0.2em] uppercase opacity-60 mb-3" style={{ fontFamily: 'VT323, monospace' }}>
                    Project Type
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    title="Select project type"
                    className="dark-mode-select w-full px-4 py-3 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 focus:outline-none transition-colors text-black dark:text-white"
                    style={{
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="">Select a type</option>
                    <option value="theater">Theater / Scenic Design</option>
                    <option value="experiential">Experiential Design</option>
                    <option value="rendering">Rendering & Visualization</option>
                    <option value="installation">Installation</option>
                    <option value="event">Event Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs tracking-[0.2em] uppercase opacity-60 mb-3" style={{ fontFamily: 'VT323, monospace' }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project..."
                    className="w-full h-64 px-4 py-3 bg-black/20 dark:bg-white/5 border border-white/10 rounded-2xl focus:border-white/30 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit Status */}
                {submitStatus && (
                  <div className={`flex items-center gap-3 p-4 rounded-2xl ${submitStatus.type === 'success'
                    ? 'bg-green-500/20 border border-green-500/30 text-green-200'
                    : 'bg-red-500/20 border border-red-500/30 text-red-200'
                    }`}>
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <p className="text-sm">{submitStatus.message}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'VT323, monospace' }}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar - 1 column on desktop */}
          <div className="space-y-6">
            {/* Resume / CV Card */}
            {settings?.resumeUrl && (
              <div className="backdrop-blur-xl bg-neutral-500/60 dark:bg-neutral-800/60 border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex gap-4 items-center relative z-10">
                  <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs tracking-[0.2em] uppercase opacity-60 mb-1" style={{ fontFamily: 'VT323, monospace' }}>
                      Document
                    </p>
                    <a
                      href="/resume"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:text-blue-400 transition-colors flex items-center gap-2"
                    >
                      {settings.resumeFilename || "Download Resume"}
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Email Card */}
            <div className="backdrop-blur-xl bg-neutral-500/60 dark:bg-neutral-800/60 border border-white/10 rounded-3xl p-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs tracking-[0.2em] uppercase opacity-60 mb-2" style={{ fontFamily: 'VT323, monospace' }}>
                    Email
                  </p>
                  <a
                    href="mailto:info@brandonptdavis.com"
                    className="text-sm hover:opacity-70 transition-opacity break-all"
                  >
                    info@brandonptdavis.com
                  </a>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="backdrop-blur-xl bg-neutral-500/60 dark:bg-neutral-800/60 border border-white/10 rounded-3xl p-6">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs tracking-[0.2em] uppercase opacity-60 mb-2" style={{ fontFamily: 'VT323, monospace' }}>
                    Location
                  </p>
                  <p className="text-sm mb-1">Irvine, CA</p>
                  <p className="text-xs opacity-60">Available for travel</p>
                </div>
              </div>
            </div>

            {/* Response Time Card */}
            <div className="backdrop-blur-xl bg-neutral-500/60 dark:bg-neutral-800/60 border border-white/10 rounded-3xl p-6">
              <p className="text-xs tracking-[0.2em] uppercase opacity-60 mb-3" style={{ fontFamily: 'VT323, monospace' }}>
                Response Time
              </p>
              <p className="text-sm opacity-70 leading-relaxed">
                I typically respond to inquiries within 24-48 hours. For urgent projects, please mention it in your message.
              </p>
            </div>

            {/* Social Links */}
            <div className="backdrop-blur-xl bg-neutral-500/60 dark:bg-neutral-800/60 border border-white/10 rounded-3xl p-6">
              <p className="text-xs tracking-[0.2em] uppercase opacity-60 mb-4" style={{ fontFamily: 'VT323, monospace' }}>
                Connect
              </p>
              <div className="flex flex-col gap-3">
                {SOCIAL_LINKS.map((social) => {
                  const iconMap: Record<string, any> = {
                    Linkedin,
                    Instagram,
                    Youtube,
                    ExternalLink,
                  };
                  const Icon = iconMap[social.icon];

                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex items-center gap-3 text-sm hover:opacity-70 transition-opacity group"
                    >
                      {Icon && <Icon className="w-4 h-4 opacity-60" />}
                      <span>{social.platform}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity ml-auto" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}