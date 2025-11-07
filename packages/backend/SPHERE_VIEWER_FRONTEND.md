# THE ACTUAL FRONTEND: SPHERE VIEWER

## The Realization

**CLI is HARDER than a simple 3D viewer.**

**CLI requires:**
- Text rendering of spatial data (complex)
- ASCII art (limiting)
- Non-intuitive for spherical coordinates
- Complex state management for "views"

**Simple 3D Sphere Viewer requires:**
- Three.js sphere (10 lines)
- Touch controls (built-in)
- Lat/lon grid overlay (shader)
- API calls on tap (trivial)
- Polling for active points (trivial)

**THE SPHERE VIEWER IS EASIER AND BETTER.**

---

## What It Is

**A rotating sphere with glowing points.**

That's it.

### Components

1. **Sphere**
   - Textured with procedural surface (from planet seed)
   - AmbientCG material or procedural noise
   - Rotates based on planet's rotation period
   - Starfield background

2. **Lat/Lon Grid Overlay**
   - Thin white lines
   - 10° increments
   - Slightly above surface
   - Helps orient user

3. **Touch Controls**
   - Drag → Rotate sphere
   - Pinch → Zoom in/out
   - Double-tap → Query point

4. **Activity Glow**
   - White point lights at active coordinates
   - Size = activity level
   - Tiny spec = single creature
   - Large glow = tribe
   - Massive glow = civilization

5. **Query Modal**
   - Double-tap coordinate
   - Fetch `/api/game/:id/coordinate/:lat/:lon`
   - Show:
     - Materials at this point
     - Creatures here
     - Buildings here
     - Activity summary

---

## Tech Stack

### Frontend
- React + Vite (already have)
- React Three Fiber (R3F) for Three.js
- Zustand for UI state:
  - Camera position
  - Zoom level
  - Rotation
  - Selected coordinate
  - Active points from polling

### Backend (what we're building)
- REST API endpoints:
  - `GET /api/game/:id/state` - Full state
  - `GET /api/game/:id/coordinate/:lat/:lon` - Query specific point
  - `GET /api/game/:id/active-points` - List of coordinates with activity
  - `POST /api/game/:id/advance` - Progress simulation

---

## Implementation

### 1. Simple Sphere (React Three Fiber)

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';

