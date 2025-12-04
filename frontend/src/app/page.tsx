'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Radio, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-6 h-16 flex items-center justify-between border-b border-white/10 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Radio className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">RailTrack<span className="text-primary">.LK</span></span>
        </div>
        <div className="flex gap-4">
          {/* Public Access Only - Admin login hidden */}
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
          
          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Live System Operational
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
              Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">Train Tracking</span> <br /> for Sri Lanka
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Experience real-time precision. Monitor train locations, manage routes, and analyze performance with our advanced satellite-based tracking system.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link href="/track/SLR_001">
                <Button size="lg" className="h-12 px-8 text-lg bg-white text-background hover:bg-gray-100 font-semibold">
                  Track a Train
                </Button>
              </Link>
              {/* Admin Portal link removed for security */}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 bg-black/20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<MapPin className="h-8 w-8 text-cyan-400" />}
              title="Real-Time GPS"
              description="Pinpoint train locations with high-accuracy GPS tracking updated every 5 seconds."
            />
            <FeatureCard 
              icon={<Radio className="h-8 w-8 text-violet-400" />}
              title="IoT Integration"
              description="Seamlessly connects with onboard IoT devices for automated status reporting."
            />
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-emerald-400" />}
              title="Secure Management"
              description="Role-based access control ensures only authorized personnel can modify routes."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Perzeus All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors duration-300 group">
      <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
