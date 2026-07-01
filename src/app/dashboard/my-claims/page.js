'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ClipboardList, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { claimsAPI } from '@/lib/api';
import { cn, getStatusColor, formatStatusLabel, timeAgo, formatAge, getGenderLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_ICON = {
  pending: Clock,
  under_review: AlertCircle,
  approved: CheckCircle,
  rejected: XCircle,
  withdrawn: XCircle,
  documents_requested: AlertCircle,
};

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    claimsAPI.getMyClaims({ page, limit: 10 })
      .then(res => {
        setClaims(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load claims'))
      .finally(() => setLoading(false));
  }, [page]);

  const handleWithdraw = async (claimId) => {
    if (!confirm('Are you sure you want to withdraw this claim?')) return;
    try {
      await claimsAPI.withdraw(claimId);
      toast.success('Claim withdrawn');
      setClaims(prev => prev.map(c => c._id === claimId ? { ...c, status: 'withdrawn' } : c));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to withdraw claim');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Claims</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{meta?.total ?? 0} claims submitted</p>
        </div>
        <Link href="/reports" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
          Browse Reports
        </Link>
      </div>

      {claims.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No claims yet</h3>
          <p className="text-muted-foreground text-sm mb-6">If you recognize a missing child in a report, submit a claim to begin the verification process.</p>
          <Link href="/reports" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            Search Reports
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map(claim => {
            const StatusIcon = STATUS_ICON[claim.status] || Clock;
            const photo = claim.report?.photos?.[0]?.url;

            return (
              <div key={claim._id} className="bg-white rounded-xl border hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4 p-4">
                  {/* Photo */}
                  <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                    {photo ? (
                      <Image src={photo} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-sm">{claim.report?.caseId}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {getGenderLabel(claim.report?.child?.gender)}, {formatAge(claim.report?.child?.estimatedAge)} · {claim.report?.foundLocation?.city}
                        </div>
                      </div>
                      <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium shrink-0', getStatusColor(claim.status))}>
                        {formatStatusLabel(claim.status)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="capitalize">{claim.relationship?.replace('_', ' ')}</span>
                      <span>·</span>
                      <span>Submitted {timeAgo(claim.createdAt)}</span>
                    </div>

                    {/* Status message */}
                    {claim.status === 'pending' && (
                      <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                        Your claim is waiting for review. We'll notify you of any updates.
                      </div>
                    )}
                    {claim.status === 'under_review' && (
                      <div className="mt-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        Your claim is being actively reviewed by our team.
                      </div>
                    )}
                    {claim.status === 'approved' && (
                      <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ Claim approved! Check your email for next steps.
                      </div>
                    )}
                    {claim.status === 'rejected' && claim.reviewNotes && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        {claim.reviewNotes}
                      </div>
                    )}
                    {claim.status === 'documents_requested' && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        Additional documents are required. Contact our team.
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                  <Link href={`/reports/${claim.report?._id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    View Report <ChevronRight className="w-3 h-3" />
                  </Link>
                  {['pending', 'under_review'].includes(claim.status) && (
                    <button
                      onClick={() => handleWithdraw(claim._id)}
                      className="text-xs text-destructive hover:underline"
                    >
                      Withdraw Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
