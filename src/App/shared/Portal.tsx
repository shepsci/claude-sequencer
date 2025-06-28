import React from 'react';
import ReactDOM from 'react-dom';
import type { PortalProps } from 'types/components';

export const Portal: React.FC<PortalProps> = ({ targetId, children }) => {
  const portal = document.getElementById(targetId);
  if (!portal) return null;
  return ReactDOM.createPortal(children, portal);
};
