import React from 'react';

const Logo = ({ size = 'medium', showText = true, onClick }) => {
  const iconSizes = {
    small: 26,
    medium: 34,
    large: 46
  };

  const fontSizes = {
    small: '1.1rem',
    medium: '1.35rem',
    large: '1.8rem'
  };

  const currentSize = iconSizes[size] || iconSizes.medium;

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
          background: 'linear-gradient(135deg, #7dd3fc 0%, #38bdf8 50%, #60a5fa 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(125, 211, 252, 0.35)',
          flexShrink: 0
        }}
      >
        <svg
          width={currentSize * 0.6}
          height={currentSize * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0b1329"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
          <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4z" />
          <circle cx="12" cy="12" r="2" fill="#0b1329" />
        </svg>
      </div>

      {showText && (
        <span
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: fontSizes[size] || fontSizes.medium,
            fontWeight: 600,
            color: '#f8fafc',
            letterSpacing: '-0.3px'
          }}
        >
          MindfulAI
        </span>
      )}
    </div>
  );
};

export default Logo;
