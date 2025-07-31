import React from 'react';

const Avatar = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className = '',
  showTooltip = false 
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarClasses = `
    ${sizeClasses[size]}
    rounded-full
    flex
    items-center
    justify-center
    font-medium
    ${className}
  `.trim();

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={`${avatarClasses} object-cover`}
        title={showTooltip ? name : undefined}
      />
    );
  }

  return (
    <div
      className={`${avatarClasses} bg-primary-500 text-white`}
      title={showTooltip ? name : undefined}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
