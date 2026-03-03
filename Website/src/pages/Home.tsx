import React from 'react';
import { motion } from 'motion/react';
import { Play, Github, FileText, ArrowRight, Shield, Zap, Clock, Activity, RefreshCw, Brain, Bell, Lock } from 'lucide-react';
import { FEATURES, TEAM_DATA, LINKS } from '../constants';
import FeatureCard from '../components/FeatureCard';
import TeamCard from '../components/TeamCard';

export default function Home({ setCurrentPage }: { setCurrentPage: (p: string) => void }) {
  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="max-w-4xl"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-teal-glow/10 border border-teal-glow/20 text-teal-glow text-xs font-bold tracking-widest uppercase mb-8"
          >
            Next-Gen EEG Intelligence
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
          >
            Real-Time EEG <br />
            <span className="text-teal-glow text-glow">Seizure Detection</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-white/60 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            NeuroCare connects with EEG devices to collect brainwave data and uses deep learning for real-time seizure detection, alerts, and reporting for clinicians and patients.
          </motion.p>
        </motion.div>
      </section>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
              The Clinical <br />
              <span className="text-white/40">Challenge</span>
            </h2>
            <p className="text-xl text-white/60 leading-relaxed mb-8">
              Manual EEG review is a grueling, time-consuming process that delays critical interventions. In emergency neurology, every second counts.
            </p>
            <div className="space-y-4">
              {['Slow manual review cycles', 'High risk of human error', 'Delayed emergency alerts', 'Fragmented patient data'].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-white/80">
                  <div className="w-2 h-2 rounded-full bg-teal-glow" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity size={200} />
            </div>
            <h3 className="text-3xl font-bold mb-6">NeuroCare Solution</h3>
            <p className="text-lg text-white/60 mb-8">
              We bridge the gap between raw data and clinical action. Our platform improves speed and provides robust decision support for clinicians.
            </p>
            <button 
              onClick={() => setCurrentPage('product')}
              className="flex items-center gap-2 text-teal-glow font-bold group"
            >
              Explore Data Pipeline <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">How It Works</h2>
          <p className="text-white/60 max-w-2xl mx-auto">From raw brainwaves to actionable clinical insights in milliseconds.</p>
        </div>
        
        <div className="grid md:grid-cols-5 gap-4">
          {[
            { label: 'EEG Capture', icon: Activity },
            { label: 'Preprocessing', icon: RefreshCw },
            { label: 'DL Inference', icon: Brain },
            { label: 'Classification', icon: Zap },
            { label: 'Alerts & Reports', icon: Bell }
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="relative group">
                <div className="glass p-8 rounded-2xl text-center group-hover:border-teal-glow/50 transition-all">
                  <div className="w-12 h-12 rounded-full bg-teal-glow/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-teal-glow" size={24} />
                  </div>
                  <span className="text-sm font-bold">{step.label}</span>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="text-white/20" size={20} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Clinical Features</h2>
            <p className="text-white/60">Comprehensive toolkit for modern neurology.</p>
          </div>
          <button 
            onClick={() => setCurrentPage('product')}
            className="px-8 py-3 rounded-full glass glass-hover text-sm font-bold"
          >
            View All Features
          </button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.slice(0, 6).map((f, i) => (
            <FeatureCard key={i} feature={f} />
          ))}
        </div>
      </section>

      {/* Product Tour (Dashboard) */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="glass rounded-[3rem] overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-12 md:p-20 flex flex-col justify-center">
              <span className="text-teal-glow text-xs font-bold tracking-widest uppercase mb-4">Web Dashboard</span>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Centralized <br />Monitoring</h2>
              <p className="text-xl text-white/60 mb-12 leading-relaxed">
                A medical-grade interface designed for high-stakes environments. Manage patients, visualize real-time EEG, and generate reports with one click.
              </p>
              <div className="space-y-6">
                {[
                  'Multi-channel real-time visualization',
                  'Automated seizure annotation',
                  'Secure cloud patient management',
                  'Instant PDF report generation'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-white/80">
                    <div className="w-6 h-6 rounded-full bg-teal-glow/20 flex items-center justify-center">
                      <Zap size={12} className="text-teal-glow" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-navy-800 p-12 flex items-center justify-center relative">
              <div className="w-full aspect-video glass rounded-xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="h-8 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
                <div className="p-8 space-y-4">
                  <div className="h-4 w-1/3 bg-white/10 rounded" />
                  <div className="h-32 w-full bg-teal-glow/5 rounded-lg border border-teal-glow/20 flex items-center justify-center">
                    <Activity className="text-teal-glow/30" size={48} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-white/5 rounded" />
                    <div className="h-20 bg-white/5 rounded" />
                    <div className="h-20 bg-white/5 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Watch NeuroCare in Action</h2>
          <p className="text-white/60">See how our deep learning models detect seizures in real-time.</p>
        </div>
        <div className="aspect-video glass rounded-3xl overflow-hidden shadow-2xl border-4 border-white/5">
          <iframe
            src={LINKS.demoVideo}
            title="NeuroCare Demo"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="mt-12 text-center">
          <button 
            onClick={() => setCurrentPage('contact')}
            className="px-10 py-4 rounded-full bg-white text-navy-900 font-bold hover:bg-teal-glow transition-colors"
          >
            Request a Live Demo
          </button>
        </div>
      </section>

      {/* Security & Performance */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { label: 'End-to-End Encryption', icon: Shield },
            { label: '99.9% Uptime SLA', icon: Clock },
            { label: 'HIPAA Compliant', icon: Lock },
            { label: 'Real-Time Sync', icon: Zap }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="text-center p-8 glass rounded-2xl">
                <Icon className="text-teal-glow mx-auto mb-4" size={32} />
                <h4 className="font-bold">{item.label}</h4>
              </div>
            );
          })}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Meet the Team</h2>
          <p className="text-white/60 max-w-2xl mx-auto">The visionaries behind the future of clinical neurology.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {TEAM_DATA.map((member, i) => (
            <div key={i} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(20%-1.6rem)] min-w-[300px]">
              <TeamCard member={member} />
            </div>
          ))}
        </div>
      </section>

      {/* Open Source & Research */}
      <section className="max-w-4xl mx-auto px-6 text-center">
        <div className="glass p-12 md:p-20 rounded-[3rem]">
          <h2 className="text-4xl font-bold mb-8">Open Source & Research</h2>
          <p className="text-xl text-white/60 mb-12">
            NeuroCare is built on a foundation of rigorous academic research and open collaboration.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href={LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-white text-navy-900 font-bold hover:bg-teal-glow transition-colors"
            >
              <Github size={20} />
              View GitHub Repository
            </a>
            <a 
              href={LINKS.thesis}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 rounded-full glass glass-hover font-bold"
            >
              <FileText size={20} />
              Read Thesis (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tighter">Ready to transform <br /><span className="text-teal-glow">your clinic?</span></h2>
        <button 
          onClick={() => setCurrentPage('contact')}
          className="px-12 py-5 rounded-full bg-teal-glow text-navy-900 font-black text-xl hover:shadow-[0_0_40px_rgba(0,242,255,0.6)] transition-all"
        >
          Request Demo Now
        </button>
      </section>
    </div>
  );
}
