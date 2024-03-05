import React from 'react';
import Popover from 'react-popover';

const NotificationPopover = ({ isOpen, onOuterAction, content }) => {
  return (
    <Popover
      isOpen={isOpen}
      body={content}
      preferPlace="below"
      tipSize={0.1}
      onOuterAction={onOuterAction}
      className="Popover-below"
    >
      {/* Your trigger for the popover (e.g., notification icon) */}
      <span></span>
    </Popover>
  );
};

export default NotificationPopover;
