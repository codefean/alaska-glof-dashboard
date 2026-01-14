import React from 'react';
import './Reset.css';

const ResetButton = ({
  onReset,
  isMobile,
  pitchBottom,
}) => {
  return (
    <button
      onClick={onReset}
      aria-label="Reset view (R)"
      title="Reset view (R)"
      className="reset-button"
      style={{
        position: 'absolute',
        bottom: isMobile ? `${pitchBottom / .55}px` : '126px',
        left: isMobile ? 'auto' : '12px',
        right: isMobile ? '12px' : 'auto',
        minWidth: isMobile ? 'auto' : '187px',
      }}
    >
      {isMobile ? 'R' : 'Reset view'}
    </button>
  );
};

export default ResetButton;
