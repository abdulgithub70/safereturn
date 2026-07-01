'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Upload, X, AlertCircle, Shield, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportsAPI, claimsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { claimSchema } from '@/lib/validations';
import { formatAge, getGenderLabel } from '@/lib/utils';

const RELATIONSHIP_OPTIONS = [
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'guardian', label: 'Legal Guardian' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'sibling', label: 'Sibling (over 18)' },
  { value: 'other_relative', label: 'Other Relative' },
  { value: 'other', label: 'Other' },
];

const DOC_TYPES = [
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'government_id', label: 'Government ID' },
  { value: 'photo_with_child', label: 'Photo with Child' },
  { value: 'medical_record', label: 'Medical Record' },
  { value: 'school_record', label: 'School Record' },
  { value: 'other', label: 'Other Document' },
];

export default function ClaimPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [report, setReport] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docPreviews, setDocPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(claimSchema),
    defaultValues: { preferredContact: { method: 'both' } },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/reports/${id}/claim`);
      return;
    }
    if (user?.role !== 'parent') {
      toast.error('Only parents or guardians can submit claims');
      router.push(`/reports/${id}`);
      return;
    }
    reportsAPI.getById(id)
      .then(res => setReport(res.data.data.report))
      .catch(() => toast.error('Report not found'));
  }, [id, isAuthenticated, user, router]);

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.size <= 20 * 1024 * 1024);
    setDocuments(prev => [...prev, ...valid].slice(0, 5));
    const previews = valid.map(f => ({
      name: f.name,
      type: f.type,
      url: f.type.startsWith('image/') ? URL.createObjectURL(f) : null,
    }));
    setDocPreviews(prev => [...prev, ...previews].slice(0, 5));
  };

  const removeDoc = (idx) => {
    setDocuments(prev => prev.filter((_, i) => i !== idx));
    setDocPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('relationship', data.relationship);
      formData.append('childInfo[name]', data.childInfo.name);
      if (data.childInfo.dateOfBirth) formData.append('childInfo[dateOfBirth]', data.childInfo.dateOfBirth);
      if (data.childInfo.birthmark) formData.append('childInfo[birthmark]', data.childInfo.birthmark);
      if (data.childInfo.medicalHistory) formData.append('childInfo[medicalHistory]', data.childInfo.medicalHistory);
      if (data.childInfo.schoolName) formData.append('childInfo[schoolName]', data.childInfo.schoolName);
      formData.append('statement', data.statement);
      formData.append('preferredContact[method]', data.preferredContact.method);
      if (data.preferredContact.availableTime) formData.append('preferredContact[availableTime]', data.preferredContact.availableTime);
      documents.forEach(doc => formData.append('documents', doc));

      await claimsAPI.submit(id, formData);
      toast.success('Claim submitted. Our team will review it shortly.');
      router.push('/dashboard/my-claims');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) return (
    <div className="container py-20 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Submit a Claim</h1>
          <p className="text-muted-foreground text-sm mt-1">For case {report.caseId}</p>
        </div>

        {/* Case preview */}
        <div className="bg-white rounded-xl border p-4 mb-6 flex gap-4">
          {report.photos?.[0] && (
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 relative">
              <Image src={report.photos[0].url} alt="" fill className="object-cover" />
            </div>
          )}
          <div>
            <div className="text-xs font-mono text-muted-foreground">{report.caseId}</div>
            <div className="font-medium">{getGenderLabel(report.child?.gender)}, {formatAge(report.child?.estimatedAge)}</div>
            <div className="text-sm text-muted-foreground">Found in {report.foundLocation?.city}, {report.foundLocation?.country}</div>
          </div>
        </div>

        {/* Safety notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 shrink-0" />
            <div className="text-sm text-blue-700">
              <strong>Your claim will be verified.</strong> Our team will review your documents and identity before any reunion is arranged. Do not share sensitive information outside this platform.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Relationship */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Your Relationship to the Child</h2>
            <div className="grid grid-cols-2 gap-2">
              {RELATIONSHIP_OPTIONS.map(opt => (
                <label key={opt.value} className="flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors text-sm">
                  <input {...register('relationship')} type="radio" value={opt.value} className="accent-primary" />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.relationship && <p className="text-destructive text-xs mt-2">{errors.relationship.message}</p>}
          </div>

          {/* Child Information */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Child Details (as you know them)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Child Full Name <span className="text-destructive">*</span></label>
                <input {...register('childInfo.name')} type="text" placeholder="Enter child's full name"
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                {errors.childInfo?.name && <p className="text-destructive text-xs mt-1">{errors.childInfo.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                  <input {...register('childInfo.dateOfBirth')} type="date"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">School Name</label>
                  <input {...register('childInfo.schoolName')} type="text" placeholder="Last school attended"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Identifying Birthmarks / Features</label>
                <textarea {...register('childInfo.birthmark')} rows={2} placeholder="Any birthmarks, scars, or identifying physical features that only you would know..."
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Medical History (if any)</label>
                <textarea {...register('childInfo.medicalHistory')} rows={2} placeholder="Allergies, conditions, medications..."
                  className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
              </div>
            </div>
          </div>

          {/* Statement */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-2">Your Statement <span className="text-destructive">*</span></h2>
            <p className="text-sm text-muted-foreground mb-4">Describe who you are, how you know this child, when they went missing, and any other relevant details.</p>
            <textarea {...register('statement')} rows={6} placeholder="Write a detailed account of who you are and your relationship to this child. Include when and where they went missing and any other information that can help verify your claim..."
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
            {errors.statement && <p className="text-destructive text-xs mt-1">{errors.statement.message}</p>}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-2">Supporting Documents</h2>
            <p className="text-sm text-muted-foreground mb-4">Upload birth certificate, government ID, photos with the child, or other relevant documents. All documents are stored securely.</p>

            <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors mb-4"
              onClick={() => document.getElementById('doc-input').click()}>
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="font-medium text-sm">Upload documents</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF · Max 20MB each · Up to 5 files</p>
              <input id="doc-input" type="file" multiple accept="image/*,.pdf" onChange={handleDocumentUpload} className="hidden" />
            </div>

            {docPreviews.length > 0 && (
              <div className="space-y-2">
                {docPreviews.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {doc.url ? (
                      <Image src={doc.url} alt="" width={40} height={40} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <span className="text-sm truncate flex-1">{doc.name}</span>
                    <button type="button" onClick={() => removeDoc(i)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact preference */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Contact Preference</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {['phone', 'email', 'both'].map(method => (
                <label key={method} className="flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors text-sm capitalize">
                  <input {...register('preferredContact.method')} type="radio" value={method} className="accent-primary" />
                  {method === 'both' ? 'Both' : method.charAt(0).toUpperCase() + method.slice(1)}
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Best time to reach you</label>
              <input {...register('preferredContact.availableTime')} type="text" placeholder="e.g. Weekdays 9am-5pm, or anytime"
                className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 text-sm text-orange-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>By submitting this claim, you confirm all information is truthful. False claims are a serious offense and will be reported to authorities.</span>
          </div>

          <div className="flex gap-4">
            <button type="button" onClick={() => router.back()}
              className="flex-1 py-2.5 border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60 transition-colors">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
