import React from 'react';

const Logo = ({ size = 'medium', showText = true, onClick, variant = 'light' }) => {
  const iconSizes = { small: 26, medium: 34, large: 46 };
  const fontSizes = { small: '1.05rem', medium: '1.28rem', large: '1.7rem' };
  const currentSize = iconSizes[size] || iconSizes.medium;
  const isDark = variant === 'dark' || variant === 'sky';
  const textColor = isDark ? '#ffffff' : '#0c0d10';
  const iconBg =
    variant === 'sky'
      ? 'linear-gradient(135deg, #ffffff 0%, #e8f4ef 100%)'
      : isDark
        ? 'linear-gradient(135deg, #1a7a62 0%, #146652 100%)'
        : 'linear-gradient(135deg, #1a7a62 0%, #0c0d10 100%)';

  return (
    <div
      className="nav-brand"
      onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: onClick ? 'pointer' : 'default' }}
    >
      <div
        style={{
          width: currentSize,
          height: currentSize,
          borderRadius: '50%',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={currentSize * 0.55}
          height={currentSize * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          stroke={variant === 'sky' ? '#1a7a62' : '#ffffff'}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.5" fill={variant === 'sky' ? '#1a7a62' : '#ffffff'} />
        </svg>
      </div>

      {showText && (
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: fontSizes[size] || fontSizes.medium,
            fontWeight: 700,
            color: textColor,
            letterSpacing: '-0.04em',
          }}
        >
          MindfulAI
        </span>
      )}
    </div>
  );
};

export default Logo;
