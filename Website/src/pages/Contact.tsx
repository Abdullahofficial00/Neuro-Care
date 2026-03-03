import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('sending');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <div className="pt-32 pb-32">
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black mb-8 tracking-tighter"
          >
            Get in <span className="text-teal-glow">Touch</span>
          </motion.h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Ready to implement NeuroCare in your facility? Our team is here to help you get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {/* Info */}
          <div className="space-y-12">
            <div className="glass p-12 rounded-[2rem] space-y-8">
              <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-teal-glow/10 flex items-center justify-center shrink-0">
                  <Mail className="text-teal-glow" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Email Us</h4>
                  <p className="text-white/60">mabdullahamanat2810@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-teal-glow/10 flex items-center justify-center shrink-0">
                  <MapPin className="text-teal-glow" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Our Location</h4>
                  <p className="text-white/60">UET Lahore main campus <br />Lahore, Pakistan</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-xl bg-teal-glow/10 flex items-center justify-center shrink-0">
                  <Phone className="text-teal-glow" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Call Support</h4>
                  <p className="text-white/60">03124817936</p>
                </div>
              </div>
            </div>

            <a 
              href="https://share.google/O7RLrORrBPUsDBKUy"
              target="_blank"
              rel="noopener noreferrer"
              className="block glass p-8 rounded-[2rem] aspect-video relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-navy-800 flex items-center justify-center group-hover:bg-navy-700 transition-colors">
                <div className="text-center">
                  <MapPin className="text-teal-glow mx-auto mb-4 group-hover:scale-110 transition-transform" size={48} />
                  <p className="text-white/40 font-bold uppercase tracking-widest text-xs">View on Google Maps</p>
                </div>
              </div>
            </a>
          </div>

          {/* Form */}
          <div className="glass p-12 rounded-[2rem]">
            <h2 className="text-3xl font-bold mb-8">Request a Demo</h2>
            {formState === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-20"
              >
                <div className="w-20 h-20 rounded-full bg-teal-glow/20 flex items-center justify-center mb-6">
                  <CheckCircle className="text-teal-glow" size={48} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-white/60">Our team will contact you within 24 hours.</p>
                <button 
                  onClick={() => setFormState('idle')}
                  className="mt-8 text-teal-glow font-bold"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form 
                action="https://formspree.io/f/xdalqowk"
                method="POST"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFormState('sending');
                  const form = e.target as HTMLFormElement;
                  const data = new FormData(form);
                  try {
                    const response = await fetch(form.action, {
                      method: form.method,
                      body: data,
                      headers: {
                        'Accept': 'application/json'
                      }
                    });
                    if (response.ok) {
                      setFormState('success');
                      form.reset();
                    } else {
                      alert('Oops! There was a problem submitting your form');
                      setFormState('idle');
                    }
                  } catch (error) {
                    alert('Oops! There was a problem submitting your form');
                    setFormState('idle');
                  }
                }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Full Name</label>
                  <input 
                    required
                    type="text" 
                    name="name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-teal-glow transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Email Address</label>
                  <input 
                    required
                    type="email" 
                    name="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-teal-glow transition-colors"
                    placeholder="john@organization.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Organization</label>
                  <input 
                    required
                    type="text" 
                    name="organization"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-teal-glow transition-colors"
                    placeholder="City General Hospital"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60 uppercase tracking-wider">Message</label>
                  <textarea 
                    required
                    name="message"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-teal-glow transition-colors resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>
                <button 
                  type="submit"
                  disabled={formState === 'sending'}
                  className="w-full py-5 rounded-xl bg-teal-glow text-navy-900 font-black text-lg hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {formState === 'sending' ? 'Sending...' : (
                    <>
                      Request Demo <Send size={20} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
