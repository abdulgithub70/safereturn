import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 flex flex-col">
      <nav className="p-4">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary">
          <Shield className="w-6 h-6" />
          SafeReturn
        </Link>
      </nav>
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
      <footer className="p-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SafeReturn. All rights reserved. Child safety is our priority.
      </footer>
    </div>
  );
}
