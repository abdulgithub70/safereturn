'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Upload, Loader2, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { usersAPI, authAPI } from '@/lib/api';
import { profileUpdateSchema, passwordChangeSchema } from '@/lib/validations';
import { getRoleLabel, getRoleBadgeColor, cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors, isDirty: profileDirty } } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      organization: user?.organization || '',
    },
  });

  const { register: regPass, handleSubmit: handlePass, reset: resetPass, formState: { errors: passErrors, isSubmitting: passSubmitting } } = useForm({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onProfileSubmit = async (data) => {
    try {
      const res = await usersAPI.updateProfile(data);
      updateUser(res.data.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully');
      resetPass();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await usersAPI.uploadProfilePhoto(formData);
      updateUser({ profilePhoto: res.data.data.user.profilePhoto });
      toast.success('Profile photo updated');
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      {/* Profile header card */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {user?.profilePhoto?.url ? (
                <Image src={user.profilePhoto.url} alt={user.name} width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-background rounded-full flex items-center justify-center cursor-pointer hover:bg-accent transition-colors shadow-sm">
              {uploadingPhoto ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3 text-muted-foreground" />}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            </label>
          </div>

          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn('text-xs px-2.5 py-0.5 rounded-full font-medium', getRoleBadgeColor(user?.role))}>
                {getRoleLabel(user?.role)}
              </span>
              {user?.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full font-medium">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              )}
              {user?.governmentIdVerified && (
                <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-medium">
                  <Shield className="w-3 h-3" /> ID Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-5">Personal Information</h3>
          <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                {...regProfile('name')}
                type="text"
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {profileErrors.name && <p className="text-destructive text-xs mt-1">{profileErrors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email Address</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm bg-muted text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed. Contact support if needed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Phone Number</label>
              <input
                {...regProfile('phone')}
                type="tel"
                placeholder="+1 234 567 8900"
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {profileErrors.phone && <p className="text-destructive text-xs mt-1">{profileErrors.phone.message}</p>}
            </div>

            {(user?.role === 'authority' || user?.role === 'finder') && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Organization</label>
                <input
                  {...regProfile('organization')}
                  type="text"
                  placeholder="Your organization name"
                  className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={!profileDirty}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-5">Change Password</h3>
          <form onSubmit={handlePass(onPasswordSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <input
                {...regPass('currentPassword')}
                type="password"
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {passErrors.currentPassword && <p className="text-destructive text-xs mt-1">{passErrors.currentPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <input
                {...regPass('newPassword')}
                type="password"
                placeholder="Min 8 chars, upper, lower, number, special"
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {passErrors.newPassword && <p className="text-destructive text-xs mt-1">{passErrors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <input
                {...regPass('confirmNewPassword')}
                type="password"
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {passErrors.confirmNewPassword && <p className="text-destructive text-xs mt-1">{passErrors.confirmNewPassword.message}</p>}
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">Password requirements:</p>
              <p>• At least 8 characters</p>
              <p>• At least one uppercase and one lowercase letter</p>
              <p>• At least one number</p>
              <p>• At least one special character (@$!%*?&)</p>
            </div>

            <button
              type="submit"
              disabled={passSubmitting}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
            >
              {passSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {passSubmitting ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
