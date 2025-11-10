/**
 * MOBILE GUI HELPER
 *
 * Babylon GUI has issues on some mobile browsers.
 * This provides fallback HTML buttons that ALWAYS work.
 */

export interface MobileButton {
  id: string;
  label: string;
  color: string;
  onClick: () => void;
}

export class MobileGUI {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'mobile-controls';
    this.container.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      gap: 10px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.7);
      border-radius: 12px;
      flex-wrap: wrap;
      max-width: 90vw;
      justify-content: center;
    `;

    document.body.appendChild(this.container);
  }

  /**
   * Add button (HTML-based, always works on mobile)
   */
  addButton(config: MobileButton): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.id = config.id;
    btn.textContent = config.label;
    btn.style.cssText = `
      padding: 12px 20px;
      font-size: 16px;
      font-family: monospace;
      font-weight: bold;
      color: white;
      background: ${config.color};
      border: none;
      border-radius: 8px;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      min-width: 80px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    `;

    // Touch feedback
    btn.addEventListener('touchstart', () => {
      btn.style.transform = 'scale(0.95)';
      btn.style.opacity = '0.8';
    });

    btn.addEventListener('touchend', () => {
      btn.style.transform = 'scale(1)';
      btn.style.opacity = '1';
    });

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      config.onClick();

      // Visual feedback
      btn.style.transform = 'scale(1.05)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 100);
    });

    this.container.appendChild(btn);
    return btn;
  }

  /**
   * Add info panel (HTML-based)
   */
  addInfoPanel(position: 'top-right' | 'bottom-left' = 'top-right'): HTMLDivElement {
    const panel = document.createElement('div');
    panel.id = 'mobile-info';

    const positions = {
      'top-right': 'top: 20px; right: 20px;',
      'bottom-left': 'bottom: 120px; left: 20px;',
    };

    panel.style.cssText = `
      position: fixed;
      ${positions[position]}
      z-index: 9998;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff88;
      font-family: monospace;
      font-size: 14px;
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #00ff88;
      max-width: 300px;
      max-height: 50vh;
      overflow-y: auto;
    `;

    document.body.appendChild(panel);
    return panel;
  }

  /**
   * Check if mobile device
   */
  static isMobile(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 800
    );
  }

  /**
   * Remove all mobile GUI
   */
  dispose() {
    this.container.remove();
    const info = document.getElementById('mobile-info');
    if (info) info.remove();
  }
}

