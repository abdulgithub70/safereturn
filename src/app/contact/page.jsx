'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Mail, Phone, MapPin, Clock, Send, Loader2,
  CheckCircle, AlertCircle, MessageSquare, Users,
  ChevronDown, ChevronUp, ArrowLeft, Heart, ExternalLink
} from 'lucide-react';

const FAQ = [
  {
    q: "How do I report a child I found?",
    a: "Register a free account as a 'Finder', then click 'Report Found Child' from your dashboard. Fill in the 4-step form with the child's physical details, location, custody info, and upload photos. The report goes live immediately.",
  },
  {
    q: "How long does claim verification take?",
    a: "Our team reviews claims within 24 hours. If additional documents are needed, we notify you by email. Urgent cases with medical needs are prioritized and reviewed within 2–4 hours.",
  },
  {
    q: "Is my personal information safe?",
    a: "Yes. All data is encrypted in transit and at rest. Verification documents are stored in private, authenticated storage. We never share your personal information with third parties.",
  },
  {
    q: "What documents do I need to claim my child?",
    a: "You will need: a government-issued photo ID, the child's birth certificate, and if possible, a recent photo of you with the child. Medical records or school records are also helpful for verification.",
  },
  {
    q: "Can I use this platform if I am law enforcement?",
    a: "Absolutely. Register as 'Law Enforcement / NGO' and provide your badge number and organization. Once verified by an admin, you get access to the claims review panel and case management tools.",
  },
  {
    q: "What if I submitted false information accidentally?",
    a: "Contact us immediately at saifiabduldelhi@gmail.com with your case ID. Our team can correct or update information. Note that intentionally false claims are a serious offense reported to authorities.",
  },
  {
    q: "How do I delete my account or report?",
    a: "You can delete your own reports from Dashboard → My Reports, as long as the case is not under active verification. To delete your account, email us with your registered email address.",
  },
];

