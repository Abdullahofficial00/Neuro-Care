import React from 'react';
import { motion } from 'motion/react';
import { Activity, Brain, Bell, Layout, Smartphone, Database, Shield, Zap, FileText } from 'lucide-react';
import { FEATURES } from '../constants';
import FeatureCard from '../components/FeatureCard';

export default function Product() {
  return (
    <div className="pt-32 pb-32 space-y-32">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-black mb-8 tracking-tighter"
        >
          The <span className="text-teal-glow">NeuroCare</span> <br />Ecosystem
        </motion.h1>
        <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
          A modular, medical-grade platform designed to scale from private clinics to large-scale research hospitals.
        </p>
      </section>

      {/* Data Pipeline */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="order-2 md:order-1">
            <div className="space-y-12">
              <div className="glass p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Database className="text-teal-glow" /> Data Pipeline
                </h3>
                <p className="text-white/60">
                  Our ingestion engine handles multi-channel EEG streams with zero packet loss. Data is pre-processed in real-time to remove artifacts and noise before inference.
                </p>
              </div>
              <div className="glass p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Brain className="text-teal-glow" /> Model Inference
                </h3>
                <p className="text-white/60">
                  Proprietary Deep Learning architectures (CNN-LSTM) analyze temporal patterns to detect seizure onset with 98% accuracy in clinical trials.
                </p>
              </div>
              <div className="glass p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <Bell className="text-teal-glow" /> Smart Alerts
                </h3>
                <p className="text-white/60">
                  Intelligent routing ensures the right clinician is notified via the right channel based on severity and patient history.
                </p>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Technical <br /><span className="text-white/40">Architecture</span></h2>
            <div className="aspect-square glass rounded-[3rem] p-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-teal-glow/5 animate-pulse" />
              
              {/* Animated Signal Paths */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 400">
                <motion.path
                  d="M 200 100 L 100 200 L 200 300 L 300 200 Z"
                  fill="none"
                  stroke="#00f2ff"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.circle r="3" fill="#00f2ff">
                  <animateMotion dur="4s" repeatCount="indefinite" path="M 200 100 L 100 200 L 200 300 L 300 200 Z" />
                </motion.circle>
              </svg>

              <div className="relative z-10 w-full space-y-12">
                {/* Top Node: EEG Input */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute -inset-4 bg-teal-glow/20 blur-xl rounded-full animate-pulse" />
                    <div className="w-20 h-20 rounded-2xl bg-teal-glow/20 flex items-center justify-center border border-teal-glow/50 relative z-10">
                      <Activity className="text-teal-glow" size={32} />
                    </div>
                  </div>
                </motion.div>

                {/* Middle Layer: Processing */}
                <div className="flex justify-between items-center px-4">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    <Database className="text-white/40" size={24} />
                  </motion.div>
                  
                  <div className="flex-grow flex flex-col items-center gap-2">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-glow/50 to-transparent relative">
                      <motion.div 
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-teal-glow rounded-full blur-sm"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-teal-glow/40 uppercase tracking-widest">Processing</span>
                  </div>

                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                    className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    <Zap className="text-white/40" size={24} />
                  </motion.div>
                </div>

                {/* Bottom Node: AI Inference */}
                <motion.div 
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <div className="absolute -inset-8 bg-teal-glow/10 blur-2xl rounded-full animate-pulse" />
                    <div className="w-28 h-28 rounded-full bg-navy-800 border-2 border-teal-glow flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,242,255,0.2)] relative z-10">
                      <Brain className="text-teal-glow mb-1" size={44} />
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            className="w-1 h-1 bg-teal-glow rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-16 text-center">Full Feature Set</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((f, i) => (
            <FeatureCard key={i} feature={f} />
          ))}
        </div>
      </section>

      {/* Mobile App */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="glass rounded-[3rem] p-12 md:p-24 overflow-hidden relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-teal-glow text-xs font-bold tracking-widest uppercase mb-4">Mobile Companion</span>
              <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Patient Care <br />In Your Pocket</h2>
              <p className="text-xl text-white/60 mb-12 leading-relaxed">
                The NeuroCare mobile app allows patients and caregivers to receive instant alerts, track seizure history, and communicate with clinical teams from anywhere.
              </p>
              <div className="flex gap-4">
                <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Smartphone className="text-teal-glow" />
                  <span>iOS App</span>
                </div>
                <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                  <Smartphone className="text-teal-glow" />
                  <span>Android App</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-64 h-[500px] bg-navy-800 rounded-[3rem] border-8 border-white/10 mx-auto relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/10 rounded-b-2xl" />
                <div className="p-8 pt-12 space-y-6">
                  <div className="w-12 h-12 rounded-xl bg-teal-glow/20 flex items-center justify-center">
                    <Activity className="text-teal-glow" size={24} />
                  </div>
                  <div className="h-4 w-full bg-white/10 rounded" />
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                  <div className="h-32 w-full bg-teal-glow/5 rounded-2xl border border-teal-glow/20 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-10 w-full bg-teal-glow rounded-xl" />
                    <div className="h-10 w-full bg-white/5 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
