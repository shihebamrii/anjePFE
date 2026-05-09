'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function PortalModal({ children, isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>,
    document.body
  );
}
