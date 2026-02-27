import { motion } from "framer-motion";
import MysticalSearch from "@/components/features/MysticalSearch";
import MysticalGlow from "@/components/ui/MysticalGlow";
import { FiCode, FiActivity, FiUsers, FiStar, FiZap } from "react-icons/fi";
import SEO from "@/components/layout/SEO";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[80vh] py-12">
      <SEO />
      {/* Background Decorative Glows */}
      <MysticalGlow
        standalone
        color="cyan"
        variant="radial"
        size={600}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none"
      />

      <div className="w-full max-w-4xl px-6 space-y-16 text-center relative z-10">
        {/* Hero Section */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-primary/5 border border-cyan-primary/10 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-primary mb-4"
          >
            <FiZap className="animate-pulse" /> The Ultimate Developer Analysis
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl sm:text-8xl font-black tracking-tighter"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-white via-cyan-primary to-cyan-deep">
              Unveil Your
            </span>
            <br />
            <span className="text-white drop-shadow-[0_0_30px_rgba(0,255,255,0.3)]">
              Mystical Power
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-foreground/50 max-w-2xl mx-auto leading-relaxed"
          >
            Deep dive into your GitHub presence. Analyze code quality, activity pulse,
            and community impact with precision.
          </motion.p>
        </div>

        {/* Search Interface */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <MysticalSearch autoFocus />
        </motion.div>

        {/* Features Grid (Small) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/5"
        >
          <FeatureIcon icon={<FiActivity />} label="Activity Pulse" />
          <FeatureIcon icon={<FiCode />} label="Code Health" />
          <FeatureIcon icon={<FiUsers />} iconColor="text-purple-400" label="Community ROI" />
          <FeatureIcon icon={<FiStar />} iconColor="text-emerald-400" label="Impact Mapping" />
        </motion.div>
      </div>

      {/* Subtle Bottom Ambient Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-primary/5 to-transparent pointer-events-none" />
    </div>
  );
}

function FeatureIcon({ icon, label, iconColor = "text-cyan-primary" }: { icon: React.ReactNode, label: string, iconColor?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 group cursor-default">
      <div className={`text-xl ${iconColor} opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 group-hover:text-foreground/60 transition-colors">
        {label}
      </span>
    </div>
  );
}

