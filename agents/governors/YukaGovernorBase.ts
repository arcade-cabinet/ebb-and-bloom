/**
 * YUKA GOVERNOR BASE CLASS
 * 
 * Provides proper YUKA EntityManager integration for all governors.
 * 
 * Pattern from YUKA examples:
 * - Governor owns EntityManager
 * - Entities (Vehicle/GameEntity) are registered with manager
 * - Update loop calls entityManager.update(delta)
 * - Governors extend this base to add domain-specific logic
 * 
 * See: /tmp/yuka/examples/steering/ for EntityManager patterns
 * See: docs/YUKA_INTEGRATION_PLAN.md for architecture details
 */

import { EntityManager, GameEntity } from 'yuka';

export abstract class YukaGovernorBase {
    /**
     * YUKA EntityManager - owns all entities for this governor
     */
    protected entityManager: EntityManager;
    
    /**
     * Entity lookup by ID for quick access
     */
    protected entities: Map<string, GameEntity>;
    
    constructor() {
        this.entityManager = new EntityManager();
        this.entities = new Map();
    }
    
    /**
     * Register an entity with the manager
     * 
     * @param id - Unique identifier for this entity
     * @param entity - GameEntity/MovingEntity/Vehicle instance
     */
    registerEntity<T extends GameEntity>(id: string, entity: T): void {
        this.entities.set(id, entity);
        this.entityManager.add(entity);
    }
    
    /**
     * Remove an entity from the manager
     * 
     * @param id - Entity identifier
     */
    removeEntity(id: string): void {
        const entity = this.entities.get(id);
        if (entity) {
            this.entityManager.remove(entity);
            this.entities.delete(id);
        }
    }
    
    /**
     * Update loop - calls YUKA EntityManager update + governor logic
     * 
     * @param delta - Time step in seconds (for frame-rate independence)
     */
    update(delta: number): void {
        // YUKA EntityManager handles all entity updates (steering, goals, etc.)
        this.entityManager.update(delta);
        
        // Governor-specific logic
        this.onUpdate(delta);
    }
    
    /**
     * Override this in subclasses for governor-specific update logic
     * 
     * @param delta - Time step in seconds
     */
    protected abstract onUpdate(delta: number): void;
    
    /**
     * Get entity by ID
     * 
     * @param id - Entity identifier
     * @returns Entity instance or undefined
     */
    getEntity(id: string): GameEntity | undefined {
        return this.entities.get(id);
    }
    
    /**
     * Get all entities
     * 
     * @returns Array of all entities
     */
    getAllEntities(): GameEntity[] {
        return Array.from(this.entities.values());
    }
    
    /**
     * Get number of entities
     * 
     * @returns Entity count
     */
    getEntityCount(): number {
        return this.entities.size;
    }
    
    /**
     * Clear all entities
     */
    clear(): void {
        this.entityManager.clear();
        this.entities.clear();
    }
}
