'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Clock, User, Shield, AlertTriangle, ChevronLeft, Share2, Flag, CheckCircle, FileText, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn, getStatusColor, formatStatusLabel, getAlertColor, timeAgo, formatDateTime, formatAge, getGenderLabel } from '@/lib/utils';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2.5 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    reportsAPI.getById(id)
      .then(res => {
        setReport(res.data.data.report);
      })
      .catch(() => toast.error('Report not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `Case ${report?.caseId}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="container py-8 max-w-5xl mx-auto">
        <div className="h-8 w-40 bg-muted rounded animate-pulse mb-6" />
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-2xl animate-pulse" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-6 bg-muted rounded animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container py-20 text-center">
        <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-semibold text-xl">Report not found</h2>
        <Link href="/reports" className="text-primary text-sm mt-2 hover:underline">Back to reports</Link>
      </div>
    );
  }

  const isOwner = user?._id === report.reportedBy?._id;
  const isAdmin = user?.role === 'admin' || user?.role === 'authority';
  const canClaim = isAuthenticated && user?.role === 'parent' && report.status !== 'resolved' && report.status !== 'closed';

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-accent transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
            {(isOwner || isAdmin) && (
              <Link href={`/reports/${id}/edit`} className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-accent transition-colors">
                Edit Report
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-5xl mx-auto">
        {/* Alert banner */}
        <div className={cn('rounded-xl border p-4 mb-6 flex items-center gap-3', getAlertColor(report.alertLevel))}>
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <span className="font-semibold">Alert Level: {report.alertLevel?.toUpperCase()}</span>
            <span className="text-sm ml-2">· Case {report.caseId}</span>
          </div>
          <span className={cn('ml-auto text-sm font-medium px-3 py-1 rounded-full', getStatusColor(report.status))}>
            {formatStatusLabel(report.status)}
          </span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Photos */}
          <div className="lg:col-span-2">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted relative">
              {report.photos?.[activePhoto] ? (
                <Image
                  src={report.photos[activePhoto].url}
                  alt={`Case ${report.caseId} photo ${activePhoto + 1}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <AlertTriangle className="w-16 h-16 text-muted-foreground/20" />
                </div>
              )}
            </div>
            {report.photos?.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {report.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhoto(i)}
                    className={cn('w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors', activePhoto === i ? 'border-primary' : 'border-transparent')}
                  >
                    <Image src={photo.url} alt="" width={64} height={64} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Child info */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Child Information
              </h2>
              <InfoRow label="Name" value={report.child?.name !== 'Unknown' ? report.child?.name : '—'} />
              <InfoRow label="Gender" value={getGenderLabel(report.child?.gender)} />
              <InfoRow label="Estimated Age" value={formatAge(report.child?.estimatedAge)} />
              <InfoRow label="Eye Color" value={report.child?.physicalDescription?.eyeColor} />
              <InfoRow label="Hair Color" value={report.child?.physicalDescription?.hairColor} />
              <InfoRow label="Hair Length" value={report.child?.physicalDescription?.hairLength} />
              <InfoRow label="Skin Tone" value={report.child?.physicalDescription?.skinTone} />
              <InfoRow label="Height" value={report.child?.physicalDescription?.height} />
              <InfoRow label="Weight" value={report.child?.physicalDescription?.weight} />
              <InfoRow label="Clothing" value={report.child?.physicalDescription?.clothingDescription} />
              {report.child?.physicalDescription?.distinctiveMarks && (
                <div className="py-2.5 border-b last:border-b-0">
                  <span className="text-sm text-muted-foreground block mb-1">Distinctive Marks</span>
                  <span className="text-sm font-medium">{report.child.physicalDescription.distinctiveMarks}</span>
                </div>
              )}
              {report.child?.medicalNeeds && (
                <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3">
                  <span className="text-xs font-semibold text-red-700 block mb-1">⚠ Medical Needs</span>
                  <span className="text-sm text-red-600">{report.child.medicalNeeds}</span>
                </div>
              )}
              {report.child?.languages?.length > 0 && (
                <InfoRow label="Languages" value={report.child.languages.join(', ')} />
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Location Found
              </h2>
              <InfoRow label="Description" value={report.foundLocation?.description} />
              <InfoRow label="Address" value={report.foundLocation?.address} />
              <InfoRow label="Landmark" value={report.foundLocation?.landmark} />
              <InfoRow label="City" value={report.foundLocation?.city} />
              <InfoRow label="Country" value={report.foundLocation?.country} />
              <InfoRow label="Date & Time" value={formatDateTime(report.foundAt)} />
            </div>

            {/* Custody */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Current Custody
              </h2>
              <InfoRow label="In Custody Of" value={report.currentCustody?.replace('_', ' ')} />
              <InfoRow label="Organization" value={report.custodyDetails?.organization} />
              <InfoRow label="Contact Person" value={report.custodyDetails?.contactPerson} />
            </div>

            {/* Reporter / Finder Contact */}
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Reported By
              </h2>
              <InfoRow label="Name" value={report.reportedBy?.name} />
              <InfoRow label="Role" value={report.reportedBy?.role} />
              <InfoRow label="Organization" value={report.reportedBy?.organization} />
              <InfoRow label="Reported" value={timeAgo(report.createdAt)} />

              {/* Finder contact — visible to logged in users */}
              {isAuthenticated && report.status !== 'resolved' && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Finder Contact Details
                  </p>
                  <div className="space-y-2">
                    {report.reportedBy?.phone && (
                      <a
                        href={`tel:${report.reportedBy.phone}`}
                        className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-green-700 font-medium">Call Finder Directly</div>
                          <div className="text-sm font-bold text-green-900">{report.reportedBy.phone}</div>
                        </div>
                        <span className="text-xs text-green-600 font-medium group-hover:underline">Call Now</span>
                      </a>
                    )}
                    {report.reportedBy?.email && (
                      <a
                        href={`mailto:${report.reportedBy.email}`}
                        className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-blue-700 font-medium">Email Finder</div>
                          <div className="text-sm font-bold text-blue-900 truncate">{report.reportedBy.email}</div>
                        </div>
                        <span className="text-xs text-blue-600 font-medium group-hover:underline">Email</span>
                      </a>
                    )}
                    {!report.reportedBy?.phone && !report.reportedBy?.email && (
                      <p className="text-sm text-muted-foreground italic">Contact details not provided by finder.</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Contact info visible only to logged-in users. Please also submit a formal claim for verification.
                  </p>
                </div>
              )}

              {/* If not logged in — prompt to login to see contact */}
              {!isAuthenticated && report.status !== 'resolved' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Phone className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">
                      <Link href="/auth/login" className="text-primary font-medium hover:underline">Sign in</Link>
                      {" "}to see finder contact details and call directly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {canClaim && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900">Is this your child?</h3>
                    <p className="text-sm text-green-700 mt-1 mb-4">
                      If you recognize this child, submit a claim. Our team will verify your identity before arranging a reunion.
                    </p>
                    <Link
                      href={`/reports/${id}/claim`}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                    >
                      Submit a Claim
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {!isAuthenticated && report.status !== 'resolved' && (
              <div className="bg-muted/50 border rounded-xl p-5 text-center">
                <p className="text-sm text-muted-foreground mb-3">Create an account to submit a claim if this is your child</p>
                <Link href="/auth/register?role=parent" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Sign Up to Claim
                </Link>
              </div>
            )}

            {report.status === 'resolved' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-900">Case Resolved</h3>
                <p className="text-sm text-green-700 mt-1">This child has been reunited with their family. 🎉</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
