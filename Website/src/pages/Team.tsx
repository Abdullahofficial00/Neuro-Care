import React from 'react';
import { motion } from 'motion/react';
import { TEAM_DATA } from '../constants';
import TeamCard from '../components/TeamCard';
import { Linkedin, Mail, Github } from 'lucide-react';

export default function Team() {
  return (
    <div className="pt-32 pb-32 space-y-32">
      <section className="max-w-7xl mx-auto px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-black mb-8 tracking-tighter"
        >
          The <span className="text-teal-glow">Visionaries</span>
        </motion.h1>
        <p className="text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
          A multidisciplinary team of engineers, AI specialists, and clinical documentation experts dedicated to solving complex neurological challenges.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-8">
          {TEAM_DATA.map((member, i) => (
            <div key={i} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(20%-1.6rem)] min-w-[300px]">
              <TeamCard member={member} />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6">
        <div className="glass p-12 md:p-20 rounded-[3rem] text-center">
          <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
          <p className="text-xl text-white/60 leading-relaxed italic">
            "To empower clinicians with intelligent tools that save lives by reducing the time between seizure onset and medical intervention."
          </p>
          <div className="mt-12 flex justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-glow mb-2">98%</div>
              <div className="text-sm text-white/40 uppercase tracking-widest">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-glow mb-2">24/7</div>
              <div className="text-sm text-white/40 uppercase tracking-widest">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-glow mb-2">&lt;1s</div>
              <div className="text-sm text-white/40 uppercase tracking-widest">Latency</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
