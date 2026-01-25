import React from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Users, Wrench, Sparkles, BookOpen, Target, Mail } from 'lucide-react';

interface TeachingPhilosophyProps {
  onNavigate: (page: string) => void;
}

export function TeachingPhilosophy({ onNavigate }: TeachingPhilosophyProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 pt-32 pb-24">
      
      {/* Hero Section */}
      <section className="px-6 lg:px-12 pb-16">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <div className="font-pixel text-[10px] text-black/40 dark:text-white/40 tracking-[0.3em] mb-4">TEACHING PHILOSOPHY</div>
              <h1 className="font-display text-black dark:text-white text-6xl md:text-7xl lg:text-8xl mb-6 leading-[0.9]">
                Education &<br/>Mentorship
              </h1>
              <p className="text-black/70 dark:text-white/70 max-w-4xl">
                Preparing the next generation of scenic designers for theatre, film, television, events, and themed entertainment
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Main Philosophy Text */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Opening Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-10 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <p className="text-xl leading-relaxed text-black/90 dark:text-white/90">
                As an educator in Scenic Design, my foremost goal is to equip students with the skills, confidence, and adaptability needed to thrive in today's rapidly evolving entertainment industry.
              </p>
            </motion.div>

            {/* A Comprehensive Foundation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h2 className="text-2xl mb-6">A Comprehensive Foundation</h2>
              <div className="space-y-4 text-black/80 dark:text-white/80 leading-relaxed">
                <p>
                  While rooted in the traditions of theatre, my teaching extends across Film, Television, Events, and Themed Entertainment, encouraging students to envision careers that match the breadth of opportunities available to creative designers today.
                </p>
                <p>
                  I emphasize a comprehensive foundation in scenic design, beginning with spatial awareness, material comprehension, and design aesthetics, and extending into collaboration, an indispensable skill in this field. My courses balance traditional methods — such as hand-drafting, perspective sketching, and tactile rendering in gouache and watercolor — with advanced technologies including Vectorworks, Twinmotion, Adobe Creative Cloud, and AI-driven design tools. By layering old and new methods, I encourage students to respect process while embracing innovation.
                </p>
              </div>
            </motion.div>

            {/* Accessible & Adaptive Pedagogy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h2 className="text-2xl mb-6">Accessible & Adaptive Pedagogy</h2>
              <div className="space-y-4 text-black/80 dark:text-white/80 leading-relaxed">
                <p>
                  Recognizing that each student learns differently, I employ versatile teaching strategies. Some thrive in communal settings, while others find strength in individual exploration. To support this, I often begin with collaborative projects that build community and confidence, before shifting to individually tailored assignments.
                </p>
                <p>
                  Accessibility is a cornerstone of my pedagogy: I integrate digital platforms like Canvas's immersive reader, supplemental videos, and hybrid tactile-digital assignments to meet students where they are.
                </p>
              </div>
            </motion.div>

            {/* Mentorship Beyond the Classroom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h2 className="text-2xl mb-6">Mentorship Beyond the Classroom</h2>
              <div className="space-y-4 text-black/80 dark:text-white/80 leading-relaxed">
                <p>
                  My own career trajectory informs my mentorship. Early on, I struggled to find my voice and learn the art of self-promotion. Today, I guide students not just toward strong portfolios, but toward resilience, self-advocacy, and confidence in their ideas.
                </p>
                <p>
                  Beyond the classroom, I strive to create a positive design culture. At Stephens, I was adamant about developing a shared studio space where students could work beyond their dorm rooms, exchange supplies, and collaborate across disciplines — a communal environment that fostered both creativity and belonging.
                </p>
              </div>
            </motion.div>

            {/* Teaching as Research */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h2 className="text-2xl mb-6">Teaching as Research</h2>
              <div className="space-y-4 text-black/80 dark:text-white/80 leading-relaxed">
                <p>
                  Finally, I view teaching as a continuous act of research. Just as I bring current industry practices into my classroom, I also explore emerging technologies to expand students' toolkits. Recently, I incorporated AI tools like MidJourney and Adobe Firefly into my Digital Rendering course, inviting students to critically explore both the opportunities and limitations of these new mediums.
                </p>
                <p>
                  For me, the classroom is a laboratory for experimentation — a space where design education remains responsive to shifting industry landscapes.
                </p>
              </div>
            </motion.div>

            {/* Core Philosophy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
            >
              <h2 className="text-2xl mb-6">Core Philosophy</h2>
              <p className="text-black/80 dark:text-white/80 leading-relaxed">
                My teaching philosophy centers on preparing students not only as designers, but as collaborators, innovators, and leaders. By combining foundational craft, technological literacy, and a strong culture of community, I aim to ensure they graduate ready to shape the future of scenic design across theatre and beyond.
              </p>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32 space-y-6">
              
              {/* Core Principles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
              >
                <h3 className="font-pixel text-[8px] text-black/40 dark:text-white/40 tracking-[0.2em] mb-6">CORE PRINCIPLES</h3>
                <div className="space-y-6">
                  
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm mb-1">Industry Readiness</h4>
                      <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                        Preparing students for careers across theatre, film, TV, events, and themed entertainment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Wrench className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm mb-1">Traditional + Digital</h4>
                      <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                        Balancing hand-drafting, painting, and sketching with Vectorworks, Twinmotion, and AI tools
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm mb-1">Collaboration Culture</h4>
                      <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                        Creating shared studio spaces and collaborative projects that build community
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm mb-1">Accessible Learning</h4>
                      <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                        Versatile teaching strategies with digital platforms and hybrid assignments
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm mb-1">Self-Advocacy</h4>
                      <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                        Guiding students toward resilience, confidence, and effective self-promotion
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-black/40 dark:text-white/40 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm mb-1">Teaching as Research</h4>
                      <p className="text-xs text-black/60 dark:text-white/60 leading-relaxed">
                        Continuously exploring emerging technologies and industry practices
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Teaching Experience */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
              >
                <h3 className="font-pixel text-[8px] text-black/40 dark:text-white/40 tracking-[0.2em] mb-6">TEACHING EXPERIENCE</h3>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm mb-1">Stephens College</div>
                    <div className="text-xs text-black/50 dark:text-white/50">Lecturer (Remote)</div>
                    <div className="text-xs text-black/50 dark:text-white/50">2024 – 2025</div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Stephens College</div>
                    <div className="text-xs text-black/50 dark:text-white/50">Lecturer</div>
                    <div className="text-xs text-black/50 dark:text-white/50">2021 – 2024</div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">University of Texas at El Paso</div>
                    <div className="text-xs text-black/50 dark:text-white/50">Visiting Assistant Professor</div>
                    <div className="text-xs text-black/50 dark:text-white/50">2021</div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">University of California, Irvine</div>
                    <div className="text-xs text-black/50 dark:text-white/50">Adjunct Lecturer & TA</div>
                    <div className="text-xs text-black/50 dark:text-white/50">2017 – 2020</div>
                  </div>
                </div>
              </motion.div>

              {/* Courses Taught */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-8 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
              >
                <h3 className="font-pixel text-[8px] text-black/40 dark:text-white/40 tracking-[0.2em] mb-6">COURSES TAUGHT</h3>
                <div className="space-y-2 text-sm text-black/70 dark:text-white/70">
                  <div>• Scenic Design</div>
                  <div>• Introduction to Scenic Design</div>
                  <div>• Digital Rendering</div>
                  <div>• Entertainment Design & Collaboration</div>
                  <div>• Vectorworks (Drafting & 3D Modeling)</div>
                  <div>• Technical Theatre</div>
                  <div>• Properties Supervisor (TA)</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 p-12 bg-neutral-200/60 dark:bg-neutral-900/60 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-3xl"
        >
          <div className="max-w-3xl">
            <h2 className="text-3xl mb-6">Interested in Collaboration?</h2>
            <p className="text-lg leading-relaxed text-black/70 dark:text-white/70 mb-8">
              I'm always excited to discuss guest lectures, curriculum development, workshop facilitation, or academic partnerships. Whether you're looking to explore emerging technologies in design education or seeking insights on building inclusive, industry-responsive programs, I'd love to connect.
            </p>
            <a
              href="mailto:brandon@brandonptdavis.com"
              className="inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full hover:opacity-80 transition-all"
            >
              <Mail className="w-4 h-4" />
              Get In Touch
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}