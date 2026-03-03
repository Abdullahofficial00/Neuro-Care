import React from 'react';
import { motion } from 'motion/react';
import { Feature } from '../constants';

export default function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="glass glass-hover p-8 rounded-2xl group"
    >
      <div className="w-12 h-12 rounded-xl bg-teal-glow/10 flex items-center justify-center mb-6 group-hover:bg-teal-glow/20 transition-colors">
        <Icon className="text-teal-glow" size={24} />
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-teal-glow transition-colors">
        {feature.title}
      </h3>
      <p className="text-white/60 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  );
}
