import React from 'react';
import { Brain, Github, Linkedin, Mail } from 'lucide-react';
import { LINKS } from '../constants';

export default function Footer({ setCurrentPage }: { setCurrentPage: (p: string) => void }) {
  return (
    <footer className="bg-navy-900 border-t border-white/5 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-teal-glow flex items-center justify-center">
                <Brain className="text-navy-900" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tighter">NeuroCare</span>
            </div>
            <p className="text-white/40 max-w-sm mb-8">
              Advanced EEG-based seizure detection and management system powered by deep learning. Clinical precision at your fingertips.
            </p>
            <div className="flex gap-4">
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="mailto:mabdullahamanat2810@gmail.com" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-white/40">
              <li><button onClick={() => setCurrentPage('product')} className="hover:text-teal-glow transition-colors">Features</button></li>
              <li><button onClick={() => setCurrentPage('product')} className="hover:text-teal-glow transition-colors">Dashboard</button></li>
              <li><button onClick={() => setCurrentPage('product')} className="hover:text-teal-glow transition-colors">Mobile App</button></li>
              <li><button onClick={() => setCurrentPage('contact')} className="hover:text-teal-glow transition-colors">Security</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-white/40">
              <li><a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="hover:text-teal-glow transition-colors">GitHub</a></li>
              <li><a href={LINKS.thesis} target="_blank" rel="noopener noreferrer" className="hover:text-teal-glow transition-colors">Research Thesis</a></li>
              <li><a href={LINKS.demoVideo} target="_blank" rel="noopener noreferrer" className="hover:text-teal-glow transition-colors">Demo Video</a></li>
              <li><button onClick={() => setCurrentPage('contact')} className="hover:text-teal-glow transition-colors">Contact</button></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/20">
          <p>© 2026 NeuroCare AI. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
