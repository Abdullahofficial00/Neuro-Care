import React from 'react';
import { motion } from 'motion/react';
import { Linkedin, ExternalLink } from 'lucide-react';
import { TeamMember } from '../constants';

export default function TeamCard({ member }: { member: TeamMember }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="relative group h-[450px] w-full"
    >
      {/* Card Container */}
      <div className="relative h-full w-full glass rounded-tr-[5rem] rounded-bl-[5rem] rounded-tl-2xl rounded-br-2xl overflow-hidden border border-white/10 group-hover:border-teal-glow/40 transition-all duration-700 shadow-2xl">
        
        {/* Image - Full Bleed */}
        <div className="absolute inset-0 z-0">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement?.classList.add('bg-gradient-to-br', 'from-navy-800', 'to-navy-900', 'flex', 'items-center', 'justify-center');
            }}
            referrerPolicy="no-referrer"
          />
          {/* Fallback Initials */}
          <div className="absolute inset-0 flex items-center justify-center text-8xl font-black text-white/5 pointer-events-none uppercase tracking-tighter">
            {member.initials}
          </div>
          
          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500" />
        </div>

        {/* Scanning Line Animation */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-teal-glow/30 z-10 blur-sm pointer-events-none"
        />

        {/* Content - Floating at bottom */}
        <div className="absolute inset-x-0 bottom-0 p-6 z-10">
          <div className="glass-dark p-6 rounded-br-[4rem] rounded-tl-[2rem] rounded-tr-xl rounded-bl-xl border border-white/10 backdrop-blur-2xl translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-glow animate-pulse" />
                  <span className="text-[9px] font-bold text-teal-glow uppercase tracking-[0.2em]">Verified Staff</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-teal-glow transition-colors">{member.name}</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{member.role}</p>
              </div>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-teal-glow hover:text-navy-900 transition-all duration-300 shadow-lg"
              >
                <Linkedin size={18} />
              </a>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[8px] font-mono text-white/20 uppercase">ID: NC-{member.initials}-2026</span>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <div className="w-1 h-1 rounded-full bg-teal-glow/40" />
              </div>
            </div>
          </div>
        </div>

        {/* Technical Accents */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-glow animate-pulse" />
          <span className="text-[10px] font-mono text-teal-glow/60 tracking-widest uppercase">Active</span>
        </div>
      </div>
    </motion.div>
  );
}
