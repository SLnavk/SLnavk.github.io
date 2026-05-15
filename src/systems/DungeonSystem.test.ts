import { describe, it, expect, vi } from 'vitest';
import { DungeonSystem } from './DungeonSystem';

describe('DungeonSystem', () => {
  describe('explore', () => {
    it('should return a valid exploration result', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.99);
      const result = DungeonSystem.explore(1);
      expect(['monster', 'item', 'nothing']).toContain(result.event);
      expect(typeof result.message).toBe('string');
      vi.restoreAllMocks();
    });

    it('should return monster event (roll < 0.4)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      const result = DungeonSystem.explore(1);
      expect(result.event).toBe('monster');
      expect(result.monster).toBeDefined();
      vi.restoreAllMocks();
    });

    it('should return nothing event (roll 0.55-0.99)', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.7);
      const result = DungeonSystem.explore(1);
      expect(result.event).toBe('nothing');
      vi.restoreAllMocks();
    });
  });

  describe('rollStairs', () => {
    it('should find stairs when roll succeeds', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      expect(DungeonSystem.rollStairs()).toBe(true);
      vi.restoreAllMocks();
    });

    it('should not find stairs when roll fails', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9);
      expect(DungeonSystem.rollStairs()).toBe(false);
      vi.restoreAllMocks();
    });
  });

  describe('isPortalFloor', () => {
    it('should return true for floor 10', () => {
      expect(DungeonSystem.isPortalFloor(10)).toBe(true);
    });

    it('should return false for non-portal floors', () => {
      expect(DungeonSystem.isPortalFloor(1)).toBe(false);
      expect(DungeonSystem.isPortalFloor(5)).toBe(false);
      expect(DungeonSystem.isPortalFloor(11)).toBe(false);
    });
  });
});
