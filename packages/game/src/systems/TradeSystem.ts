/**
 * Trade System (Gen4)
 * 
 * Enables resource and tool exchange between creatures and packs.
 * Trade emerges from surplus, need, and social relationships.
 * 
 * Trade Types:
 * - Direct barter (creature to creature)
 * - Pack trade (pack to pack)
 * - Gift giving (social bonding)
 * - Resource pooling (within packs)
 */

export interface TradeOffer {
  id: string;
  offererId: string;
  targetId: string | null; // null = open offer
  offeringType: 'tool' | 'food' | 'material';
  offeringItem: string; // tool ID or resource type
  requestingType: 'tool' | 'food' | 'material';
  requestingItem: string;
  value: number; // Perceived value (0-1)
  timestamp: number;
  packId?: string; // Pack-level trade
}

export interface TradeTransaction {
  id: string;
  sellerId: string;
  buyerId: string;
  itemType: 'tool' | 'food' | 'material';
  itemId: string;
  price: number; // In social credit or barter value
  timestamp: number;
  packToPackTrade: boolean;
}

export interface CreatureInventory {
  creatureId: string;
  tools: string[]; // Tool IDs
  food: number; // Stored food amount
  materials: Map<string, number>; // material type -> amount
  socialCredit: number; // Reputation/trading power (0-10)
}

export class TradeSystem {
  private inventories: Map<string, CreatureInventory> = new Map();
  private offers: Map<string, TradeOffer> = new Map();
  private transactions: TradeTransaction[] = [];
  private nextOfferId: number = 0;
  private nextTransactionId: number = 0;

