import { LucideIcon, Brain, Activity, Zap, Bell, Users, Shield, Layout, Smartphone, Database, FileText, RefreshCw, Lock } from 'lucide-react';

export interface TeamMember {
  name: string;
  role: string;
  linkedin: string;
  image: string;
  initials: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const TEAM_DATA: TeamMember[] = [
  {
    name: "Waqas Ali",
    role: "Project Lead",
    linkedin: "https://www.linkedin.com/in/waqas-ali-429922261/",
    image: "/public/team/waqas.png",
    initials: "WA"
  },
  {
    name: "Muhammad Abdullah Kasuri",
    role: "Founder & CEO",
    linkedin: "https://www.linkedin.com/in/muhammad-abdullah-kasuri/",
    image: "/public/team/abdullah.png",
    initials: "MAK"
  },
  {
    name: "Iqra Rafique",
    role: "Mobile App Developer",
    linkedin: "https://www.linkedin.com/in/iqra-rafique/",
    image: "/public/team/iqra.png",
    initials: "IR"
  },
  {
    name: "Shaheer Khalid",
    role: "Associate Software Engineer / AI Specialist",
    linkedin: "http://linkedin.com/in/shaheer-khalid-814b54245/",
    image: "/public/team/shaheer.png",
    initials: "SK"
  },
  {
    name: "Samia Liaqat",
    role: "Documentation Lead",
    linkedin: "https://www.linkedin.com/in/samia-liaqat/",
    image: "/public/team/samia.png",
    initials: "SL"
  }
];

export const FEATURES: Feature[] = [
  {
    title: "EEG Data Collection",
    description: "Secure storage and real-time streaming of multi-channel EEG data.",
    icon: Database
  },
  {
    title: "Real-Time Detection",
    description: "Advanced Deep Learning models for instantaneous seizure identification.",
    icon: Zap
  },
  {
    title: "Seizure Prediction",
    description: "Proactive forecasting using temporal brainwave patterns.",
    icon: Brain
  },
  {
    title: "Instant Alerts",
    description: "Multi-channel notifications via Email, SMS, and In-app push.",
    icon: Bell
  },
  {
    title: "Patient Management",
    description: "Comprehensive clinical records and history tracking.",
    icon: Users
  },
  {
    title: "Monitoring Dashboard",
    description: "Live visualization of brain activity for clinical staff.",
    icon: Layout
  },
  {
    title: "EEG Visualization",
    description: "High-fidelity multi-channel view with zoom and annotations.",
    icon: Activity
  },
  {
    title: "Report Generation",
    description: "Automated clinical reports with export functionality (PDF/CSV).",
    icon: FileText
  },
  {
    title: "Device Integration",
    description: "Seamless connectivity with standard medical EEG hardware.",
    icon: RefreshCw
  },
  {
    title: "Security & Audits",
    description: "End-to-end encryption with full backup and audit logs.",
    icon: Lock
  }
];

export const LINKS = {
  github: "https://github.com/Abdullahofficial00/Neuro-Care",
  thesis: "https://github.com/Abdullahofficial00/Neuro-Care/blob/main/Helping%20Material/Thesis.pdf",
  demoVideo: "https://www.youtube.com/embed/wM8OvJbT91s"
};
