import { ReactNode, useEffect, useState } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface TransitionWrapperProps {
  children: ReactNode;
  fadeIn?: boolean;
  duration?: number;
  delay?: number;
}

export function TransitionWrapper({ 
  children, 
  fadeIn = true, 
  duration = 500,
  delay = 0,
}: TransitionWrapperProps) {
  const [shouldShow, setShouldShow] = useState(!fadeIn);

  useEffect(() => {
    if (fadeIn) {
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [fadeIn, delay]);

  const fadeStyle = useSpring({
    opacity: shouldShow ? 1 : 0,
    transform: shouldShow ? 'translateY(0px)' : 'translateY(10px)',
    config: { duration },
  });

  return (
    <animated.div style={{ ...fadeStyle, width: '100%', height: '100%' }}>
      {children}
    </animated.div>
  );
}
