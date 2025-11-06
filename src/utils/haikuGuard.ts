// src/utils/haikuGuard.ts
import { gameStore } from '../stores/gameStore'; // Zustand tie

interface Haiku {
  text: string;
  keywords: string[];
}

const metaphorBank = {
  thorn: ['lover', 'whisper', 'tide', 'ache', 'bloom'],
  vein: ['memory', 'pulse', 'scar', 'hush', 'wake'],
  // Expand for evo diversity
};

class HaikuGuard {
  private threshold = 0.2; // Jaro-Winkler max

  // Jaro-Winkler similarity (full impl)
  jaroWinkler(s1: string, s2: string, p = 0.1, maxPrefix = 4): number {
    if (s1.length === 0 && s2.length === 0) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    const window = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
    let match = 0, trans = 0;
    const s1Flags = new Array(s1.length).fill(false);
    const s2Flags = new Array(s2.length).fill(false);

    // Matching chars
    for (let i = 0; i < s1.length; i++) {
      const start = Math.max(0, i - window);
      for (let j = start; j < Math.min(s2.length, i + window + 1); j++) {
        if (s2Flags[j] || s1.charAt(i) !== s2.charAt(j)) continue;
        s1Flags[i] = s2Flags[j] = true;
        match++;
        break;
      }
    }

    // Transpositions
    for (let i = 0; i < s1.length; i++) {
      if (s1Flags[i]) {
        while (!s2Flags[i]) i++;
        if (s1.charAt(i) !== s2.charAt(i)) trans++;
      }
    }

    const jaro = match === 0 ? 0 : (1 / 3) * (match / s1.length + match / s2.length + (match - trans / 2) / match);

    // Prefix boost
    let prefix = 0;
    for (let i = 0; i < Math.min(maxPrefix, Math.min(s1.length, s2.length)); i++) {
      if (s1.charAt(i) === s2.charAt(i)) prefix++;
      else break;
    }

    return jaro + (prefix * p * (1 - jaro));
  }

  // Score recent haikus, flag >threshold
  scoreVariety(recent: Haiku[]): { avg: number; flagged: number[]; rec: string } {
    let total = 0, count = 0, flagged = 0;
    for (let i = 0; i < recent.length; i++) {
      for (let j = i + 1; j < recent.length; j++) {
        const sim = this.jaroWinkler(recent[i].text, recent[j].text);
        total += sim;
        count++;
        if (sim > this.threshold) flagged++;
      }
    }
    const avg = count > 0 ? total / count : 0;
    const rec = flagged > 0 ? `Diversify: Attune ${flagged} echoes with metaphor '${metaphorBank.thorn[Math.floor(Math.random() * metaphorBank.thorn.length)]}'` : 'Fresh ache—evo whispers true';
    return { avg, flagged, rec };
  }

  // Procedural haiku gen with guard (5-7-5 syllable mock)
  genHaiku(seedPhrase: string, evo: string): Haiku {
    const line1 = `${seedPhrase} whispers in the`; // 5 syllables
    const line2 = `vein of ${evo} echoes cold`; // 7
    const line3 = `tides pull the light low`; // 5
    const text = [line1, line2, line3].join(' ');
    const keywords = text.toLowerCase().split(' ').filter(w => w.length > 2);
    return { text, keywords };
  }

  // Hook for journal evo (Zustand)
  checkEvoHaiku(evo: string) {
    const store = gameStore.getState();
    
    // Journal persistence: Use localStorage as interim solution
    // This provides journal functionality without requiring immediate gameStore schema changes
    const getJournal = (): string[] => {
      try {
        const stored = localStorage.getItem('ebb-bloom-journal');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.warn('Failed to load journal:', e);
        return [];
      }
    };
    
    const saveJournal = (journal: string[]) => {
      try {
        localStorage.setItem('ebb-bloom-journal', JSON.stringify(journal));
      } catch (e) {
        console.warn('Failed to save journal:', e);
      }
    };
    
    const journal = getJournal();
    const recent = journal.slice(-5);
    const candidate = this.genHaiku('flipper', evo); // Seed from trait
    const { avg } = this.scoreVariety([...recent, candidate]);
    
    if (avg > this.threshold) {
      // Reroll with metaphor to ensure diversity
      const meta = metaphorBank['thorn'][Math.floor(Math.random() * metaphorBank.thorn.length)];
      const rerolled = this.genHaiku(meta, evo);
      journal.push(rerolled);
      saveJournal(journal);
      return rerolled;
    }
    
    journal.push(candidate);
    saveJournal(journal);
    return candidate;
  }
}

export const useHaikuGuard = () => new HaikuGuard();