'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, ClipboardList, CheckCircle, AlertCircle, Plus, ArrowRight, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usersAPI } from '@/lib/api';
import { cn, getStatusColor, formatStatusLabel, timeAgo, formatAge, getGenderLabel } from '@/lib/utils';

function StatCard({ label, value, icon: Icon, color = 'text-primary', bg = 'bg-primary/10' }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', bg)}>
          <Icon className={cn('w-4 h-4', color)} />
        </div>
      </div>
      <div className="text-3xl font-bold">{value ?? '—'}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'authority';
  const isFinder = user?.role === 'finder';
  const isParent = user?.role === 'parent';

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isAdmin ? "Here's what needs your attention today." : 'Your activity at a glance.'}
          </p>
        </div>
        {(isFinder || isAdmin) && (
          <Link
            href="/reports/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Report
          </Link>
        )}
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {isAdmin && (
            <>
              <StatCard label="Total Reports" value={data.stats.totalReports} icon={FileText} />
              <StatCard label="Open Cases" value={data.stats.openReports} icon={AlertCircle} color="text-orange-600" bg="bg-orange-100" />
              <StatCard label="Resolved" value={data.stats.resolvedReports} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
              <StatCard label="Pending Claims" value={data.stats.pendingClaims} icon={ClipboardList} color="text-purple-600" bg="bg-purple-100" />
            </>
          )}
          {isFinder && (
            <>
              <StatCard label="My Reports" value={data.stats.totalReports} icon={FileText} />
              <StatCard label="Open" value={data.stats.openReports} icon={AlertCircle} color="text-orange-600" bg="bg-orange-100" />
              <StatCard label="Resolved" value={data.stats.resolvedReports} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            </>
          )}
          {isParent && (
            <>
              <StatCard label="Claims Filed" value={data.stats.totalClaims} icon={ClipboardList} />
              <StatCard label="Pending" value={data.stats.pendingClaims} icon={Clock} color="text-yellow-600" bg="bg-yellow-100" />
              <StatCard label="Approved" value={data.stats.approvedClaims} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
            </>
          )}
        </div>
      )}

      {/* Recent activity */}
      {(data?.recentReports?.length > 0 || data?.recentClaims?.length > 0) && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Reports */}
          {data?.recentReports && (
            <div className="bg-white rounded-xl border">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">Recent Reports</h2>
                <Link href={isFinder ? '/dashboard/my-reports' : '/reports'} className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y">
                {data.recentReports.map((report) => (
                  <Link
                    key={report._id}
                    href={`/reports/${report._id}`}
                    className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      {report.photos?.[0] && (
                        <Image src={report.photos[0].url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{report.caseId}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {getGenderLabel(report.child?.gender)}, {formatAge(report.child?.estimatedAge)} · {report.foundLocation?.city}
                      </div>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(report.status))}>
                      {formatStatusLabel(report.status)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Claims */}
          {data?.recentClaims && (
            <div className="bg-white rounded-xl border">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold">{isAdmin ? 'Pending Claims' : 'My Claims'}</h2>
                <Link href={isAdmin ? '/dashboard/claims' : '/dashboard/my-claims'} className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="divide-y">
                {data.recentClaims.map((claim) => (
                  <Link
                    key={claim._id}
                    href={isAdmin ? `/dashboard/claims/${claim._id}` : `/dashboard/my-claims`}
                    className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{claim.report?.caseId || claim.claimId}</div>
                      <div className="text-xs text-muted-foreground">{timeAgo(claim.createdAt)}</div>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(claim.status))}>
                      {formatStatusLabel(claim.status)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick action for parents */}
      {isParent && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-center gap-4">
          <AlertCircle className="w-8 h-8 text-blue-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900">Looking for your child?</h3>
            <p className="text-sm text-blue-700 mt-0.5">Browse the latest reports and submit a claim if you recognize your child.</p>
          </div>
          <Link
            href="/reports"
            className="ml-auto shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Search Reports
          </Link>
        </div>
      )}
    </div>
  );
}