function PlanetSphere({ radius, textureUrl }) {
  return (
    <Canvas>
      {/* Starfield background */}
      <Stars radius={300} depth={50} count={5000} />
      
      {/* Planet */}
      <Sphere args={[radius, 64, 64]}>
        <meshStandardMaterial map={useTexture(textureUrl)} />
      </Sphere>
      
      {/* Lat/lon grid */}
      <LatLonGrid radius={radius * 1.01} />
      
      {/* Activity glows */}
      <ActivityPoints points={activePoints} radius={radius * 1.02} />
      
      {/* Touch controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
      />
    </Canvas>
  );
}
```

### 2. Lat/Lon Grid

```tsx
function LatLonGrid({ radius }) {
  const lines = useMemo(() => {
    const geometry = new BufferGeometry();
    const points = [];
    
    // Latitude lines (every 10°)
    for (let lat = -80; lat <= 80; lat += 10) {
      for (let lon = 0; lon < 360; lon += 1) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = lon * Math.PI / 180;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        points.push(x, y, z);
      }
    }
    
    // Longitude lines (every 10°)
    for (let lon = 0; lon < 360; lon += 10) {
      for (let lat = -90; lat <= 90; lat += 1) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = lon * Math.PI / 180;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        points.push(x, y, z);
      }
    }
    
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    return geometry;
  }, [radius]);
  
  return (
    <lineSegments geometry={lines}>
      <lineBasicMaterial color="white" opacity={0.2} transparent />
    </lineSegments>
  );
}
```

### 3. Activity Points (Glowing)

```tsx
function ActivityPoints({ points, radius }) {
  return (
    <>
      {points.map(point => {
        const { lat, lon, intensity } = point;
        
        // Convert lat/lon to 3D position
        const phi = (90 - lat) * Math.PI / 180;
        const theta = lon * Math.PI / 180;
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        
        return (
          <pointLight
            key={`${lat}-${lon}`}
            position={[x, y, z]}
            intensity={intensity}
            color="white"
            distance={intensity * 10}
          />
        );
      })}
    </>
  );
}
```

### 4. Double-Tap to Query

```tsx
function PlanetSphere({ gameId }) {
  const [selectedCoord, setSelectedCoord] = useState(null);
  
  const handlePointerDown = (event) => {
    const intersection = event.intersections[0];
    if (!intersection) return;
    
    // Convert 3D point to lat/lon
    const { x, y, z } = intersection.point;
    const lat = 90 - Math.acos(y / radius) * 180 / Math.PI;
    const lon = Math.atan2(z, x) * 180 / Math.PI;
    
    // Double tap?
    if (event.detail === 2) {
      queryCoordinate(gameId, lat, lon);
    }
  };
  
  return (
    <Sphere args={[radius, 64, 64]} onPointerDown={handlePointerDown}>
      <meshStandardMaterial map={texture} />
    </Sphere>
  );
}

async function queryCoordinate(gameId: string, lat: number, lon: number) {
  const response = await fetch(`/api/game/${gameId}/coordinate/${lat}/${lon}`);
  const data = await response.json();
  
  // Show modal with data
  showModal({
    coordinate: { lat, lon },
    materials: data.materials,
    creatures: data.creatures,
    buildings: data.buildings,
    activity: data.activity,
  });
}
```

### 5. Polling for Active Points

```tsx
function useActivePoints(gameId: string) {
  const [points, setPoints] = useState([]);
  
  useEffect(() => {
    const poll = async () => {
      const response = await fetch(`/api/game/${gameId}/active-points`);
      const data = await response.json();
      
      setPoints(data.points.map(p => ({
        lat: p.lat,
        lon: p.lon,
        intensity: p.activityLevel, // 0-1, creatures → tribes → gov
      })));
    };
    
    // Poll every 2 seconds
    const interval = setInterval(poll, 2000);
    poll(); // Initial
    
    return () => clearInterval(interval);
  }, [gameId]);
  
  return points;
}
```

### 6. Zustand State

```tsx
interface SphereViewState {
  cameraPosition: [number, number, number];
  zoomLevel: number;
  rotation: [number, number, number];
  selectedCoordinate: { lat: number; lon: number } | null;
  activePoints: Array<{ lat: number; lon: number; intensity: number }>;
  
  setCameraPosition: (pos: [number, number, number]) => void;
  setZoomLevel: (zoom: number) => void;
  setRotation: (rot: [number, number, number]) => void;
  setSelectedCoordinate: (coord: { lat: number; lon: number } | null) => void;
  setActivePoints: (points: Array<{ lat: number; lon: number; intensity: number }>) => void;
}

const useSphereViewStore = create<SphereViewState>((set) => ({
  cameraPosition: [0, 0, 10],
  zoomLevel: 1,
  rotation: [0, 0, 0],
  selectedCoordinate: null,
  activePoints: [],
  
  setCameraPosition: (pos) => set({ cameraPosition: pos }),
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  setRotation: (rot) => set({ rotation: rot }),
  setSelectedCoordinate: (coord) => set({ selectedCoordinate: coord }),
  setActivePoints: (points) => set({ activePoints: points }),
}));
```

---

## Backend REST API

### Required Endpoints

```typescript
// Get full game state
GET /api/game/:id/state
Response: GameState

// Query specific coordinate
GET /api/game/:id/coordinate/:lat/:lon
Response: {
  coordinate: { lat, lon },
  materials: Material[],
  creatures: Creature[],
  buildings: Building[],
  tribes: Tribe[],
  activity: {
    level: number, // 0-1
    type: 'creature' | 'pack' | 'tribe' | 'civilization'
  }
}

// Get all active points (for glow rendering)
GET /api/game/:id/active-points
Response: {
  points: Array<{
    lat: number,
    lon: number,
    activityLevel: number, // 0-1
    activityType: string
  }>
}

// Advance simulation
POST /api/game/:id/advance
Body: { cycles: number }
Response: { newCycle: number, events: Event[] }

// Get planet texture (procedural)
GET /api/game/:id/planet/texture
Response: PNG image (generated from seed)
```

---

## The Progression

### Gen 1: Individual Creatures
- Sphere with a few tiny white specs
- Specs move slightly (creatures wandering)
- Double-tap → "1 Cursorial Forager at this location"

### Gen 2: Packs
- Specs cluster together
- 5-10 specs close to each other
- Slightly brighter than individuals
- Double-tap → "Pack of 7 creatures"

### Gen 3: Tools
- No visual change (tools don't glow)
- But creatures can now access deeper materials
- Double-tap → "5 creatures with tools"

### Gen 4: Tribes
- Clusters of 50-100 specs
- Form visible "blobs" of light
- Multiple blobs across the sphere
- Double-tap → "Tribe of 73 members, 12 buildings"

### Gen 5: Buildings
- Blobs get brighter (settlements)
- Permanent structures glow
- Double-tap → "Settlement with 5 shelters, 2 workshops"

### Gen 6: Civilization
- Massive glowing regions
- Connected by faint lines (trade/alliance)
- Entire continents lit up
- Double-tap → "Civilization of 500 members, 3 religions, 1 government"

**Visual progression: From a dark sphere with specs → to a glowing planet of light.**

---

## Why This Works

### 1. Content Addressable
Every point has lat/lon → API call → data

### 2. Scales Naturally
Gen 1: Few specs
Gen 6: Entire planet glowing

### 3. Intuitive
Rotate sphere, tap point, see what's there

### 4. Forces Good API Design
If I can't query a point, API is wrong

### 5. Mobile-First
Touch controls are natural (drag, pinch, tap)

### 6. Visually Striking
Dark sphere → glowing civilization = powerful feedback

### 7. Simulation Agnostic
Don't need to understand mechanics to appreciate it

---

## Implementation Order

1. ✅ **Backend REST API** (what we're building now)
   - Planet generation (Gen 0)
   - Creature spawning (Gen 1)
   - Query endpoints
   - Active points endpoint

2. ✅ **Simple Sphere Viewer**
   - React Three Fiber setup
   - Textured sphere
   - Orbit controls
   - Starfield background

3. ✅ **Lat/Lon Grid Overlay**
   - Grid rendering
   - Coordinate conversion

4. ✅ **Double-Tap Query**
   - Raycast to sphere
   - Convert to lat/lon
   - API call
   - Modal display

5. ✅ **Activity Polling**
   - Poll backend every 2s
   - Update glow points
   - Render point lights

6. ✅ **Progression to Gen 6**
   - Implement each generation
   - Test that glows scale properly
   - Verify entire flow works

---

## Summary

**Scrap the CLI.**

**Build a simple 3D sphere viewer instead:**
- Rotating planet
- Lat/lon grid
- Touch controls (drag, pinch, double-tap)
- Glowing points for activity
- API calls for coordinate queries
- Polling for active points

**This is EASIER than a CLI.**

**This is MORE INTUITIVE.**

**This is EXACTLY what we need to visualize the simulation.**

**This is NOT the game yet - it's the simulation viewer.**

**But it's the perfect foundation.**

**And it forces us to design good REST APIs.**

**LET'S BUILD THIS.**
