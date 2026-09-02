import type { ReactNode } from 'react';

export function Modal({ onClose, children, wide }: { onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <>
      <div className="overlay-bg" onClick={onClose} />
      <div className="modal-center">
        <div className={`modal${wide ? ' wide' : ''}`} onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </>
  );
}
