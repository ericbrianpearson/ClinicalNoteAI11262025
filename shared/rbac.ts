import { z } from 'zod';

export const USER_ROLES = {
  ADMIN: 'admin',
  PRACTITIONER: 'practitioner', 
  BILLING: 'billing'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const PERMISSIONS = {
  // Patient Management
  CREATE_PATIENT: 'create_patient',
  READ_PATIENT: 'read_patient',
  UPDATE_PATIENT: 'update_patient',
  DELETE_PATIENT: 'delete_patient',
  
  // Encounter Management
  CREATE_ENCOUNTER: 'create_encounter',
  READ_ENCOUNTER: 'read_encounter',
  UPDATE_ENCOUNTER: 'update_encounter',
  DELETE_ENCOUNTER: 'delete_encounter',
  
  // Clinical Documentation
  CREATE_CLINICAL_NOTE: 'create_clinical_note',
  READ_CLINICAL_NOTE: 'read_clinical_note',
  UPDATE_CLINICAL_NOTE: 'update_clinical_note',
  DELETE_CLINICAL_NOTE: 'delete_clinical_note',
  
  // Medical Coding
  READ_CODING: 'read_coding',
  UPDATE_CODING: 'update_coding',
  GENERATE_CODING: 'generate_coding',
  
  // Billing
  READ_BILLING: 'read_billing',
  CREATE_BILLING: 'create_billing',
  UPDATE_BILLING: 'update_billing',
  PROCESS_BILLING: 'process_billing',
  
  // System Administration
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  SYSTEM_SETTINGS: 'system_settings',
  
  // AI Features
  USE_AI_TRANSCRIPTION: 'use_ai_transcription',
  USE_AI_CODING: 'use_ai_coding',
  USE_AI_INSIGHTS: 'use_ai_insights',
  
  // Reporting
  GENERATE_REPORTS: 'generate_reports',
  EXPORT_DATA: 'export_data'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role-Permission Matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [USER_ROLES.ADMIN]: [
    // Full system access
    PERMISSIONS.CREATE_PATIENT,
    PERMISSIONS.READ_PATIENT,
    PERMISSIONS.UPDATE_PATIENT,
    PERMISSIONS.DELETE_PATIENT,
    PERMISSIONS.CREATE_ENCOUNTER,
    PERMISSIONS.READ_ENCOUNTER,
    PERMISSIONS.UPDATE_ENCOUNTER,
    PERMISSIONS.DELETE_ENCOUNTER,
    PERMISSIONS.CREATE_CLINICAL_NOTE,
    PERMISSIONS.READ_CLINICAL_NOTE,
    PERMISSIONS.UPDATE_CLINICAL_NOTE,
    PERMISSIONS.DELETE_CLINICAL_NOTE,
    PERMISSIONS.READ_CODING,
    PERMISSIONS.UPDATE_CODING,
    PERMISSIONS.GENERATE_CODING,
    PERMISSIONS.READ_BILLING,
    PERMISSIONS.CREATE_BILLING,
    PERMISSIONS.UPDATE_BILLING,
    PERMISSIONS.PROCESS_BILLING,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_AUDIT_LOGS,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.USE_AI_TRANSCRIPTION,
    PERMISSIONS.USE_AI_CODING,
    PERMISSIONS.USE_AI_INSIGHTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  [USER_ROLES.PRACTITIONER]: [
    // Clinical focus
    PERMISSIONS.CREATE_PATIENT,
    PERMISSIONS.READ_PATIENT,
    PERMISSIONS.UPDATE_PATIENT,
    PERMISSIONS.CREATE_ENCOUNTER,
    PERMISSIONS.READ_ENCOUNTER,
    PERMISSIONS.UPDATE_ENCOUNTER,
    PERMISSIONS.CREATE_CLINICAL_NOTE,
    PERMISSIONS.READ_CLINICAL_NOTE,
    PERMISSIONS.UPDATE_CLINICAL_NOTE,
    PERMISSIONS.READ_CODING,
    PERMISSIONS.UPDATE_CODING,
    PERMISSIONS.GENERATE_CODING,
    PERMISSIONS.READ_BILLING, // Read-only billing access
    PERMISSIONS.USE_AI_TRANSCRIPTION,
    PERMISSIONS.USE_AI_CODING,
    PERMISSIONS.USE_AI_INSIGHTS,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ],
  
  [USER_ROLES.BILLING]: [
    // Billing and coding focus
    PERMISSIONS.READ_PATIENT, // Limited patient access
    PERMISSIONS.READ_ENCOUNTER,
    PERMISSIONS.READ_CLINICAL_NOTE,
    PERMISSIONS.READ_CODING,
    PERMISSIONS.UPDATE_CODING,
    PERMISSIONS.READ_BILLING,
    PERMISSIONS.CREATE_BILLING,
    PERMISSIONS.UPDATE_BILLING,
    PERMISSIONS.PROCESS_BILLING,
    PERMISSIONS.USE_AI_CODING,
    PERMISSIONS.GENERATE_REPORTS,
    PERMISSIONS.EXPORT_DATA
  ]
};

// Helper functions
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function getRolePermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole] ?? [];
}

export function canAccessResource(userRole: UserRole, resourceType: string): boolean {
  const resourcePermissions: Record<string, Permission[]> = {
    'patients': [PERMISSIONS.READ_PATIENT],
    'encounters': [PERMISSIONS.READ_ENCOUNTER],
    'clinical-notes': [PERMISSIONS.READ_CLINICAL_NOTE],
    'billing': [PERMISSIONS.READ_BILLING],
    'admin': [PERMISSIONS.MANAGE_USERS, PERMISSIONS.VIEW_AUDIT_LOGS],
    'ai-features': [PERMISSIONS.USE_AI_TRANSCRIPTION, PERMISSIONS.USE_AI_CODING]
  };

  const requiredPermissions = resourcePermissions[resourceType];
  if (!requiredPermissions) return false;

  return hasAnyPermission(userRole, requiredPermissions);
}

// Validation schemas
export const userRoleSchema = z.enum([USER_ROLES.ADMIN, USER_ROLES.PRACTITIONER, USER_ROLES.BILLING]);

export const rbacUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: userRoleSchema,
  permissions: z.array(z.string()),
  isActive: z.boolean(),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type RBACUser = z.infer<typeof rbacUserSchema>;

// HIPAA Compliance: Audit trail for permission checks
export interface PermissionAudit {
  userId: number;
  userRole: UserRole;
  permission: Permission;
  resource: string;
  action: string;
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}