import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date) => {
  if (!date) return 'Unknown';
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return 'Unknown';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const timeAgo = (date) => {
  if (!date) return 'Unknown';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getStatusColor = (status) => {
  const colors = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    claimed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    under_verification: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    transferred: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    closed: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400',
    pending: 'bg-yellow-100 text-yellow-800',
    under_review: 'bg-purple-100 text-purple-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-600',
    documents_requested: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

export const getAlertColor = (level) => {
  const colors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };
  return colors[level] || colors.high;
};

export const getAlertBadgeStyle = (level) => {
  const styles = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-black',
    low: 'bg-green-500 text-white',
  };
  return styles[level] || styles.high;
};

export const formatStatusLabel = (status) => {
  const labels = {
    open: 'Open',
    claimed: 'Claimed',
    under_verification: 'Under Verification',
    resolved: 'Resolved',
    transferred: 'Transferred',
    closed: 'Closed',
    pending: 'Pending',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
    documents_requested: 'Docs Requested',
  };
  return labels[status] || status;
};

export const getGenderLabel = (gender) => {
  return { male: 'Boy', female: 'Girl', unknown: 'Unknown' }[gender] || gender;
};

export const formatAge = (age) => {
  if (age === null || age === undefined) return 'Unknown';
  return `~${age} year${age !== 1 ? 's' : ''} old`;
};

export const extractErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'An unexpected error occurred'
  );
};

export const getRoleLabel = (role) => {
  const labels = {
    finder: 'Finder',
    parent: 'Parent/Guardian',
    authority: 'Law Enforcement',
    admin: 'Administrator',
  };
  return labels[role] || role;
};

export const getRoleBadgeColor = (role) => {
  const colors = {
    finder: 'bg-blue-100 text-blue-800',
    parent: 'bg-purple-100 text-purple-800',
    authority: 'bg-green-100 text-green-800',
    admin: 'bg-red-100 text-red-800',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};
