export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in-progress',
  REVIEW: 'review',
  COMPLETED: 'completed'
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'To Do',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.REVIEW]: 'Review',
  [TASK_STATUS.COMPLETED]: 'Completed'
};

export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on-hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const PROJECT_STATUS_LABELS = {
  [PROJECT_STATUS.PLANNING]: 'Planning',
  [PROJECT_STATUS.ACTIVE]: 'Active',
  [PROJECT_STATUS.ON_HOLD]: 'On Hold',
  [PROJECT_STATUS.COMPLETED]: 'Completed',
  [PROJECT_STATUS.CANCELLED]: 'Cancelled'
};

export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const PRIORITY_LABELS = {
  [PRIORITY.LOW]: 'Low',
  [PRIORITY.MEDIUM]: 'Medium',
  [PRIORITY.HIGH]: 'High',
  [PRIORITY.CRITICAL]: 'Critical'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member'
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.MEMBER]: 'Member'
};

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_COMPLETED: 'task_completed',
  TASK_OVERDUE: 'task_overdue',
  PROJECT_CREATED: 'project_created',
  PROJECT_UPDATED: 'project_updated',
  DEADLINE_REMINDER: 'deadline_reminder',
  COMMENT_ADDED: 'comment_added',
  TEAM_ADDED: 'team_added'
};

export const RESOURCE_TYPES = {
  HUMAN: 'human',
  EQUIPMENT: 'equipment',
  SOFTWARE: 'software',
  OTHER: 'other'
};

export const RESOURCE_TYPE_LABELS = {
  [RESOURCE_TYPES.HUMAN]: 'Human Resource',
  [RESOURCE_TYPES.EQUIPMENT]: 'Equipment',
  [RESOURCE_TYPES.SOFTWARE]: 'Software',
  [RESOURCE_TYPES.OTHER]: 'Other'
};

export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  SECONDARY: '#64748b',
  INFO: '#06b6d4'
};

export const STATUS_COLORS = {
  [TASK_STATUS.TODO]: 'bg-secondary-100 text-secondary-800',
  [TASK_STATUS.IN_PROGRESS]: 'bg-primary-100 text-primary-800',
  [TASK_STATUS.REVIEW]: 'bg-warning-100 text-warning-800',
  [TASK_STATUS.COMPLETED]: 'bg-success-100 text-success-800'
};

export const PRIORITY_COLORS = {
  [PRIORITY.LOW]: 'bg-secondary-100 text-secondary-800',
  [PRIORITY.MEDIUM]: 'bg-warning-100 text-warning-800',
  [PRIORITY.HIGH]: 'bg-danger-100 text-danger-800',
  [PRIORITY.CRITICAL]: 'bg-red-600 text-white'
};

export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUS.PLANNING]: 'bg-secondary-100 text-secondary-800',
  [PROJECT_STATUS.ACTIVE]: 'bg-primary-100 text-primary-800',
  [PROJECT_STATUS.ON_HOLD]: 'bg-warning-100 text-warning-800',
  [PROJECT_STATUS.COMPLETED]: 'bg-success-100 text-success-800',
  [PROJECT_STATUS.CANCELLED]: 'bg-danger-100 text-danger-800'
};