const CONTACT_METHODS = [
  {
    icon: Mail,
    label: 'Email Us',
    value: 'saifiabduldelhi@gmail.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:saifiabduldelhi@gmail.com',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    icon: Phone,
    label: 'Emergency Helpline',
    value: '+91 112',
    sub: 'National Child Helpline (24/7)',
    href: 'tel:+91112',
    color: 'bg-red-50 text-red-600 border-red-100',
  },
  {
    icon: Phone,
    label: 'Child Helpline',
    value: '+91 1098',
    sub: 'Childline India Foundation',
    href: 'tel:+911098',
    color: 'bg-orange-50 text-orange-600 border-orange-100',
  },
  {
    icon: MapPin,
    label: 'Office Address',
    value: 'Shaheen Bagh, New Delhi, India',
    sub: 'SafeReturn Headquarters',
    href: 'https://maps.google.com/?q=Shaheen+Bagh,+New+Delhi,+India',
    color: 'bg-green-50 text-green-600 border-green-100',
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium text-sm pr-4">{item.q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t pt-3 bg-muted/10">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', category: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStatus('loading');

    // Simulate API call — replace with real endpoint when backend contact route is added
    try {
      await new Promise(res => setTimeout(res, 1500));
      setStatus('success');
      setForm({ name: '', email: '', subject: '', category: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    if (status === 'success' || status === 'error') setStatus(null);
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Shield className="w-6 h-6" />
            SafeReturn
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Link href="/auth/login" className="text-sm font-medium px-4 py-2 border rounded-md hover:bg-accent transition-colors">
              Sign In
            </Link>
            <Link href="/auth/register" className="text-sm font-medium px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-background to-indigo-50 -z-10" />
        <div className="container max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <MessageSquare className="w-4 h-4" />
            We are here to help
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Get in Touch with <span className="text-primary">SafeReturn</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have a question about a case, need technical support, or want to partner with us?
            Our team responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white py-3">
        <div className="container text-center text-sm font-medium flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            If a child is in immediate danger — call <strong>112</strong> (Emergency) or <strong>1098</strong> (Childline India) right now.
            Do not wait.
          </span>
        </div>
      </div>

      <div className="container py-16 max-w-6xl mx-auto">

        {/* Contact method cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {CONTACT_METHODS.map((method) => (
            <a
              key={method.label}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
              className={`flex flex-col gap-3 p-5 rounded-xl border hover:shadow-md transition-all group ${method.color}`}
            >
              <div className="w-10 h-10 rounded-lg bg-white/70 flex items-center justify-center">
                <method.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">{method.label}</div>
                <div className="font-bold text-sm">{method.value}</div>
                <div className="text-xs opacity-70 mt-0.5">{method.sub}</div>
              </div>
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity mt-auto self-end" />
            </a>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-12">

          {/* Contact Form — left 3 cols */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Send us a Message</h2>
                  <p className="text-sm text-muted-foreground">We will get back to you within 24 hours</p>
                </div>
              </div>

              {status === 'success' && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">Message sent successfully!</p>
                    <p className="text-sm text-green-700 mt-0.5">
                      Thank you for reaching out. Abdullah will review your message and reply to your email within 24 hours.
                    </p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-800">Something went wrong.</p>
                    <p className="text-sm text-red-700 mt-0.5">
                      Please try again or email us directly at{' '}
                      <a href="mailto:saifiabduldelhi@gmail.com" className="underline font-medium">
                        saifiabduldelhi@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Your Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                    {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                    />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                  >
                    <option value="">Select a category...</option>
                    <option value="report_issue">Issue with a Report</option>
                    <option value="claim_help">Help with a Claim</option>
                    <option value="account">Account / Login Problem</option>
                    <option value="verification">Identity Verification</option>
                    <option value="partnership">Partnership / NGO Inquiry</option>
                    <option value="media">Media / Press Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => handleChange('subject', e.target.value)}
                    placeholder="Brief subject of your message"
                    className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                  />
                  {errors.subject && <p className="text-destructive text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={e => handleChange('message', e.target.value)}
                    rows={5}
                    placeholder="Describe your question or issue in detail. If related to a case, include the Case ID (e.g. CASE-A1B2C3D4)."
                    className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message
                      ? <p className="text-destructive text-xs">{errors.message}</p>
                      : <span />
                    }
                    <span className="text-xs text-muted-foreground">{form.message.length}/2000</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 flex gap-2 text-xs text-amber-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Do not include sensitive personal data (Aadhaar, bank details) in this form.
                    For urgent child safety issues, call <strong>1098</strong> immediately.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'loading'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><Send className="w-4 h-4" /> Send Message</>
                  }
                </button>
              </form>
            </div>
          </div>

          {/* Right sidebar — 2 cols */}
          <div className="lg:col-span-2 space-y-6">

            {/* Team Card */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Meet the Team
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                  A
                </div>
                <div>
                  <div className="font-bold text-base">Abdullah Saifi</div>
                  <div className="text-sm text-muted-foreground">Founder & Lead Developer</div>
                  <a
                    href="mailto:saifiabduldelhi@gmail.com"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                  >
                    <Mail className="w-3 h-3" />
                    saifiabduldelhi@gmail.com
                  </a>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground leading-relaxed">
                SafeReturn was built with the mission of using technology to protect children
                and reunite families. Every feature is designed with child safety as the top priority.
              </div>
            </div>

            {/* Office Info */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Office Location
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">SafeReturn Headquarters</div>
                    <div className="text-muted-foreground">New Delhi, India — 110001</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Office Hours</div>
                    <div className="text-muted-foreground">Mon – Sat: 9:00 AM – 6:00 PM IST</div>
                    <div className="text-muted-foreground">Sunday: Closed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Email Response</div>
                    <div className="text-muted-foreground">Within 24 hours on working days</div>
                  </div>
                </div>
              </div>

              {/* Embedded Map */}
              <div className="mt-4 rounded-xl overflow-hidden border h-40 bg-muted">
                <iframe
                  title="SafeReturn Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d224345.89156878574!2d77.06889754725782!3d28.52758200617607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x37205b715389640!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1719300000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Emergency numbers */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <h3 className="font-semibold mb-3 text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Emergency Numbers
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Police', number: '100' },
                  { label: 'Emergency', number: '112' },
                  { label: 'Childline India', number: '1098' },
                  { label: 'Women Helpline', number: '1091' },
                  { label: 'National Missing', number: '14417' },
                ].map(item => (
                  <a key={item.label} href={`tel:${item.number}`}
                    className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-red-100 hover:border-red-300 transition-colors">
                    <span className="text-sm font-medium text-red-800">{item.label}</span>
                    <span className="text-sm font-bold text-red-600">{item.number}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Answers to the most common questions about using SafeReturn.
              Cannot find what you need? Send us a message above.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map((item, i) => <FAQItem key={i} item={item} />)}
          </div>
        </div>

        {/* Partner CTA */}
        <div className="mt-20 bg-primary rounded-2xl p-10 text-primary-foreground text-center">
          <Heart className="w-10 h-10 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-3">Want to Partner with SafeReturn?</h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
            Are you an NGO, child welfare organization, or law enforcement agency?
            We would love to collaborate and expand our reach to protect more children across India.
          </p>
          <a
            href="mailto:saifiabduldelhi@gmail.com?subject=Partnership Inquiry — SafeReturn"
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm"
          >
            <Mail className="w-4 h-4" />
            Email Abdullah for Partnership
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-16 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>SafeReturn © {new Date().getFullYear()} · Built by Abdullah Saifi</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/reports" className="hover:text-foreground transition-colors">Browse Reports</Link>
            <Link href="/auth/register" className="hover:text-foreground transition-colors">Register</Link>
            <a href="mailto:saifiabduldelhi@gmail.com" className="hover:text-foreground transition-colors">Email Us</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
