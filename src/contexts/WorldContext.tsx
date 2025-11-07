/**
 * World Context - Provides ECS world and ecosystem access to React components
 * Enables Miniplex React hooks to work properly
 */

import { World } from 'miniplex';
import React, { createContext, ReactNode, useContext } from 'react';
import type EcosystemFoundation from '../systems/EcosystemFoundation';
import type { WorldSchema } from '../world/ECSWorld';

interface WorldContextValue {
    world: World<WorldSchema>;
    ecosystem: EcosystemFoundation | null;
}

const WorldContext = createContext<WorldContextValue | null>(null);

export const useWorld = (): WorldContextValue => {
    const context = useContext(WorldContext);
    if (!context) {
        throw new Error('useWorld must be used within WorldProvider');
    }
    return context;
};

interface WorldProviderProps {
    world: World<WorldSchema>;
    ecosystem: EcosystemFoundation | null;
    children: ReactNode;
}

export const WorldProvider: React.FC<WorldProviderProps> = ({ world, ecosystem, children }) => {
    return (
        <WorldContext.Provider value={{ world, ecosystem }}>
            {children}
        </WorldContext.Provider>
    );
};
