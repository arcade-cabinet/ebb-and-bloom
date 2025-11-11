import { Box, CircularProgress, Typography } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';

interface LoadingOverlayProps {
  message: string;
  show: boolean;
}

export function LoadingOverlay({ message, show }: LoadingOverlayProps) {
  const fadeStyle = useSpring({
    opacity: show ? 1 : 0,
    config: { duration: 300 },
  });

  if (!show) return null;

  return (
    <animated.div style={fadeStyle}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(8px)',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'white',
            textAlign: 'center',
            fontFamily: '"Playfair Display", serif',
          }}
        >
          {message}
        </Typography>
      </Box>
    </animated.div>
  );
}
