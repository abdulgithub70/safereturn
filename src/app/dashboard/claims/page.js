'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { claimsAPI } from '@/lib/api';
import { cn, getStatusColor, formatStatusLabel, timeAgo, formatAge, getGenderLabel } from '@/lib/utils';
import { ClipboardList, Flag, CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'under_review', 'approved', 'rejected', 'documents_requested'];

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (statusFilter) params.status = statusFilter;
    claimsAPI.getAll(params)
      .then(res => {
        setClaims(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load claims'))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const handleReview = async (id, status) => {
    try {
      await claimsAPI.review(id, { status, reviewNotes });
      toast.success(`Claim ${status}`);
      setClaims(prev => prev.map(c => c._id === id ? { ...c, status, reviewNotes } : c));
      setReviewingId(null);
      setReviewNotes('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to review claim');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Review Claims</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Verify and process parent/guardian claims</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-white border hover:bg-accent'
            )}>
            {s ? formatStatusLabel(s) : 'All Claims'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold">No claims found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(claim => (
            <div key={claim._id} className="bg-white rounded-xl border">
              <div className="flex gap-4 p-4">
                {/* Report photo */}
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                  {claim.report?.photos?.[0]?.url && (
                    <Image src={claim.report.photos[0].url} alt="" fill className="object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{claim.claimId}</span>
                        {claim.flagged && <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><Flag className="w-3 h-3" />Flagged</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Case: {claim.report?.caseId} · {getGenderLabel(claim.report?.child?.gender)}, {formatAge(claim.report?.child?.estimatedAge)}
                      </div>
                    </div>
                    <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium shrink-0', getStatusColor(claim.status))}>
                      {formatStatusLabel(claim.status)}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Claimant</span>
                      <div className="font-medium">{claim.claimant?.name}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Relationship</span>
                      <div className="font-medium capitalize">{claim.relationship?.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Child Name (claimed)</span>
                      <div className="font-medium">{claim.childInfo?.name}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted</span>
                      <div className="font-medium">{timeAgo(claim.createdAt)}</div>
                    </div>
                  </div>

                  {/* Documents */}
                  {claim.documents?.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{claim.documents.length} document{claim.documents.length !== 1 ? 's' : ''} submitted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Review panel */}
              {reviewingId === claim._id && (
                <div className="p-4 border-t bg-muted/20 space-y-3">
                  <textarea
                    value={reviewNotes}
                    onChange={e => setReviewNotes(e.target.value)}
                    placeholder="Review notes (optional)..."
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(claim._id, 'under_review')}
                      className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-accent transition-colors">
                      Mark Under Review
                    </button>
                    <button onClick={() => handleReview(claim._id, 'documents_requested')}
                      className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-accent transition-colors">
                      Request Documents
                    </button>
                    <button onClick={() => handleReview(claim._id, 'approved')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => handleReview(claim._id, 'rejected')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button onClick={() => { setReviewingId(null); setReviewNotes(''); }}
                      className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <Link href={`/reports/${claim.report?._id}`} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Eye className="w-3.5 h-3.5" /> View Report
                </Link>
                <div className="flex items-center gap-2">
                  {!['approved', 'rejected', 'withdrawn'].includes(claim.status) && (
                    <button
                      onClick={() => setReviewingId(reviewingId === claim._id ? null : claim._id)}
                      className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Review
                    </button>
                  )}
                  {!claim.flagged && (
                    <button onClick={async () => {
                      const reason = prompt('Flag reason:');
                      if (reason) {
                        await claimsAPI.flag(claim._id, reason);
                        toast.success('Claim flagged');
                        setClaims(prev => prev.map(c => c._id === claim._id ? { ...c, flagged: true, flagReason: reason } : c));
                      }
                    }} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-accent transition-colors flex items-center gap-1">
                      <Flag className="w-3 h-3" /> Flag
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
