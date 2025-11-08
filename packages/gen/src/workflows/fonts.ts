/**
 * Fonts Workflow - Downloads and sets up Google Fonts for Ebb & Bloom
 * Downloads fonts directly from Google Fonts API
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Simple console logging
const log = {
  info: (...args: any[]) => console.log('[FONTS]', ...args),
  error: (...args: any[]) => console.error('[FONTS ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[FONTS WARN]', ...args),
};

interface FontManifest {
  version: string;
  description: string;
  fonts: Array<{
    id: string;
    family: string;
    category: string;
    usage: string;
    weights: number[];
    styles: string[];
    subsets: string[];
    url: string;
    description: string;
  }>;
  outputFormats: string[];
  cssOutputPath: string;
  fontsOutputPath: string;
}

/**
 * Generate fonts for the Ebb & Bloom frontend
 */
export async function generateFonts(): Promise<void> {
  log.info('Starting fonts generation...');

  try {
    // Load fonts manifest
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const manifestPath = join(__dirname, '../../data/manifests/fonts.json');
    const manifestContent = await readFile(manifestPath, 'utf-8');
    const manifest: FontManifest = JSON.parse(manifestContent);

    log.info('Loaded fonts manifest', {
      version: manifest.version,
      fonts: manifest.fonts.length,
      outputPath: manifest.fontsOutputPath
    });

    // Resolve paths relative to monorepo root
    // __dirname is packages/gen/src/workflows, so go up 3 levels to monorepo root
    const monorepoRoot = join(__dirname, '../../../..');
    const cssOutputPath = join(monorepoRoot, manifest.cssOutputPath);
    const fontsOutputPath = join(monorepoRoot, manifest.fontsOutputPath);
    
    // Ensure output directory exists
    if (!existsSync(fontsOutputPath)) {
      mkdirSync(fontsOutputPath, { recursive: true });
      log.info('Created fonts output directory', { path: fontsOutputPath });
    }

    // Generate CSS file with Google Fonts CDN links
    // For now, use CDN - can optimize to self-host later
    await generateFontCSS(manifest, cssOutputPath);

    log.info('Fonts generation complete');

  } catch (error) {
    log.error('Failed to generate fonts', error);
    throw error;
  }
}

/**
 * Generate CSS file for font loading
 */
async function generateFontCSS(manifest: FontManifest, cssOutputPath: string): Promise<void> {
  log.info('Generating font CSS file', { path: cssOutputPath });

  // Ensure CSS output directory exists
  const cssDir = dirname(cssOutputPath);
  if (!existsSync(cssDir)) {
    mkdirSync(cssDir, { recursive: true });
  }

  // Generate CSS content with Google Fonts CDN
  let css = `/* Ebb & Bloom Fonts - Google Fonts CDN */
/* Version: ${manifest.version} */

`;

  // Build Google Fonts import URL
  const fontFamilies = manifest.fonts.map(font => {
    const familyName = font.family.replace(/\s+/g, '+');
    const weights = font.weights.join(';');
    const hasItalic = font.styles.includes('italic');
    const hasNormal = font.styles.includes('normal');
    
    let spec = `${familyName}:wght@${weights}`;
    if (hasItalic && hasNormal) {
      spec += `:ital@0;1`;
    } else if (hasItalic) {
      spec += `:ital@1`;
    }
    return spec;
  });

  const importUrl = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join('&')}&display=swap`;
  
  css += `@import url('${importUrl}');\n\n`;

  // Add font descriptions
  for (const font of manifest.fonts) {
    css += `/* ${font.family} - ${font.description} */\n`;
  }

  // Add CSS custom properties for easy usage
  css += `/* CSS Custom Properties for easy font usage */
:root {
`;

  for (const font of manifest.fonts) {
    const varName = font.id.replace(/-/g, '');
    css += `  --font-${varName}: '${font.family}';\n`;
  }

  css += `}

/* Font classes */
`;

  for (const font of manifest.fonts) {
    const className = font.id.replace(/-/g, '-');
    css += `.font-${className} {
  font-family: '${font.family}';
}

/* ${font.description} */
.font-${className} {
  font-family: '${font.family}';
}

`;
  }

  // Write CSS file
  await writeFile(cssOutputPath, css);
  log.info('Font CSS file generated', { path: cssOutputPath });
}

/**
 * Download a Google Font directly
 */
async function downloadGoogleFont(
  font: FontManifest['fonts'][0],
  outputPath: string,
  formats: string[]
): Promise<void> {
  log.info(`Downloading font: ${font.family}`);

  // Build Google Fonts API URL
  // Format: family=Name:wght@400;500;600:ital@0;1
  const familyName = font.family.replace(/\s+/g, '+');
  const weights = font.weights.join(';');
  const hasItalic = font.styles.includes('italic');
  const hasNormal = font.styles.includes('normal');
  
  let apiUrl = `https://fonts.googleapis.com/css2?family=${familyName}:wght@${weights}`;
  if (hasItalic && hasNormal) {
    apiUrl += `:ital@0;1`;
  } else if (hasItalic) {
    apiUrl += `:ital@1`;
  }

  try {
    // Fetch CSS from Google Fonts
    const cssResponse = await fetch(apiUrl);
    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch font CSS: ${cssResponse.statusText}`);
    }

    const cssText = await cssResponse.text();

    // Extract font URLs from CSS
    const urlRegex = /url\(([^)]+)\)/g;
    const urls: string[] = [];
    let match;
    while ((match = urlRegex.exec(cssText)) !== null) {
      urls.push(match[1].replace(/['"]/g, ''));
    }

    // Download each font file
    for (const url of urls) {
      // Extract filename from URL
      const urlPath = new URL(url);
      const pathParts = urlPath.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];

      // Skip if already exists
      const filePath = join(outputPath, fileName);
      if (existsSync(filePath)) {
        log.info(`Skipping existing font file: ${fileName}`);
        continue;
      }

      // Download font file
      log.info(`Downloading font file: ${fileName}`);
      const fontResponse = await fetch(url);
      if (!fontResponse.ok) {
        throw new Error(`Failed to download font file: ${fontResponse.statusText}`);
      }

      const fontBuffer = Buffer.from(await fontResponse.arrayBuffer());
      await writeFile(filePath, fontBuffer);
      log.info(`Downloaded: ${fileName} (${fontBuffer.length} bytes)`);
    }

    log.info(`Completed downloading ${font.family}`);
  } catch (error) {
    log.error(`Failed to download font ${font.family}`, error);
    throw error;
  }
}
