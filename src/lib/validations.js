import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[@$!%*?&]/, 'Must contain at least one special character (@$!%*?&)'),
    confirmPassword: z.string(),
    role: z.enum(['finder', 'parent', 'authority']).default('finder'),
    phone: z
      .string()
      .regex(/^\+?[\d\s\-()]{7,15}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('')),
    organization: z.string().max(100).optional().or(z.literal('')),
    badgeNumber: z.string().max(50).optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const childReportSchema = z.object({
  child: z.object({
    estimatedAge: z
      .number({ invalid_type_error: 'Age must be a number' })
      .min(0, 'Age cannot be negative')
      .max(17, 'This platform is for children under 18'),
    gender: z.enum(['male', 'female', 'unknown'], {
      required_error: 'Please select gender',
    }),
    name: z.string().max(100).optional().default('Unknown'),
    physicalDescription: z.object({
      height: z.string().max(50).optional().or(z.literal('')),
      weight: z.string().max(50).optional().or(z.literal('')),
      eyeColor: z.string().max(50).optional().or(z.literal('')),
      hairColor: z.string().max(50).optional().or(z.literal('')),
      hairLength: z.string().max(50).optional().or(z.literal('')),
      skinTone: z.string().max(50).optional().or(z.literal('')),
      distinctiveMarks: z.string().max(500).optional().or(z.literal('')),
      clothingDescription: z.string().max(500).optional().or(z.literal('')),
    }),
    languages: z.array(z.string()).optional(),
    medicalNeeds: z.string().max(500).optional().or(z.literal('')),
  }),
  foundLocation: z.object({
    description: z.string().min(10, 'Please describe the location in detail').max(500),
    address: z.string().max(200).optional().or(z.literal('')),
    city: z.string().min(1, 'City is required').max(100),
    state: z.string().max(100).optional().or(z.literal('')),
    country: z.string().min(1, 'Country is required').max(100),
    landmark: z.string().max(200).optional().or(z.literal('')),
  }),
  foundAt: z.string().min(1, 'Date and time found is required'),
  currentCustody: z.enum(['finder', 'police', 'hospital', 'shelter', 'ngo', 'other'], {
    required_error: 'Please select current custody',
  }),
  custodyDetails: z.object({
    organization: z.string().max(100).optional().or(z.literal('')),
    contactPerson: z.string().max(100).optional().or(z.literal('')),
    contactPhone: z.string().max(20).optional().or(z.literal('')),
    address: z.string().max(200).optional().or(z.literal('')),
  }),
  alertLevel: z.enum(['low', 'medium', 'high', 'critical']).default('high'),
});

export const claimSchema = z.object({
  relationship: z.enum(
    ['father', 'mother', 'guardian', 'grandparent', 'sibling', 'other_relative', 'other'],
    { required_error: 'Please select your relationship to the child' }
  ),
  childInfo: z.object({
    name: z.string().min(1, "Child's name is required").max(100),
    dateOfBirth: z.string().optional().or(z.literal('')),
    birthmark: z.string().max(500).optional().or(z.literal('')),
    medicalHistory: z.string().max(1000).optional().or(z.literal('')),
    schoolName: z.string().max(200).optional().or(z.literal('')),
  }),
  statement: z
    .string()
    .min(50, 'Please provide a detailed statement (at least 50 characters)')
    .max(2000, 'Statement cannot exceed 2000 characters'),
  preferredContact: z.object({
    method: z.enum(['phone', 'email', 'both']).default('both'),
    availableTime: z.string().max(200).optional().or(z.literal('')),
  }),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]{7,15}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  organization: z.string().max(100).optional().or(z.literal('')),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[@$!%*?&]/),
    confirmNewPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[@$!%*?&]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
