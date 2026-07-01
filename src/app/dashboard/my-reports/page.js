'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportsAPI } from '@/lib/api';
import { cn, getStatusColor, formatStatusLabel, getAlertBadgeStyle, timeAgo, formatAge, getGenderLabel } from '@/lib/utils';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [page, setPage] = useState(1);

  const fetchReports = () => {
    setLoading(true);
    reportsAPI.getMyReports({ page, limit: 10 })
      .then(res => {
        setReports(res.data.data);
        setMeta(res.data.meta);
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, [page]);

  const handleDelete = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    setDeletingId(reportId);
    try {
      await reportsAPI.delete(reportId);
      toast.success('Report deleted');
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete report');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{meta?.total ?? 0} reports submitted</p>
        </div>
        <Link
          href="/reports/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Report
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No reports yet</h3>
          <p className="text-muted-foreground text-sm mb-6">When you find a lost child, report it here to help connect them with their family.</p>
          <Link href="/reports/new" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Report a Found Child
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report._id} className="bg-white rounded-xl border hover:shadow-sm transition-shadow">
              <div className="flex gap-4 p-4">
                {/* Photo */}
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0 relative">
                  {report.photos?.[0]?.url ? (
                    <Image src={report.photos[0].url} alt={report.caseId} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-7 h-7 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">{report.caseId}</span>
                      <div className="font-semibold">
                        {getGenderLabel(report.child?.gender)}, {formatAge(report.child?.estimatedAge)}
                        {report.child?.name && report.child.name !== 'Unknown' && ` · ${report.child.name}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-bold', getAlertBadgeStyle(report.alertLevel))}>
                        {report.alertLevel?.toUpperCase()}
                      </span>
                      <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-medium', getStatusColor(report.status))}>
                        {formatStatusLabel(report.status)}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {report.foundLocation?.city}, {report.foundLocation?.country}
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Reported {timeAgo(report.createdAt)}</span>
                    <span>·</span>
                    <span>{report.viewCount || 0} views</span>
                    {report.claims?.length > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-primary font-medium">{report.claims.length} claim{report.claims.length !== 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 px-4 py-3 border-t bg-muted/20">
                <Link href={`/reports/${report._id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-white transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
                {!['resolved', 'closed'].includes(report.status) && (
                  <Link href={`/reports/${report._id}/edit`}
                    className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-medium hover:bg-white transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Link>
                )}
                {!['under_verification', 'resolved'].includes(report.status) && (
                  <button
                    onClick={() => handleDelete(report._id)}
                    disabled={deletingId === report._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg text-xs font-medium hover:bg-destructive/5 transition-colors disabled:opacity-50"
                  >
                    {deletingId === report._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button disabled={!meta.hasPrevPage} onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                Previous
              </button>
              <span className="text-sm text-muted-foreground">{page} / {meta.totalPages}</span>
              <button disabled={!meta.hasNextPage} onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors">
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
