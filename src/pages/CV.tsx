import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, GraduationCap, Star, 
  ChevronDown, ChevronUp, MapPin, Mail, 
  Globe, Phone, Calendar, Users, Wrench, Download, Loader
} from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export function CV() {
  const [expandedSection, setExpandedSection] = useState<string | null>('recent');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'design' | 'assistant' | 'academic'>('all');
  const { settings, loading, error } = useSiteSettings();
  const [showContent, setShowContent] = useState(false);
  
  // Force show content after 3 seconds even if still loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 3000);
    
    if (!loading) {
      setShowContent(true);
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  // Get contact info from settings, fallback to defaults
  const contactInfo = {
    phone: settings?.phone || '573.881.0430',
    email: settings?.email || 'brandon@brandonptdavis.com',
    location: settings?.location || 'Irvine, CA',
    website: settings?.website || 'https://www.brandonptdavis.com'
  };

  // Use dynamic data from settings API
  const recentProductions = settings?.recentProductions || [];
  const assistantDesignProductions = settings?.assistantDesignProductions || [];
  const upcomingProductions = settings?.upcomingProductions || [];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!showContent && loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading CV data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <p className="text-gray-400 text-sm">Please refresh the page or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pt-32 pb-24">
      
      {/* Hero Section - Modern Nothing.tech style */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Title */}
            <div>
              <div className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-4">CURRICULUM VITAE</div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight mb-6">BRANDON PT DAVIS</h1>
              <p className="text-xl md:text-2xl text-black/70 dark:text-white/70 max-w-3xl leading-relaxed">
                Scenic & Experiential Designer specializing in theatrical production, live events, and immersive environments
              </p>
            </div>
            
            {/* Contact Cards - Glass style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.a
                href={`tel:${contactInfo.phone}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 p-4 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl hover:border-black/30 dark:hover:border-white/30 transition-all group"
                whileHover={{ y: -2 }}
              >
                <Phone className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <span className="text-sm">{contactInfo.phone}</span>
              </motion.a>

              <motion.a
                href={`mailto:${contactInfo.email}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-3 p-4 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl hover:border-black/30 dark:hover:border-white/30 transition-all group"
                whileHover={{ y: -2 }}
              >
                <Mail className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <span className="text-sm">Email</span>
              </motion.a>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-4 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl"
              >
                <MapPin className="w-5 h-5 text-black/40 dark:text-white/40" />
                <span className="text-sm">{contactInfo.location}</span>
              </motion.div>

              <motion.a
                href={contactInfo.website}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-3 p-4 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl hover:border-black/30 dark:hover:border-white/30 transition-all group"
                whileHover={{ y: -2 }}
              >
                <Globe className="w-5 h-5 text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors" />
                <span className="text-sm">Website</span>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-6 lg:px-12 pb-24">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-neutral-200/40 dark:bg-neutral-900/30 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl p-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl mb-2">130+</div>
                <div className="font-pixel text-[8px] text-black/30 dark:text-white/30 tracking-[0.2em]">PRODUCTIONS</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl mb-2">15+</div>
                <div className="font-pixel text-[8px] text-black/30 dark:text-white/30 tracking-[0.2em]">YEARS EXPERIENCE</div>
              </div>
              <div className="col-span-2 md:col-span-1">
                <div className="text-4xl md:text-5xl mb-2">USA 829</div>
                <div className="font-pixel text-[8px] text-black/30 dark:text-white/30 tracking-[0.2em]">UNION MEMBER</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12 space-y-16">
        
        {/* Education */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-6 h-6 text-black/40 dark:text-white/40" />
            <h2 className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em]">EDUCATION</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl hover:border-black/30 dark:hover:border-white/30 transition-all group"
              whileHover={{ y: -4 }}
            >
              <h3 className="text-2xl mb-2">University of California, Irvine</h3>
              <p className="text-sm text-black/50 dark:text-white/50 mb-4 font-display">MFA in Drama [Scenic Design]</p>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Thesis production: <em>Company</em> (Scenic Design). Designed five realized productions including <em>American Idiot</em>, <em>Parliament Square</em>, and <em>The Penelopiad</em>. Developed advanced scenic design course for upper-level students.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl hover:border-black/30 dark:hover:border-white/30 transition-all group"
              whileHover={{ y: -4 }}
            >
              <h3 className="text-2xl mb-2">Stephens College</h3>
              <p className="text-sm text-black/50 dark:text-white/50 mb-4 font-display">BFA in Theatre Arts</p>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Capstone: <em>All My Sons</em> (Scenic Design). Received Apprenticeship Scholarship requiring 20+ weekly hours in scene shop, gaining practical training in construction, painting, and technical support.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Professional Affiliations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-6 h-6 text-black/40 dark:text-white/40" />
            <h2 className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em]">PROFESSIONAL AFFILIATIONS</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h3 className="text-xl mb-2">United Scenic Artists, Local 829</h3>
              <p className="text-sm text-black/60 dark:text-white/60">Member, 2023–Present</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h3 className="text-xl mb-2">United States Institute of Theatre Technology</h3>
              <p className="text-sm text-black/60 dark:text-white/60">Member, 2009–Present</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Experience - Collapsible Sections */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Briefcase className="w-6 h-6 text-black/40 dark:text-white/40" />
            <h2 className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em]">PROFESSIONAL EXPERIENCE</h2>
          </div>

          {/* Brandon PT Davis Design LLC */}
          <div className="mb-6 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('bptd')}
              className="w-full p-8 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl mb-1">Brandon PT Davis Design LLC</h3>
                <p className="text-sm text-black/60 dark:text-white/60">Scenic & Experiential Designer · 2024–Present</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-black/40 dark:text-white/40 transition-transform duration-300 ${expandedSection === 'bptd' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'bptd' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 space-y-2 text-sm text-black/70 dark:text-white/70 border-t border-black/10 dark:border-white/10 pt-6">
                    <p>• Founded independent design practice specializing in scenic design for theatre and experiential design for live events</p>
                    <p>• Delivered design services for experiential activations, concept renderings, technical drafting, and visualization</p>
                    <p>• Collaborated with partner studios including Lumenati and Outerkind on large-scale projects</p>
                    <p>• Worked with brands including Rab, Toyota, 1st Bank, Caterpillar, XRP, Woody Creek Distillery, Palo Alto Security, and Red Bull</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Adaptive Design Services */}
          <div className="mb-6 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('ads')}
              className="w-full p-8 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl mb-1">Adaptive Design Services</h3>
                <p className="text-sm text-black/60 dark:text-white/60">Sr. Scenic & Experiential Designer · 2022–Present</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-black/40 dark:text-white/40 transition-transform duration-300 ${expandedSection === 'ads' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'ads' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 space-y-2 text-sm text-black/70 dark:text-white/70 border-t border-black/10 dark:border-white/10 pt-6">
                    <p>• Joined a freelance design collective specializing in live entertainment events and branded activations</p>
                    <p>• Served as Vectorworks Modeling Specialist, contributing advanced drafting, rendering, and 3D modeling expertise</p>
                    <p>• Created detailed 3D models of two Hermès store locations and the surrounding Madison Avenue city block using point cloud technology</p>
                    <p>• Collaborated on projects for brands including Hermès, CVS, Davines, Qomo, Riken, Return Pro, and Wells Gardner</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Academic Positions - Combined */}
          <div className="mb-6 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('academic')}
              className="w-full p-8 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl mb-1">Academic Appointments</h3>
                <p className="text-sm text-black/60 dark:text-white/60">Various Institutions · 2017–2025</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-black/40 dark:text-white/40 transition-transform duration-300 ${expandedSection === 'academic' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'academic' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 border-t border-black/10 dark:border-white/10 pt-6 space-y-6">
                    <div>
                      <h4 className="mb-2 text-lg">Stephens College — Lecturer (2024–2025)</h4>
                      <div className="space-y-1 text-sm text-black/70 dark:text-white/70">
                        <p>• Delivered specialized design courses remotely from Irvine, CA</p>
                        <p>• Instructed Vectorworks course focusing on technical drafting and 3D modeling</p>
                        <p>• Taught Entertainment Design course emphasizing collaborative processes</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-lg">Stephens College — Lecturer (2021–2024)</h4>
                      <div className="space-y-1 text-sm text-black/70 dark:text-white/70">
                        <p>• Taught full-time 4/4 course load in scenic design, drafting, and entertainment technology</p>
                        <p>• Designed scenery for 3–6 productions annually</p>
                        <p>• Established state-of-the-art Design Lab with Mac Studio computing resources</p>
                        <p>• Developed new courses: Digital Rendering and Entertainment Design & Collaboration</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-lg">University of Texas-El Paso — Visiting Assistant Professor (2021)</h4>
                      <div className="space-y-1 text-sm text-black/70 dark:text-white/70">
                        <p>• Instructed three undergraduate courses in scenic design and technical theatre</p>
                        <p>• Designed scenery for first in-person production post-COVID-19</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-lg">UC Irvine — Adjunct Lecturer & TA (2017–2020)</h4>
                      <div className="space-y-1 text-sm text-black/70 dark:text-white/70">
                        <p>• Taught Introduction to Scenic Design remotely during pandemic</p>
                        <p>• Served as TA for Properties Supervisor for three years</p>
                        <p>• Appointed DesignLand Liaison managing 3D printer and laser cutter operations</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theatre Positions */}
          <div className="mb-6 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('theatre')}
              className="w-full p-8 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl mb-1">Regional Theatre Positions</h3>
                <p className="text-sm text-black/60 dark:text-white/60">Various Theatres · 2012–2017</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-black/40 dark:text-white/40 transition-transform duration-300 ${expandedSection === 'theatre' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'theatre' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 border-t border-black/10 dark:border-white/10 pt-6 space-y-6">
                    <div>
                      <h4 className="mb-2 text-lg">The Great American Melodrama — Resident Scenic Designer & TD (2016–2017)</h4>
                      <div className="space-y-1 text-sm text-black/70 dark:text-white/70">
                        <p>• Designed scenery for six productions with comprehensive documentation</p>
                        <p>• Managed shop operations, hiring, scenic construction, load-ins, and strikes</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-lg">Okoboji Summer Theatre — Shop Foreman & Guest Designer (2012–Present)</h4>
                      <div className="space-y-1 text-sm text-black/70 dark:text-white/70">
                        <p>• Managed paint shop operations for nine productions in ten weeks</p>
                        <p>• Trained and supervised student assistants in scenic painting techniques</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Productions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Calendar className="w-6 h-6 text-black/40 dark:text-white/40" />
            <h2 className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em]">PRODUCTION HISTORY</h2>
          </div>

          {/* Upcoming Productions */}
          <div className="mb-6 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('upcoming')}
              className="w-full p-8 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl">Upcoming Productions</h3>
                <p className="text-sm text-black/60 dark:text-white/60 mt-1">{upcomingProductions.length} shows</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-black/40 dark:text-white/40 transition-transform duration-300 ${expandedSection === 'upcoming' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'upcoming' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-black/10 dark:border-white/10">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">PRODUCTION</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">DIRECTOR</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">COMPANY</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">YEAR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingProductions.map((show, index) => (
                            <motion.tr 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <td className="py-4 px-8">{show.production}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.director || show.designer}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.company}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.year}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Productions */}
          <div className="mb-6 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('recent')}
              className="w-full p-8 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl">Recent Scenic Design</h3>
                <p className="text-sm text-black/60 dark:text-white/60 mt-1">{recentProductions.length} shows</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-black/40 dark:text-white/40 transition-transform duration-300 ${expandedSection === 'recent' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'recent' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-black/10 dark:border-white/10">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">PRODUCTION</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">DIRECTOR</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">COMPANY</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">YEAR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentProductions.map((show, index) => (
                            <motion.tr 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <td className="py-4 px-8">{show.production}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.director || show.designer}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.company}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.year}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="p-8 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                      <p className="text-sm text-black/60 dark:text-white/60 text-center">
                        Over 130 realized productions since 2009. Complete production history available upon request.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Assistant Design */}
          <div className="mb-6 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('assistant')}
              className="w-full p-8 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="text-left">
                <h3 className="text-xl">Assistant Scenic Design</h3>
                <p className="text-sm text-black/60 dark:text-white/60 mt-1">{assistantDesignProductions.length} shows</p>
              </div>
              <ChevronDown className={`w-5 h-5 text-black/40 dark:text-white/40 transition-transform duration-300 ${expandedSection === 'assistant' ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {expandedSection === 'assistant' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-black/10 dark:border-white/10">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">PRODUCTION</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">SCENIC DESIGNER</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">COMPANY</th>
                            <th className="text-left py-3 px-8 font-pixel text-[8px] tracking-[0.2em] text-black/40 dark:text-white/40">YEAR</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assistantDesignProductions.map((show, index) => (
                            <motion.tr 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <td className="py-4 px-8">{show.production}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.designer || show.director}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.company}</td>
                              <td className="py-4 px-8 text-black/60 dark:text-white/60">{show.year}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Technical Skills */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Wrench className="w-6 h-6 text-black/40 dark:text-white/40" />
            <h2 className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em]">TECHNICAL PROFICIENCIES</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h3 className="mb-3 text-lg">Design & Fabrication</h3>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Computer Drafting, Digital Rendering, Graphic Design, Hand Drafting, Model Making, 3D Printing, Laser Cutting, Scenic Construction, Foam Construction, Scenic Painting, MIG Welding, PC Build
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h3 className="mb-3 text-lg">3D Modeling</h3>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Vectorworks, Trimble SketchUp, Cinema 4D
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h3 className="mb-3 text-lg">Graphics & Design</h3>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Photoshop, Illustrator, InDesign, Vectorworks, Filter Forge, Procreate
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h3 className="mb-3 text-lg">Real-Time Rendering</h3>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Twinmotion, Enscape, Unreal Engine (basic)
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h3 className="mb-3 text-lg">AI Tools</h3>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                MidJourney, Adobe Firefly, Runway, Sora
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h3 className="mb-3 text-lg">Video & Media</h3>
              <p className="text-sm text-black/70 dark:text-white/70 leading-relaxed">
                Adobe Premiere, After Effects, Resolume, Camtasia
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Download/Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="pt-16 text-center"
        >
          <p className="text-sm text-black/60 dark:text-white/60 mb-6">
            Complete production history and references available upon request
          </p>
          <a
            href={`mailto:${contactInfo.email}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-all"
          >
            <Mail className="w-4 h-4" />
            Request Full CV
          </a>
        </motion.div>
      </div>
    </div>
  );
}