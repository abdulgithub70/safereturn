'use client';
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, ChevronRight, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { reportsAPI } from '@/lib/api';
import { childReportSchema } from '@/lib/validations';
import { cn } from '@/lib/utils';

const STEPS = ['Child Info', 'Location', 'Custody', 'Photos'];

const EYE_COLORS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Black', 'Unknown'];
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Unknown'];
const HAIR_LENGTHS = ['Bald/Very Short', 'Short', 'Medium', 'Long', 'Unknown'];
const SKIN_TONES = ['Fair', 'Light', 'Medium', 'Olive', 'Brown', 'Dark', 'Unknown'];
const CUSTODY_OPTIONS = [
  { value: 'finder', label: 'Currently with me (finder)' },
  { value: 'police', label: 'Police station' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'shelter', label: 'Shelter / Safe house' },
  { value: 'ngo', label: 'NGO / Organization' },
  { value: 'other', label: 'Other' },
];

function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
            i < current ? 'bg-green-500 text-white' :
            i === current ? 'bg-primary text-primary-foreground' :
            'bg-muted text-muted-foreground'
          )}>
            {i < current ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          <span className={cn('hidden sm:block ml-2 text-sm', i === current ? 'font-semibold' : 'text-muted-foreground')}>
            {step}
          </span>
          {i < steps.length - 1 && (
            <div className={cn('w-8 sm:w-12 h-0.5 mx-2', i < current ? 'bg-green-500' : 'bg-muted')} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function NewReportPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(childReportSchema),
    defaultValues: {
      child: { gender: 'unknown', estimatedAge: undefined },
      alertLevel: 'high',
      currentCustody: 'finder',
    },
  });

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
    if (valid.length !== files.length) toast.error('Some files were skipped (must be images under 10MB)');
    setPhotos(prev => [...prev, ...valid].slice(0, 10));
    const previews = valid.map(f => URL.createObjectURL(f));
    setPhotoPreview(prev => [...prev, ...previews].slice(0, 10));
  };

  const removePhoto = (idx) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
    setPhotoPreview(prev => prev.filter((_, i) => i !== idx));
  };

  const nextStep = async () => {
    const fieldsToValidate = {
      0: ['child.estimatedAge', 'child.gender'],
      1: ['foundLocation.description', 'foundLocation.city', 'foundLocation.country', 'foundAt'],
      2: ['currentCustody'],
    };
    const valid = await trigger(fieldsToValidate[step] || []);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data) => {
    if (photos.length === 0) {
      toast.error('Please upload at least one photo of the child');
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // Flatten and append all form data
      const flattenObject = (obj, prefix = '') => {
        Object.entries(obj).forEach(([key, val]) => {
          const fullKey = prefix ? `${prefix}[${key}]` : key;
          if (val !== null && val !== undefined && val !== '') {
            if (typeof val === 'object' && !Array.isArray(val)) {
              flattenObject(val, fullKey);
            } else if (Array.isArray(val)) {
              val.forEach(v => formData.append(fullKey, v));
            } else {
              formData.append(fullKey, val);
            }
          }
        });
      };
      flattenObject(data);
      photos.forEach(photo => formData.append('photos', photo));

      const res = await reportsAPI.create(formData);
      toast.success('Report submitted successfully!');
      router.push(`/reports/${res.data.data.report._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputError = ({ name }) => {
    const keys = name.split('.');
    let error = errors;
    for (const k of keys) error = error?.[k];
    return error ? <p className="text-destructive text-xs mt-1">{error.message}</p> : null;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Report a Found Child</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Please provide as much detail as possible to help reunite this child with their family.
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
          <div className="text-sm text-orange-700">
            <strong>Important:</strong> If the child needs immediate medical attention or is in danger, call emergency services first before submitting this report.
          </div>
        </div>

        <StepIndicator steps={STEPS} current={step} />

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 0: Child Info */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="font-semibold text-lg mb-4">Child Physical Information</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Estimated Age <span className="text-destructive">*</span></label>
                    <input {...register('child.estimatedAge', { valueAsNumber: true })} type="number" min={0} max={17} placeholder="e.g. 3"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    <InputError name="child.estimatedAge" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Gender <span className="text-destructive">*</span></label>
                    <select {...register('child.gender')} className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                      <option value="unknown">Unknown</option>
                      <option value="male">Boy</option>
                      <option value="female">Girl</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Child Name (if known)</label>
                  <input {...register('child.name')} type="text" placeholder="Leave blank if unknown"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Eye Color', name: 'child.physicalDescription.eyeColor', options: EYE_COLORS },
                    { label: 'Hair Color', name: 'child.physicalDescription.hairColor', options: HAIR_COLORS },
                    { label: 'Hair Length', name: 'child.physicalDescription.hairLength', options: HAIR_LENGTHS },
                    { label: 'Skin Tone', name: 'child.physicalDescription.skinTone', options: SKIN_TONES },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium mb-1.5">{field.label}</label>
                      <select {...register(field.name)} className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value="">Select...</option>
                        {field.options.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Height (approx.)</label>
                    <input {...register('child.physicalDescription.height')} type="text" placeholder="e.g. 3 feet 2 inches"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Weight (approx.)</label>
                    <input {...register('child.physicalDescription.weight')} type="text" placeholder="e.g. 15 kg"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Clothing Description</label>
                  <textarea {...register('child.physicalDescription.clothingDescription')} rows={2} placeholder="Describe what the child is wearing..."
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Distinctive Marks</label>
                  <textarea {...register('child.physicalDescription.distinctiveMarks')} rows={2} placeholder="Birthmarks, scars, tattoos, or other identifying features..."
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Medical Needs / Urgency</label>
                  <textarea {...register('child.medicalNeeds')} rows={2} placeholder="Any medical conditions, medications, or special needs..."
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                </div>
              </div>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="font-semibold text-lg mb-4">Where Was the Child Found?</h2>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Location Description <span className="text-destructive">*</span></label>
                  <textarea {...register('foundLocation.description')} rows={3} placeholder="Describe exactly where you found the child (e.g., near the main entrance of Central Park, by the fountain)"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none" />
                  <InputError name="foundLocation.description" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Nearest Landmark</label>
                  <input {...register('foundLocation.landmark')} type="text" placeholder="e.g., Near Metro Station XYZ"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Street Address</label>
                  <input {...register('foundLocation.address')} type="text" placeholder="Street address (if known)"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City <span className="text-destructive">*</span></label>
                    <input {...register('foundLocation.city')} type="text" placeholder="City"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    <InputError name="foundLocation.city" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">State/Province</label>
                    <input {...register('foundLocation.state')} type="text" placeholder="State"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Country <span className="text-destructive">*</span></label>
                  <input {...register('foundLocation.country')} type="text" placeholder="Country"
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <InputError name="foundLocation.country" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Date & Time Found <span className="text-destructive">*</span></label>
                  <input {...register('foundAt')} type="datetime-local" max={new Date().toISOString().slice(0, 16)}
                    className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <InputError name="foundAt" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Alert Level</label>
                  <select {...register('alertLevel')} className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="critical">Critical — Child needs immediate help</option>
                    <option value="high">High — Urgent attention needed</option>
                    <option value="medium">Medium — Stable situation</option>
                    <option value="low">Low — Child is safe</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Custody */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-semibold text-lg mb-4">Current Custody Details</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Where is the child now? <span className="text-destructive">*</span></label>
                  <div className="space-y-2">
                    {CUSTODY_OPTIONS.map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                        <input {...register('currentCustody')} type="radio" value={opt.value} className="accent-primary" />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  <InputError name="currentCustody" />
                </div>

                <div className="pt-2 space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Details (Optional)</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Organization Name</label>
                    <input {...register('custodyDetails.organization')} type="text" placeholder="e.g. City Police Station No. 3"
                      className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Contact Person</label>
                      <input {...register('custodyDetails.contactPerson')} type="text" placeholder="Officer/staff name"
                        className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Contact Phone</label>
                      <input {...register('custodyDetails.contactPhone')} type="tel" placeholder="Phone number"
                        className="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Photos */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="font-semibold text-lg mb-1">Upload Photos</h2>
                <p className="text-sm text-muted-foreground mb-4">Upload clear photos of the child face and appearance. You can add up to 10 photos.</p>

                <div
                  className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  onClick={() => document.getElementById('photo-input').click()}
                >
                  <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-medium text-sm">Click to upload photos</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP · Max 10MB each · Up to 10 photos</p>
                  <input id="photo-input" type="file" multiple accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>

                {photoPreview.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {photoPreview.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <Image src={src} alt={`Photo ${i + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i)}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium">Primary</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {photos.length === 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    At least one photo is required to submit a report.
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              {step > 0 ? (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
              ) : <div />}

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={nextStep}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting || photos.length === 0}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
