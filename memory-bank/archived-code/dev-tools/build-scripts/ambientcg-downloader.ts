/**
 * AmbientCG Texture Downloader - Production-Quality Implementation
 * Parallel downloads, exponential backoff, idempotency, proper error handling
 */

import { createWriteStream, existsSync, mkdirSync, statSync, readdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';
import axios, { AxiosError } from 'axios';

interface TextureAsset {
  assetId: string;
  name: string;
  category: string;
  downloadLink: string;
  resolution: string;
  fileType: string;
  mapType: string;
  fileSize?: number;
}

interface DownloaderConfig {
  resolution: '1K' | '2K' | '4K' | '8K';
  fileTypes: string[];
  categories: string[];
  outputDir: string;
  maxConcurrent: number;
  maxRetries: number;
  baseDelayMs: number;
  timeoutMs: number;
}

interface DownloadResult {
  success: boolean;
  asset: TextureAsset;
  filePath?: string;
  error?: string;
  retries: number;
  duration: number;
}

interface DownloadState {
  manifest: Map<string, TextureAsset>;
  completed: Set<string>;
  failed: Set<string>;
  inProgress: Set<string>;
  startTime: number;
  totalBytes: number;
}

class AmbientCGDownloader {
  private config: DownloaderConfig;
  private state: DownloadState;
  private retryQueue: Array<{ asset: TextureAsset; attempt: number }> = [];
  
  constructor(config: DownloaderConfig) {
    this.config = config;
    this.state = {
      manifest: new Map(),
      completed: new Set(),
      failed: new Set(), 
      inProgress: new Set(),
      startTime: 0,
      totalBytes: 0
    };
    
    // Ensure output directory exists
    if (!existsSync(this.config.outputDir)) {
      mkdirSync(this.config.outputDir, { recursive: true });
    }
    
    console.log('AmbientCG Downloader initialized', this.config);
  }

  async fetchAssetList(): Promise<TextureAsset[]> {
    console.log('Fetching AmbientCG textures via CSV API...');
    
    const allAssets: TextureAsset[] = [];
    
    // Use the working CSV API with category filtering
    for (const category of this.config.categories) {
      try {
        console.log(`Fetching ${category} textures...`);
        
        const response = await axios.get('https://ambientcg.com/api/v2/full_json', {
          params: {
            type: 'Material',
            q: category,
            sort: 'Popular',
            limit: 20,
            include: 'downloadData,mapData'
          },
          timeout: this.config.timeoutMs
        });
        
        const categoryAssets = this.parseJSON(response.data, category);
        allAssets.push(...categoryAssets);
        
        // Rate limiting
        await this.delay(200);
        
      } catch (error) {
        console.error(`Failed to fetch ${category} textures:`, error);
      }
    }
    
    console.log(`Found ${allAssets.length} texture assets ready for download`);
    return allAssets;
  }
  
  private parseJSON(jsonData: any, category: string): TextureAsset[] {
    const assets: TextureAsset[] = [];
    
    if (!jsonData.foundAssets) return assets;
    
    for (const asset of jsonData.foundAssets) {
      if (!asset.downloadFolders || !asset.downloadFolders.default) continue;
      
      const downloads = asset.downloadFolders.default.downloadFiletypeCategories;
      if (!downloads || !downloads.zip) continue;
      
      for (const download of downloads.zip.downloads) {
        if (download.attribute === `${this.config.resolution}-${this.config.fileTypes[0].toUpperCase()}`) {
          assets.push({
            assetId: asset.assetId,
            name: asset.displayName || asset.assetId,
            category: asset.displayCategory || category,
            downloadLink: download.downloadLink,
            resolution: this.config.resolution,
            fileType: this.config.fileTypes[0],
            mapType: 'bundle'
          });
        }
      }
    }
    
    return assets;
  }
  
  private async getAssetDownloads(assetId: string): Promise<TextureAsset[]> {
    try {
      // Use the correct API endpoint for individual asset download data
      const response = await axios.get(`https://ambientcg.com/api/v2/full_json`, {
        params: {
          assetId,
          include: 'downloadData'
        },
        timeout: this.config.timeoutMs
      });
      
      const assets: TextureAsset[] = [];
      
      if (!response.data.foundAssets || response.data.foundAssets.length === 0) {
        return assets;
      }
      
      const asset = response.data.foundAssets[0]; // Single asset response
      
      if (!asset.downloadFolders) {
        return assets;
      }
      
      // Extract download links for our target resolution
      const resolutionData = asset.downloadFolders[this.config.resolution];
      if (!resolutionData) return assets;
      
      for (const [mapType, url] of Object.entries(resolutionData)) {
        if (typeof url !== 'string') continue;
        
        const fileExtension = this.extractFileExtension(url);
        if (!this.config.fileTypes.includes(fileExtension)) continue;
        
        assets.push({
          assetId: asset.assetId,
          name: asset.displayName || assetId,
          category: asset.displayCategory || 'unknown',
          downloadLink: url,
          resolution: this.config.resolution,
          fileType: fileExtension,
          mapType: mapType.toLowerCase()
        });
      }
      
      return assets;
      
    } catch (error) {
      console.warn(`Failed to get downloads for ${assetId}:`, (error as AxiosError).message);
      return [];
    }
  }
  
  private extractFileExtension(url: string): string {
    const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
    return match ? match[1].toLowerCase() : 'jpg';
  }

  async downloadAll(): Promise<DownloadResult[]> {
    this.state.startTime = Date.now();
    
    const assets = await this.fetchAssetList();
    const filteredAssets = this.filterAssets(assets);
    
    console.log(`Starting parallel download of ${filteredAssets.length} textures...`);
    console.log(`Parallelism: ${this.config.maxConcurrent} concurrent downloads`);
    console.log(`Output directory: ${this.config.outputDir}`);
    
    // Load existing state for idempotency
    this.loadExistingState();
    
    const results = await this.parallelDownload(filteredAssets);
    
    // Save manifest for React hooks
    await this.saveManifest(results.filter(r => r.success));
    
    // Print summary
    this.printSummary(results);
    
    return results;
  }
  
  private filterAssets(assets: TextureAsset[]): TextureAsset[] {
    return assets.filter(asset => {
      // Apply category filter if specified
      if (this.config.categories.length > 0) {
        return this.config.categories.includes(asset.category.toLowerCase());
      }
      return true;
    });
  }
  
  private loadExistingState(): void {
    console.log('Checking for existing downloads (idempotency)...');
    
    let existingCount = 0;
    
    // Recursively check output directory
    const checkDirectory = (dir: string) => {
      if (!existsSync(dir)) return;
      
      try {
        const files = readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
          if (file.isDirectory()) {
            checkDirectory(join(dir, file.name));
          } else if (file.isFile()) {
            const fileName = file.name;
            const assetId = fileName.split('_')[0]; // Extract asset ID from filename
            
            if (assetId) {
              this.state.completed.add(assetId);
              existingCount++;
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to read directory ${dir}:`, e);
      }
    };
    
    checkDirectory(this.config.outputDir);
    
    console.log(`Found ${existingCount} existing texture files - will skip redownloading`);
  }
  
  private async parallelDownload(assets: TextureAsset[]): Promise<DownloadResult[]> {
    const results: DownloadResult[] = [];
    const semaphore = new Array(this.config.maxConcurrent).fill(null);
    let assetIndex = 0;
    
    // Process downloads with controlled parallelism
    const downloadWorker = async (workerId: number): Promise<void> => {
      while (assetIndex < assets.length) {
        const asset = assets[assetIndex++];
        
        if (this.shouldSkipAsset(asset)) {
          results.push({
            success: true,
            asset,
            filePath: this.getAssetFilePath(asset),
            retries: 0,
            duration: 0
          });
          continue;
        }
        
        console.log(`[Worker ${workerId}] Downloading ${asset.name} (${asset.mapType})`);
        
        const result = await this.downloadAssetWithRetry(asset);
        results.push(result);
        
        // Progress update
        if (results.length % 10 === 0) {
          this.printProgress(results.length, assets.length);
        }
      }
    };
    
    // Start all workers
    await Promise.all(semaphore.map((_, i) => downloadWorker(i)));
    
    // Process retry queue
    if (this.retryQueue.length > 0) {
      console.log(`Processing ${this.retryQueue.length} failed downloads...`);
      
      for (const retry of this.retryQueue) {
        const result = await this.downloadAssetWithRetry(retry.asset, retry.attempt);
        results.push(result);
      }
    }
    
    return results;
  }
  
  private shouldSkipAsset(asset: TextureAsset): boolean {
    const filePath = this.getAssetFilePath(asset);
    
    // Check if file already exists and is valid
    if (existsSync(filePath)) {
      try {
        const stats = statSync(filePath);
        if (stats.size > 0) {
          return true; // Skip - already downloaded
        }
      } catch (e) {
        // File exists but corrupted, will redownload
      }
    }
    
    return false;
  }
  
  private async downloadAssetWithRetry(
    asset: TextureAsset, 
    startAttempt: number = 0
  ): Promise<DownloadResult> {
    
    const startTime = Date.now();
    let lastError: string = '';
    
    for (let attempt = startAttempt; attempt < this.config.maxRetries; attempt++) {
      try {
        this.state.inProgress.add(asset.assetId);
        
        const filePath = await this.downloadSingleAsset(asset);
        
        this.state.inProgress.delete(asset.assetId);
        this.state.completed.add(asset.assetId);
        
        return {
          success: true,
          asset,
          filePath,
          retries: attempt,
          duration: Date.now() - startTime
        };
        
      } catch (error) {
        lastError = (error as Error).message;
        
        if (attempt < this.config.maxRetries - 1) {
          // Exponential backoff
          const delay = this.config.baseDelayMs * Math.pow(2, attempt);
          console.warn(`[Retry ${attempt + 1}/${this.config.maxRetries}] ${asset.name} failed, retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }
    
    // All retries failed
    this.state.inProgress.delete(asset.assetId);
    this.state.failed.add(asset.assetId);
    
    return {
      success: false,
      asset,
      error: `Failed after ${this.config.maxRetries} attempts: ${lastError}`,
      retries: this.config.maxRetries,
      duration: Date.now() - startTime
    };
  }
  
  private async downloadSingleAsset(asset: TextureAsset): Promise<string> {
    const filePath = this.getAssetFilePath(asset);
    const categoryDir = dirname(filePath);
    
    // Ensure category directory exists
    if (!existsSync(categoryDir)) {
      mkdirSync(categoryDir, { recursive: true });
    }
    
    // Download with timeout and progress tracking
    const response = await axios({
      method: 'GET',
      url: asset.downloadLink,
      responseType: 'stream',
      timeout: this.config.timeoutMs,
      headers: {
        'User-Agent': 'Ebb-Bloom-Game/1.0'
      }
    });
    
    // Track download size
    const contentLength = parseInt(response.headers['content-length'] || '0');
    if (contentLength > 0) {
      this.state.totalBytes += contentLength;
    }
    
    const writeStream = createWriteStream(filePath);
    await pipeline(response.data, writeStream);
    
    // Verify file was written correctly
    if (!existsSync(filePath) || statSync(filePath).size === 0) {
      throw new Error('Downloaded file is empty or missing');
    }
    
    return filePath;
  }
  
  private getAssetFilePath(asset: TextureAsset): string {
    const fileName = `${asset.assetId}_${asset.mapType}_${asset.resolution}.${asset.fileType}`;
    return join(this.config.outputDir, asset.category.toLowerCase(), fileName);
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private printProgress(completed: number, total: number): void {
    const percentage = ((completed / total) * 100).toFixed(1);
    const elapsed = (Date.now() - this.state.startTime) / 1000;
    const rate = completed / elapsed;
    const eta = (total - completed) / rate;
    
    console.log(`Progress: ${completed}/${total} (${percentage}%) | ${rate.toFixed(1)}/s | ETA: ${eta.toFixed(0)}s | ${(this.state.totalBytes / 1024 / 1024).toFixed(1)}MB`);
  }
  
  private printSummary(results: DownloadResult[]): void {
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const skipped = this.state.completed.size - successful;
    const totalTime = (Date.now() - this.state.startTime) / 1000;
    const totalSize = this.state.totalBytes / 1024 / 1024;
    
    console.log('\n=== DOWNLOAD SUMMARY ===');
    console.log(`Total time: ${totalTime.toFixed(1)}s`);
    console.log(`Downloaded: ${successful} textures`);
    console.log(`Skipped (existing): ${skipped} textures`);
    console.log(`Failed: ${failed} textures`);
    console.log(`Total size: ${totalSize.toFixed(1)}MB`);
    console.log(`Average speed: ${(totalSize / totalTime).toFixed(1)}MB/s`);
    
    if (failed > 0) {
      console.log('\nFailed downloads:');
      results.filter(r => !r.success).forEach(result => {
        console.log(`  ${result.asset.assetId}: ${result.error}`);
      });
    }
    
    console.log('========================\n');
  }
  
  private async saveManifest(successfulResults: DownloadResult[]): Promise<void> {
    const manifestPath = join(this.config.outputDir, 'manifest.json');
    
    const manifest = {
      generatedAt: new Date().toISOString(),
      totalTextures: successfulResults.length,
      categories: [...new Set(successfulResults.map(r => r.asset.category))],
      resolution: this.config.resolution,
      assets: successfulResults.map(result => ({
        assetId: result.asset.assetId,
        name: result.asset.name,
        category: result.asset.category,
        mapType: result.asset.mapType,
        filePath: result.filePath?.replace(this.config.outputDir, ''), // Relative path
        localPath: result.filePath
      }))
    };
    
    await writeFile(
      manifestPath, 
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`Texture manifest saved to ${manifestPath}`);
    console.log(`Ready for React hooks integration`);
  }
  
  // Public API for resumable downloads
  async resumeDownload(): Promise<DownloadResult[]> {
    console.log('Resuming previous download...');
    this.loadExistingState();
    
    // Only download assets that aren't completed
    const assets = await this.fetchAssetList();
    const remainingAssets = assets.filter(asset => 
      !this.state.completed.has(asset.assetId) && 
      !this.state.failed.has(asset.assetId)
    );
    
    if (remainingAssets.length === 0) {
      console.log('No remaining downloads - all textures already acquired');
      return [];
    }
    
    console.log(`Resuming download of ${remainingAssets.length} remaining textures`);
    return this.parallelDownload(remainingAssets);
  }
  
  // Get download statistics
  getStats(): {
    totalAssets: number;
    completed: number;
    failed: number;
    inProgress: number;
    totalSizeMB: number;
    categories: string[];
  } {
    return {
      totalAssets: this.state.manifest.size,
      completed: this.state.completed.size,
      failed: this.state.failed.size, 
      inProgress: this.state.inProgress.size,
      totalSizeMB: this.state.totalBytes / 1024 / 1024,
      categories: [...new Set(Array.from(this.state.manifest.values()).map(a => a.category))]
    };
  }
}

// Production configuration for game development
const PRODUCTION_CONFIG: DownloaderConfig = {
  resolution: '2K',
  fileTypes: ['jpg'],
  categories: [
    'wood', 'metal', 'stone', 'concrete', 'bricks', 
    'grass', 'rock', 'fabric', 'leather'
  ],
  outputDir: './public/textures',
  maxConcurrent: 8,        // Reasonable parallelism
  maxRetries: 3,           // Give up after 3 attempts
  baseDelayMs: 1000,       // Start with 1 second delay
  timeoutMs: 30000         // 30 second timeout per download
};

// CLI execution
async function main() {
  console.log('Starting AmbientCG texture download with production configuration...');
  
  const downloader = new AmbientCGDownloader(PRODUCTION_CONFIG);
  
  try {
    const results = await downloader.downloadAll();
    
    const stats = downloader.getStats();
    console.log('Final statistics:', stats);
    
    if (stats.failed > 0) {
      console.warn(`${stats.failed} downloads failed - check error logs`);
      process.exit(1);
    } else {
      console.log('All downloads completed successfully!');
      console.log('Texture library ready for React Three Fiber integration');
    }
    
  } catch (error) {
    console.error('Download process failed:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AmbientCGDownloader, type DownloaderConfig, type TextureAsset, type DownloadResult };