  /**
   * Update trade system
   */
  update(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        social?: string;
        intelligence?: number;
        temperament?: string;
      };
    }>,
    packs: Map<string, { members: string[]; leaderId: string }>,
    _tools: Map<string, { position: { lat: number; lon: number }; type: string }>,
    _deltaTime: number
  ): void {
    // Initialize inventories for new creatures
    this.initializeInventories(creatures);

    // Creatures create trade offers based on surplus/need
    this.createTradeOffers(creatures, packs);

    // Match offers and execute trades
    this.matchAndExecuteTrades(creatures);

    // Pack-level resource sharing
    this.shareWithinPacks(packs);

    // Clean up old offers
    this.cleanupOldOffers();
  }

  /**
   * Initialize inventories for new creatures
   */
  private initializeInventories(
    creatures: Map<string, any>
  ): void {
    for (const creatureId of creatures.keys()) {
      if (!this.inventories.has(creatureId)) {
        this.inventories.set(creatureId, {
          creatureId,
          tools: [],
          food: 0,
          materials: new Map(),
          socialCredit: 5.0 // Start neutral
        });
      }
    }
  }

  /**
   * Creatures create trade offers
   */
  private createTradeOffers(
    creatures: Map<string, {
      position: { lat: number; lon: number };
      traits?: {
        social?: string;
        intelligence?: number;
      };
    }>,
    _packs: Map<string, any>
  ): void {
    const OFFER_CHANCE = 0.001; // 0.1% per frame

    for (const [creatureId, creature] of creatures) {
      const inventory = this.inventories.get(creatureId);
      if (!inventory) continue;

      const intelligence = creature.traits?.intelligence || 0.5;
      
      // Only intelligent creatures trade
      if (intelligence < 0.6) continue;

      // Already has active offer?
      const hasOffer = Array.from(this.offers.values()).some(o => o.offererId === creatureId);
      if (hasOffer) continue;

      // Create offer check
      if (Math.random() < OFFER_CHANCE * intelligence) {
        // Surplus food? Offer it
        if (inventory.food > 5) {
          this.createOffer(creatureId, 'food', 'food-surplus', 'tool', 'any', null);
        }
        // Surplus tools? Offer them
        else if (inventory.tools.length > 2) {
          this.createOffer(creatureId, 'tool', inventory.tools[0], 'food', 'food', null);
        }
      }
    }
  }

  /**
   * Create a trade offer
   */
  private createOffer(
    offererId: string,
    offeringType: TradeOffer['offeringType'],
    offeringItem: string,
    requestingType: TradeOffer['requestingType'],
    requestingItem: string,
    targetId: string | null
  ): TradeOffer {
    const offer: TradeOffer = {
      id: `offer-${this.nextOfferId++}`,
      offererId,
      targetId,
      offeringType,
      offeringItem,
      requestingType,
      requestingItem,
      value: 0.5, // Base value
      timestamp: Date.now()
    };

    this.offers.set(offer.id, offer);
    return offer;
  }

  /**
   * Match offers and execute trades
   */
  private matchAndExecuteTrades(
    creatures: Map<string, {
      position: { lat: number; lon: number };
    }>
  ): void {
    const TRADE_RANGE = 5; // degrees

    for (const [offerId, offer] of this.offers) {
      // Find potential buyers
      for (const [buyerId, buyer] of creatures) {
        if (buyerId === offer.offererId) continue;

        const buyerInventory = this.inventories.get(buyerId);
        if (!buyerInventory) continue;

        // Within range?
        const offerer = creatures.get(offer.offererId);
        if (!offerer) continue;

        const dist = this.distanceOnSphere(offerer.position, buyer.position);
        if (dist > TRADE_RANGE) continue;

        // Buyer has what seller wants?
        const canFulfill = this.canFulfillRequest(buyerInventory, offer.requestingType, offer.requestingItem);
        if (!canFulfill) continue;

        // Execute trade
        this.executeTrade(offer, buyerId);
        this.offers.delete(offerId);
        break;
      }
    }
  }

  /**
   * Check if inventory can fulfill request
   */
  private canFulfillRequest(
    inventory: CreatureInventory,
    type: string,
    item: string
  ): boolean {
    switch (type) {
      case 'food':
        return inventory.food >= 1;
      case 'tool':
        return inventory.tools.length > 0;
      case 'material':
        return (inventory.materials.get(item) || 0) > 0;
      default:
        return false;
    }
  }

  /**
   * Execute a trade transaction
   */
  private executeTrade(offer: TradeOffer, buyerId: string): void {
    const sellerInventory = this.inventories.get(offer.offererId);
    const buyerInventory = this.inventories.get(buyerId);

    if (!sellerInventory || !buyerInventory) return;

    // Transfer items
    // Seller gives
    switch (offer.offeringType) {
      case 'food':
        if (sellerInventory.food >= 1) {
          sellerInventory.food -= 1;
          buyerInventory.food += 1;
        }
        break;
      case 'tool':
        const toolIdx = sellerInventory.tools.indexOf(offer.offeringItem);
        if (toolIdx >= 0) {
          const tool = sellerInventory.tools.splice(toolIdx, 1)[0];
          buyerInventory.tools.push(tool);
        }
        break;
    }

    // Buyer gives
    switch (offer.requestingType) {
      case 'food':
        if (buyerInventory.food >= 1) {
          buyerInventory.food -= 1;
          sellerInventory.food += 1;
        }
        break;
      case 'tool':
        if (buyerInventory.tools.length > 0) {
          const tool = buyerInventory.tools.pop()!;
          sellerInventory.tools.push(tool);
        }
        break;
    }

    // Update social credit
    sellerInventory.socialCredit += 0.1;
    buyerInventory.socialCredit += 0.1;

    // Record transaction
    const transaction: TradeTransaction = {
      id: `txn-${this.nextTransactionId++}`,
      sellerId: offer.offererId,
      buyerId,
      itemType: offer.offeringType,
      itemId: offer.offeringItem,
      price: offer.value,
      timestamp: Date.now(),
      packToPackTrade: false
    };

    this.transactions.push(transaction);
  }

  /**
   * Pack-level resource sharing
   */
  private shareWithinPacks(
    packs: Map<string, { members: string[]; leaderId: string }>
  ): void {
    for (const pack of packs.values()) {
      // Calculate pack totals
      let totalFood = 0;
      let totalTools = 0;

      for (const memberId of pack.members) {
        const inv = this.inventories.get(memberId);
        if (inv) {
          totalFood += inv.food;
          totalTools += inv.tools.length;
        }
      }

      // Redistribute evenly (simple socialism within packs)
      const avgFood = totalFood / pack.members.length;

      for (const memberId of pack.members) {
        const inv = this.inventories.get(memberId);
        if (inv) {
          // Smooth towards average (10% per frame)
          inv.food = inv.food * 0.9 + avgFood * 0.1;
        }
      }
    }
  }

  /**
   * Clean up old offers
   */
  private cleanupOldOffers(): void {
    const MAX_AGE = 60000; // 60 seconds
    const now = Date.now();

    for (const [id, offer] of this.offers) {
      if (now - offer.timestamp > MAX_AGE) {
        this.offers.delete(id);
      }
    }
  }

  /**
   * Calculate distance on sphere
   */
  private distanceOnSphere(
    pos1: { lat: number; lon: number },
    pos2: { lat: number; lon: number }
  ): number {
    const dLat = pos2.lat - pos1.lat;
    const dLon = pos2.lon - pos1.lon;
    return Math.sqrt(dLat * dLat + dLon * dLon);
  }

  /**
   * Get creature inventory
   */
  getInventory(creatureId: string): CreatureInventory | null {
    return this.inventories.get(creatureId) || null;
  }

  /**
   * Get all active offers
   */
  getOffers(): TradeOffer[] {
    return Array.from(this.offers.values());
  }

  /**
   * Get recent transactions
   */
  getRecentTransactions(limit: number = 10): TradeTransaction[] {
    return this.transactions.slice(-limit);
  }

  /**
   * Add item to inventory
   */
  addToInventory(creatureId: string, type: 'tool' | 'food' | 'material', item: string, amount: number = 1): void {
    const inv = this.inventories.get(creatureId);
    if (!inv) return;

    switch (type) {
      case 'tool':
        inv.tools.push(item);
        break;
      case 'food':
        inv.food += amount;
        break;
      case 'material':
        const current = inv.materials.get(item) || 0;
        inv.materials.set(item, current + amount);
        break;
    }
  }
}
