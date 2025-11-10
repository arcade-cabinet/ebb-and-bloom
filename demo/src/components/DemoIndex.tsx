import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TerrainDemo } from '../demos/TerrainDemo';
import { UniverseDemo } from '../demos/UniverseDemo';
import { PlaygroundDemo } from '../demos/PlaygroundDemo';
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
    title: 'Procedural Terrain',
    description: 'Daggerfall-style infinite world with SimplexNoise, 11 biomes, vegetation, and settlements. Working game at 120 FPS.',
    path: '/terrain',
    component: TerrainDemo,
    status: 'working',
    tags: ['terrain', 'biomes', 'vegetation', 'NPCs', 'creatures', 'Yuka AI']
  },
  {
    id: 'universe',
    title: 'Universe Simulation',
    description: 'Full timeline from Big Bang to Heat Death. 57 scientific laws generating stars, planets, and civilizations.',
    path: '/universe',
    component: UniverseDemo,
    status: 'working',
    tags: ['cosmology', 'physics', 'stellar', 'timeline']
  },
  {
    id: 'playground',
    title: 'Law Playground',
    description: 'Interactive visualization of individual laws. Experiment with physics, biology, ecology, and social laws.',
    path: '/playground',
    component: PlaygroundDemo,
    status: 'experimental',
    tags: ['laws', 'interactive', 'visualization']
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
          <h1 className="serif">Ebb & Bloom Engine</h1>
          <p className="tagline">Law-based universe simulation with deterministic procedural generation</p>
          
          <div className="stats">
            <div className="stat">
              <span className="mono">57</span>
              <span>Scientific Laws</span>
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
          <h2 className="serif">About the Engine</h2>
          <div className="about-grid">
            <div className="about-item">
              <h3>Law-Based Generation</h3>
              <p>57 mathematical laws from physics, biology, ecology, and social sciences generate infinite unique universes.</p>
            </div>
            <div className="about-item">
              <h3>Deterministic</h3>
              <p>Same seed = same universe. Always. Perfect for multiplayer, speedruns, and reproducible research.</p>
            </div>
            <div className="about-item">
              <h3>Multi-Scale</h3>
              <p>Simulates from quantum (Planck scale) to cosmic (universe-wide) with seamless transitions.</p>
            </div>
            <div className="about-item">
              <h3>React Three Fiber</h3>
              <p>Modern web rendering with R3F + Drei. Runs in browser, works on mobile.</p>
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

