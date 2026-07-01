'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, X, MapPin, Clock, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { reportsAPI } from '@/lib/api';
import { cn, getStatusColor, formatStatusLabel, getAlertBadgeStyle, timeAgo, formatAge, getGenderLabel } from '@/lib/utils';

const GENDERS = [
  { value: '', label: 'All Genders' },
  { value: 'male', label: 'Boy' },
  { value: 'female', label: 'Girl' },
  { value: 'unknown', label: 'Unknown' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'under_verification', label: 'Under Verification' },
];

function ReportCard({ report }) {
  const photo = report.photos?.[0]?.url;

  return (
    <Link
      href={`/reports/${report._id}`}
      className="group bg-white rounded-xl border hover:shadow-md transition-all overflow-hidden flex flex-col"
    >
      {/* Photo */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={`Case ${report.caseId}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 opacity-20" />
          </div>
        )}
        {/* Alert badge */}
        <div className={cn(
          'absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full',
          getAlertBadgeStyle(report.alertLevel)
        )}>
          {report.alertLevel?.toUpperCase()}
        </div>
        {/* Status badge */}
        <div className={cn(
          'absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full',
          getStatusColor(report.status)
        )}>
          {formatStatusLabel(report.status)}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <span className="text-xs font-mono text-muted-foreground">{report.caseId}</span>
            <div className="font-semibold text-sm mt-0.5">
              {getGenderLabel(report.child?.gender)}, {formatAge(report.child?.estimatedAge)}
            </div>
          </div>
        </div>

        {report.child?.physicalDescription?.clothingDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {report.child.physicalDescription.clothingDescription}
          </p>
        )}

        <div className="mt-auto space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{report.foundLocation?.city}, {report.foundLocation?.country}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3 shrink-0" />
            <span>Found {timeAgo(report.foundAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    status: '',
    city: '',
    minAge: '',
    maxAge: '',
    page: 1,
    limit: 12,
  });

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const { data } = await reportsAPI.getAll(params);
      setReports(data.data);
      setMeta(data.meta);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchReports, 300);
    return () => clearTimeout(t);
  }, [fetchReports]);

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const hasActiveFilters = filters.search || filters.gender || filters.status || filters.city || filters.minAge || filters.maxAge;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by case ID, city, or description..."
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {filters.search && (
                <button onClick={() => setFilter('search', '')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors',
                showFilters || hasActiveFilters ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'
              )}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && <span className="bg-white text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold">!</span>}
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <select value={filters.gender} onChange={e => setFilter('gender', e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {GENDERS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>

              <select value={filters.status} onChange={e => setFilter('status', e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>

              <input type="text" placeholder="City..." value={filters.city}
                onChange={e => setFilter('city', e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />

              <input type="number" placeholder="Min age" value={filters.minAge} min={0} max={17}
                onChange={e => setFilter('minAge', e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />

              <input type="number" placeholder="Max age" value={filters.maxAge} min={0} max={17}
                onChange={e => setFilter('maxAge', e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />

              {hasActiveFilters && (
                <button onClick={() => setFilters(f => ({ ...f, search: '', gender: '', status: '', city: '', minAge: '', maxAge: '', page: 1 }))}
                  className="text-destructive text-sm font-medium hover:underline text-left">
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container py-6">
        {/* Result count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${meta?.total ?? 0} reports found`}
          </p>
          <Link href="/reports/new" className="hidden sm:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            + Report Found Child
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-xl border overflow-hidden">
                <div className="aspect-[4/3] bg-muted animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No reports found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {reports.map(report => <ReportCard key={report._id} report={report} />)}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              disabled={!meta.hasPrevPage}
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-muted-foreground px-3">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              disabled={!meta.hasNextPage}
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
