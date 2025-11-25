import React, { useState } from 'react';

interface TooltipInfoProps {
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
}

const TooltipInfo: React.FC<TooltipInfoProps> = ({ 
  content, 
  position = 'top',
  children 
}) => {
  const [visible, setVisible] = useState(false);

  const getPositionClasses = () => {
    switch(position) {
      case 'top': return 'tooltip-top';
      case 'right': return 'tooltip-right';
      case 'bottom': return 'tooltip-bottom';
      case 'left': return 'tooltip-left';
      default: return 'tooltip-top';
    }
  };

  return (
    <div className="position-relative d-inline-block">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="cursor-pointer"
      >
        {children}
      </div>
      {visible && (
        <div className={`tooltip-retro bs-tooltip-${position} ${getPositionClasses()} show position-absolute`}>
          <div className="tooltip-inner bg-dark text-light p-2 rounded">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipInfo;
