import { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  text?: string;
}

export function LoadingOverlay({ text = 'Initializing cosmic genesis...' }: LoadingOverlayProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 100%)',
        color: '#ffffff',
        fontFamily: 'monospace',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(100, 200, 255, 0.2)',
          borderTop: '4px solid #64c8ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem',
        }}
      />
      
      <p
        style={{
          fontSize: '1.2rem',
          textAlign: 'center',
          color: '#64c8ff',
          textShadow: '0 0 10px rgba(100, 200, 255, 0.5)',
          minWidth: '250px',
        }}
      >
        {text}{dots}
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
