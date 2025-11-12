import { Box, Typography, Card, CardContent, CardActionArea, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ScienceIcon from '@mui/icons-material/Science';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LinkIcon from '@mui/icons-material/Link';
import CategoryIcon from '@mui/icons-material/Category';

interface DemoCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  tags: string[];
  status: 'stable' | 'experimental' | 'wip';
}

const demos: DemoCard[] = [
  {
    title: 'Primitives Showcase',
    description: 'Interactive gallery of all 21 SDF primitives with material controls and rotation.',
    path: '/demos/primitives-showcase',
    icon: <ViewInArIcon />,
    tags: ['Phase 0.1', 'SDF', 'Materials'],
    status: 'stable'
  },
  {
    title: 'Coordinate Targeting',
    description: 'Precision targeting of primitive regions (surface, volume, edge, vertex) with smooth blending.',
    path: '/demos/coordinate-targeting',
    icon: <CategoryIcon />,
    tags: ['Phase 0.3', 'SDF', 'Targeting'],
    status: 'stable'
  },
  {
    title: 'Foreign Body Joining',
    description: 'Attach primitives to specific surface coordinates (bacteria flagella, molecular groups).',
    path: '/demos/foreign-body',
    icon: <LinkIcon />,
    tags: ['Phase 0.4', 'SDF', 'Composite'],
    status: 'stable'
  },
  {
    title: 'Lighting & PBR',
    description: 'Physically-based rendering with R3F lights, shadows, and ambient occlusion.',
    path: '/demos/lighting',
    icon: <LightbulbIcon />,
    tags: ['Phase 0.5', 'SDF', 'Lighting'],
    status: 'stable'
  },
  {
    title: 'Base SDF Proof',
    description: 'Original proof of concept for SDF raymarching with basic primitives.',
    path: '/demos/base-sdf-proof',
    icon: <ScienceIcon />,
    tags: ['Phase 0', 'Legacy'],
    status: 'stable'
  }
];

function StatusChip({ status }: { status: DemoCard['status'] }) {
  const colors = {
    stable: 'success',
    experimental: 'warning',
    wip: 'default'
  } as const;
  
  return (
    <Chip 
      label={status.toUpperCase()} 
      size="small" 
      color={colors[status]} 
      sx={{ ml: 1 }}
    />
  );
}

export default function DemosIndex() {
  const navigate = useNavigate();

  if (import.meta.env.MODE !== 'development') {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">
          Demos are only available in development mode
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1400, margin: '0 auto' }}>
      <Typography variant="h3" gutterBottom sx={{ mb: 1 }}>
        SDF Rendering Demos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Phase 0 implementation demos showcasing raymarched SDF primitives, materials, lighting, and composition.
      </Typography>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 3
        }}
      >
        {demos.map((demo) => (
          <Card 
            key={demo.path}
            elevation={2}
            sx={{ 
              height: '100%',
              transition: 'all 0.2s',
              '&:hover': {
                elevation: 6,
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardActionArea 
              onClick={() => navigate(demo.path)}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    color: 'primary.main', 
                    display: 'flex',
                    fontSize: 40
                  }}>
                    {demo.icon}
                  </Box>
                  <StatusChip status={demo.status} />
                </Box>
                
                <Typography variant="h6" gutterBottom>
                  {demo.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 48 }}>
                  {demo.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {demo.tags.map(tag => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
