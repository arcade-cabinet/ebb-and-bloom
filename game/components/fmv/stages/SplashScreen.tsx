import { useMemo } from 'react';
import { useGameState } from '../../../state/GameState';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 5000 }: SplashScreenProps) {
  const getMetallicity = useGameState((state) => state.getMetallicity);
  const getPlanetMass = useGameState((state) => state.getPlanetMass);
  const getPlanetRadius = useGameState((state) => state.getPlanetRadius);
  const getOrbitalRadius = useGameState((state) => state.getOrbitalRadius);
  const getSurfaceTemperature = useGameState((state) => state.getSurfaceTemperature);
  const getAtmosphericPressure = useGameState((state) => state.getAtmosphericPressure);

  const data = useMemo(() => ({
    metallicity: getMetallicity(),
    planetMass: getPlanetMass(),
    planetRadius: getPlanetRadius(),
    orbitalRadius: getOrbitalRadius(),
    surfaceTemperature: getSurfaceTemperature(),
    atmosphericPressure: getAtmosphericPressure(),
  }), [getMetallicity, getPlanetMass, getPlanetRadius, getOrbitalRadius, getSurfaceTemperature, getAtmosphericPressure]);

  useMemo(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  const massInEarths = (data.planetMass / 5.972e24).toFixed(2);
  const radiusInEarths = (data.planetRadius / 6371000).toFixed(2);
  const orbitalAU = (data.orbitalRadius / 1.496e11).toFixed(3);

  return (
    <div style={{
      position: 'absolute',
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
      zIndex: 1000,
    }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: '2rem',
        textAlign: 'center',
        textShadow: '0 0 20px rgba(100, 200, 255, 0.8)',
      }}>
        COSMIC GENESIS
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        maxWidth: '800px',
        padding: '2rem',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '10px',
        border: '1px solid rgba(100, 200, 255, 0.3)',
      }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>METALLICITY</div>
          <div style={{ fontSize: '1.5rem', color: '#64c8ff' }}>{(data.metallicity * 100).toFixed(2)}%</div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>ORBITAL DISTANCE</div>
          <div style={{ fontSize: '1.5rem', color: '#ffa864' }}>{orbitalAU} AU</div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>PLANET MASS</div>
          <div style={{ fontSize: '1.5rem', color: '#64ffa8' }}>{massInEarths} M⊕</div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>PLANET RADIUS</div>
          <div style={{ fontSize: '1.5rem', color: '#a864ff' }}>{radiusInEarths} R⊕</div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>SURFACE TEMP</div>
          <div style={{ fontSize: '1.5rem', color: '#ff6464' }}>{data.surfaceTemperature.toFixed(1)} K</div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>ATMOSPHERE</div>
          <div style={{ fontSize: '1.5rem', color: '#64ff64' }}>{(data.atmosphericPressure / 101325).toFixed(2)} atm</div>
        </div>
      </div>
      
      <p style={{ 
        marginTop: '2rem', 
        fontSize: '1.2rem',
        fontStyle: 'italic',
        color: '#aaa',
        textAlign: 'center',
      }}>
        Your world awaits...
      </p>
    </div>
  );
}
