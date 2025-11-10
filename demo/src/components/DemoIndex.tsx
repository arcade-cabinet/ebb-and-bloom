import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TerrainDemo } from '../demos/TerrainDemo';
import { PlaygroundDemo } from '../demos/PlaygroundDemo';
import MolecularDemo from '../demos/MolecularDemo';
import PigmentationDemo from '../demos/PigmentationDemo';
import EcosystemDemo from '../demos/EcosystemDemo';
import ToolsDemo from '../demos/ToolsDemo';
import './DemoIndex.css';

interface Demo {
  id: string;
  title: string;
  description: string;
  path: string;
  component: React.ComponentType;
  status: 'working' | 'experimental' | 'planned';
  tags: string[];
}

const demos: Demo[] = [
  {
    id: 'terrain',
    title: 'World Exploration',
    description: 'Infinite procedurally generated world. Governors power living creatures, ecosystems, and civilizations.',
    path: '/terrain',
    component: TerrainDemo,
    status: 'working',
    tags: ['exploration', 'biomes', 'creatures', 'governors']
  },
  {
    id: 'ecosystem',
    title: 'Living Ecosystem',
    description: 'Watch predator-prey dynamics, flocking, metabolism, and social hierarchies emerge in real-time.',
    path: '/ecosystem',
    component: EcosystemDemo,
    status: 'working',
    tags: ['governors', 'ecology', 'emergence', 'AI']
  },
  {
    id: 'molecular',
    title: 'Molecular Synthesis',
    description: 'See how protein, calcium, and chitin percentages create different creature forms. Chemistry drives visuals.',
    path: '/molecular',
    component: MolecularDemo,
    status: 'working',
    tags: ['synthesis', 'chemistry', 'procedural', 'molecular']
  },
  {
    id: 'pigmentation',
    title: 'Pigmentation System',
    description: 'Diet and environment determine coloring. Melanin, carotenoids, and pterins create realistic pigments.',
    path: '/pigmentation',
    component: PigmentationDemo,
    status: 'working',
    tags: ['synthesis', 'biology', 'pigments', 'camouflage']
  },
  {
    id: 'tools',
    title: 'Tools & Structures',
    description: 'Creatures synthesize tools and structures from available materials. Wood, stone, bone compositions.',
    path: '/tools',
    component: ToolsDemo,
    status: 'working',
    tags: ['synthesis', 'tools', 'structures', 'materials']
  },
  {
    id: 'playground',
    title: 'Interactive Playground',
    description: 'Experiment with governors and synthesis parameters. Real-time visualization of systems.',
    path: '/playground',
    component: PlaygroundDemo,
    status: 'experimental',
    tags: ['interactive', 'governors', 'visualization']
  }
];

const HomePage: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');

  const filteredDemos = filter === 'all' 
    ? demos 
    : demos.filter(d => d.status === filter);

  return (
    <div className="demo-index">
      <header className="hero">
        <div className="container">
          <h1 className="serif">Ebb & Bloom</h1>
          <p className="tagline">Explore procedurally generated worlds from three-word seeds</p>
          
          <div className="stats">
            <div className="stat">
              <span className="mono">17</span>
              <span>Governors</span>
            </div>
            <div className="stat">
              <span className="mono">∞</span>
              <span>Unique Worlds</span>
            </div>
            <div className="stat">
              <span className="mono">100%</span>
              <span>Deterministic</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Demos
          </button>
          <button 
            className={filter === 'working' ? 'active' : ''} 
            onClick={() => setFilter('working')}
          >
            Working
          </button>
          <button 
            className={filter === 'experimental' ? 'active' : ''} 
            onClick={() => setFilter('experimental')}
          >
            Experimental
          </button>
        </div>

        <div className="demo-grid">
          {filteredDemos.map(demo => (
            <Link key={demo.id} to={demo.path} className="demo-card">
              <div className="card-header">
                <h2>{demo.title}</h2>
                <span className={`status ${demo.status}`}>
                  {demo.status}
                </span>
              </div>
              <p className="description">{demo.description}</p>
              <div className="tags">
                {demo.tags.map(tag => (
                  <span key={tag} className="tag mono">{tag}</span>
                ))}
              </div>
              <div className="card-footer">
                <span className="link-text">Launch Demo →</span>
              </div>
            </Link>
          ))}
        </div>

        <section className="about">
          <h2 className="serif">About</h2>
          <div className="about-grid">
            <div className="about-item">
              <h3>Governor-Based</h3>
              <p>17 autonomous governors power biological, ecological, and social evolution of living worlds.</p>
            </div>
            <div className="about-item">
              <h3>Deterministic</h3>
              <p>Same seed = same world. Always. Share seeds with friends to explore identical worlds.</p>
            </div>
            <div className="about-item">
              <h3>Living Worlds</h3>
              <p>Creatures evolve, ecosystems emerge, civilizations rise. Everything alive and autonomous.</p>
            </div>
            <div className="about-item">
              <h3>Web & Mobile</h3>
              <p>Built with React Three Fiber. Runs in browser, works on mobile. No install needed.</p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <p>Built with ❤️ by the Ebb & Bloom community</p>
          <div className="footer-links">
            <a href="https://github.com/ebb-and-bloom/engine">GitHub</a>
            <a href="/docs/ENGINE.md">Documentation</a>
            <a href="/docs/API.md">API Reference</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export const DemoIndex: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {demos.map(demo => (
          <Route 
            key={demo.id} 
            path={demo.path} 
            element={<demo.component />} 
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
};

