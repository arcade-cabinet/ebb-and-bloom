import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardActions, Container, TextField, Typography, IconButton, Stack } from '@mui/material';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const demos: any[] = [];

function generateSeed(): string {
  const adjectives = ['smooth', 'rough', 'bright', 'dark', 'swift', 'slow', 'warm', 'cold'];
  const nouns = ['stone', 'wave', 'cloud', 'fire', 'wind', 'rain', 'snow', 'mist'];
  const verbs = ['weave', 'flow', 'burn', 'shift', 'drift', 'rise', 'fall', 'glow'];
  
  const randomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
  return `${randomItem(adjectives)}-${randomItem(nouns)}-${randomItem(verbs)}`;
}

export default function DemoIndex() {
  const navigate = useNavigate();
  const [seed, setSeed] = useState(() => generateSeed());

  const handleShuffle = () => {
    setSeed(generateSeed());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(seed);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#7fb069', textAlign: 'center', mb: 1 }}>
        Ebb & Bloom Demos
      </Typography>
      <Typography variant="body1" sx={{ color: '#b0b0b0', textAlign: 'center', mb: 4 }}>
        Progressive demonstrations of law-based synthesis and evolution
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Deterministic Seed"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          helperText="Same seed = same universe across all demos"
          variant="outlined"
        />
        <IconButton onClick={handleShuffle} color="primary">
          <ShuffleIcon />
        </IconButton>
        <IconButton onClick={handleCopy} color="primary">
          <ContentCopyIcon />
        </IconButton>
      </Stack>

      {demos.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" sx={{ color: '#7fb069', mb: 2 }}>
            Demos Coming Soon
          </Typography>
          <Typography variant="body1" sx={{ color: '#b0b0b0' }}>
            Building production-quality tiered demo system to test the comprehensive ECS architecture.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {demos.map((demo: any) => (
            <Box key={demo.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#2a2a2a' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ color: '#7fb069' }}>
                    Demo {demo.id}: {demo.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#d0d0d0' }}>
                    {demo.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth
                    variant="contained" 
                    onClick={() => navigate(`/demos/${demo.id}?seed=${encodeURIComponent(seed)}`)}
                    sx={{ bgcolor: '#7fb069', minHeight: '44px', '&:active': { bgcolor: '#6a9557' } }}
                  >
                    Launch Demo
                  </Button>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/game')}
          sx={{ color: '#7fb069', borderColor: '#7fb069' }}
        >
          Go to Full Game (Experimental)
        </Button>
      </Box>
    </Container>
  );
}
