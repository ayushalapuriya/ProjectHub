import React from 'react';
import { 
  TASK_STATUS, 
  PROJECT_STATUS, 
  PRIORITY,
  STATUS_COLORS,
  PRIORITY_COLORS,
  PROJECT_STATUS_COLORS 
} from '../../utils/constants';

const Badge = ({ 
  children, 
  variant = 'secondary', 
  size = 'md',
  status = null,
  priority = null,
  projectStatus = null,
  className = '' 
}) => {
  const baseClasses = 'badge';
  
  const variantClasses = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  let colorClasses = variantClasses[variant];

  // Override with specific status colors
  if (status && STATUS_COLORS[status]) {
    colorClasses = STATUS_COLORS[status];
  } else if (priority && PRIORITY_COLORS[priority]) {
    colorClasses = PRIORITY_COLORS[priority];
  } else if (projectStatus && PROJECT_STATUS_COLORS[projectStatus]) {
    colorClasses = PROJECT_STATUS_COLORS[projectStatus];
  }

  const classes = `
    ${baseClasses}
    ${colorClasses}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;
