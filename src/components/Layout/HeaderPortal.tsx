import React from 'react';
import { createPortal } from 'react-dom';
import { Header } from './Header';

interface HeaderPortalProps {
  onMenuClick: () => void;
  onQuickTransaction: () => void;
}

export const HeaderPortal: React.FC<HeaderPortalProps> = (props) => {
  if (typeof document === 'undefined') return null;
  return createPortal(<Header {...props} />, document.body);
};

export default HeaderPortal;
