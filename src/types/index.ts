export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

export type ClientStatus = "ACTIVE" | "INACTIVE";

export type RequestStatus =
  | "DRAFT"
  | "SENT"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "OVERDUE";

export type DocumentStatus =
  | "PENDING"
  | "UPLOADED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type ReminderChannel = "EMAIL" | "WHATSAPP" | "MANUAL";

export type ActivityAction =
  | "REQUEST_CREATED"
  | "REQUEST_SENT"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_APPROVED"
  | "DOCUMENT_REJECTED"
  | "REMINDER_SENT"
  | "REQUEST_COMPLETED"
  | "CLIENT_CREATED"
  | "TEMPLATE_CREATED"
  | "REQUEST_CANCELLED";

export type PlanType = "FREE" | "STARTER" | "PROFESSIONAL";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  workspaceId: string;
  role: UserRole;
  avatar?: string | null;
}

export interface PlanLimits {
  activeRequests: number;
  documentsPerMonth: number;
  whatsappReminders: boolean;
  emailReminders: boolean;
  removeBranding: boolean;
  templates: boolean;
  customBranding: boolean;
  teamMembers: boolean;
  advancedActivity: boolean;
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    activeRequests: 3,
    documentsPerMonth: 20,
    whatsappReminders: false,
    emailReminders: true,
    removeBranding: false,
    templates: false,
    customBranding: false,
    teamMembers: false,
    advancedActivity: false,
  },
  STARTER: {
    activeRequests: 50,
    documentsPerMonth: 500,
    whatsappReminders: true,
    emailReminders: true,
    removeBranding: true,
    templates: true,
    customBranding: false,
    teamMembers: false,
    advancedActivity: false,
  },
  PROFESSIONAL: {
    activeRequests: Infinity,
    documentsPerMonth: Infinity,
    whatsappReminders: true,
    emailReminders: true,
    removeBranding: true,
    templates: true,
    customBranding: true,
    teamMembers: true,
    advancedActivity: true,
  },
};

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
