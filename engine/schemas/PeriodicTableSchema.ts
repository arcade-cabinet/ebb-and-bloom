/**
 * PERIODIC TABLE ZOD SCHEMA
 * 
 * Type-safe validation for periodic table JSON data.
 * Ensures chemical accuracy and proper visual properties.
 */

import { z } from 'zod';

export const ElementSchema = z.object({
  // Core chemical properties
  name: z.string(),
  symbol: z.string().min(1).max(3),
  number: z.number().int().min(1).max(118),
  atomic_mass: z.number().positive(),
  
  // Chemical bonding
  electronegativity_pauling: z.number().optional(),
  electron_configuration: z.string().optional(),
  electrons_per_shell: z.array(z.number()).optional(),
  
  // Physical properties
  phase: z.enum(['Gas', 'Liquid', 'Solid']).optional(),
  melting_point: z.number().optional(),
  boiling_point: z.number().optional(),
  density: z.number().optional(),
  
  // Position in table
  period: z.number().int().min(1).max(7),
  group: z.number().int().min(1).max(18).optional(),
  
  // Visual properties (for 3D rendering)
  cpk_hex: z.string().optional(), // Standard CPK color
  appearance: z.string().optional(),
  
  // Our extended properties for game rendering
  visual: z.object({
    metallic: z.number().min(0).max(1).default(0.1),
    roughness: z.number().min(0).max(1).default(0.8),
    opacity: z.number().min(0).max(1).default(1.0),
    emissive: z.number().min(0).max(1).default(0.0)
  }).optional()
});

export const PeriodicTableSchema = z.object({
  elements: z.array(ElementSchema)
});

export type Element = z.infer<typeof ElementSchema>;
export type PeriodicTableData = z.infer<typeof PeriodicTableSchema>;

// Validation function
export function validatePeriodicTableData(data: unknown): PeriodicTableData {
  return PeriodicTableSchema.parse(data);
}

// Get element with proper typing
export function getElement(data: PeriodicTableData, symbol: string): Element | undefined {
  return data.elements.find(el => el.symbol === symbol);
}

// Get visual properties with defaults
export function getVisualProperties(element: Element) {
  return {
    color: element.cpk_hex || '#cccccc',
    metallic: element.visual?.metallic ?? (element.name.toLowerCase().includes('metal') ? 0.8 : 0.1),
    roughness: element.visual?.roughness ?? (element.name.toLowerCase().includes('metal') ? 0.2 : 0.8),
    opacity: element.visual?.opacity ?? (element.phase === 'Gas' ? 0.6 : 1.0),
    emissive: element.visual?.emissive ?? (element.name.toLowerCase().includes('noble') ? 0.3 : 0.0),
    radius: element.atomic_mass ? Math.max(0.2, element.atomic_mass / 400) : 0.5
  };
}