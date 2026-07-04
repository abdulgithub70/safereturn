'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Shield, Heart, Users, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleReportClick = () => {
    if (isAuthenticated) {
      router.push('/reports/new');
    } else {
      router.push('/auth/login?redirect=/reports/new');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Shield className="w-6 h-6" />
            SafeReturn
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/reports"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Reports
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium px-4 py-2 border rounded-md hover:bg-accent transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-indigo-50 -z-10" />
        <div className="container max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <AlertCircle className="w-4 h-4" />
            Every second counts when a child is missing
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
            Reuniting Families,
            <span className="text-primary block mt-1">One Child at a Time</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            SafeReturn connects finders of missing children with their families through a secure, 
            verified platform. Report a found child, or search for your missing one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleReportClick}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              <AlertCircle className="w-5 h-5" />
              Report a Found Child
            </button>
            <Link
              href="/reports"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-border px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent transition-colors"
            >
              <Search className="w-5 h-5" />
              Search for a Child
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Children Reunited', value: '2,847', highlight: true },
              { label: 'Active Cases', value: '143', highlight: false },
              { label: 'Verified Partners', value: '380+', highlight: false },
              { label: 'Countries', value: '12', highlight: false },
            ].map((stat) => (
              <div key={stat.label}>
                <div className={`text-4xl font-bold mb-1 ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How SafeReturn Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A simple, secure process designed to reunite children with their families quickly and safely.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="text-sm font-semibold text-primary mb-3 uppercase tracking-wider">For Finders</div>
            <h3 className="text-2xl font-bold mb-6">You found a child. Here is what to do.</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Create an account', desc: 'Register as a finder — takes under 2 minutes.' },
                { step: '2', title: 'Report the child', desc: 'Upload photos, describe physical features, and log where you found them.' },
                { step: '3', title: 'Coordinate with authorities', desc: 'Our platform notifies law enforcement and facilitates safe custody.' },
                { step: '4', title: 'Help with reunification', desc: 'Once a parent is verified, help complete the safe handoff.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-orange-600 mb-3 uppercase tracking-wider">For Parents</div>
            <h3 className="text-2xl font-bold mb-6">Your child is missing. We are here to help.</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Register immediately', desc: 'Create an account as a parent or guardian.' },
                { step: '2', title: 'Search reports', desc: 'Browse reports by location, age, gender, and physical features.' },
                { step: '3', title: 'Submit a claim', desc: 'If you recognize your child, submit a claim with supporting documents.' },
                { step: '4', title: 'Verification & reunion', desc: 'Our team verifies your identity before arranging a safe reunion.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                    {item.step}
                  </div>
                  <div>
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety features */}
        <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-center mb-8">Built for Child Safety First</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Verified Identities',
                desc: 'Every parent claiming a child goes through identity verification before any reunion.',
              },
              {
                icon: CheckCircle,
                title: 'Document Authentication',
                desc: 'Birth certificates, government IDs, and photo evidence are reviewed by trained staff.',
              },
              {
                icon: Users,
                title: 'Authority Coordination',
                desc: 'Law enforcement is notified of all cases and involved in the verification process.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm">
                <feature.icon className="w-8 h-8 text-primary mb-3" />
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <Heart className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Every child deserves to be home.</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join thousands of community members, NGOs, and law enforcement officers helping 
            reunite families across the region.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Create Your Account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-white">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>SafeReturn © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Use</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
