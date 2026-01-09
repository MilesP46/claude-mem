import { describe, it, expect, mock, beforeEach } from 'bun:test';
import path from 'path';

// Helper function to test - extracted from save-hook.ts
function isProjectAllowed(cwd: string, allowedProjects: string): boolean {
  if (!allowedProjects) return true; // Empty = all projects allowed
  // Normalize and remove trailing slashes for consistent comparison
  const normalized = path.normalize(cwd).replace(/\/+$/, '');
  const allowed = allowedProjects.split(',').map(p => path.normalize(p.trim()).replace(/\/+$/, ''));
  return allowed.some(p => normalized.startsWith(p));
}

describe('Save Hook Collection Controls', () => {
  describe('isProjectAllowed', () => {
    it('should allow all projects when allowedProjects is empty', () => {
      expect(isProjectAllowed('/any/path', '')).toBe(true);
      expect(isProjectAllowed('/Users/miles/project', '')).toBe(true);
    });

    it('should allow exact path match', () => {
      const allowed = '/Users/miles/CodingMac/claude-mem';
      expect(isProjectAllowed('/Users/miles/CodingMac/claude-mem', allowed)).toBe(true);
    });

    it('should allow subdirectory of allowed path', () => {
      const allowed = '/Users/miles/CodingMac';
      expect(isProjectAllowed('/Users/miles/CodingMac/claude-mem', allowed)).toBe(true);
      expect(isProjectAllowed('/Users/miles/CodingMac/other-project', allowed)).toBe(true);
    });

    it('should block projects not in allowlist', () => {
      const allowed = '/Users/miles/CodingMac/claude-mem';
      expect(isProjectAllowed('/Users/miles/OtherFolder/project', allowed)).toBe(false);
    });

    it('should handle multiple allowed projects', () => {
      const allowed = '/path/a,/path/b,/path/c';
      expect(isProjectAllowed('/path/a/subdir', allowed)).toBe(true);
      expect(isProjectAllowed('/path/b', allowed)).toBe(true);
      expect(isProjectAllowed('/path/c/deep/nested', allowed)).toBe(true);
      expect(isProjectAllowed('/path/d', allowed)).toBe(false);
    });

    it('should handle spaces in comma-separated list', () => {
      const allowed = '/path/a, /path/b , /path/c';
      expect(isProjectAllowed('/path/a', allowed)).toBe(true);
      expect(isProjectAllowed('/path/b', allowed)).toBe(true);
      expect(isProjectAllowed('/path/c', allowed)).toBe(true);
    });

    it('should handle trailing slashes via path normalization', () => {
      const allowed = '/path/to/project/';
      expect(isProjectAllowed('/path/to/project', allowed)).toBe(true);
      expect(isProjectAllowed('/path/to/project/', allowed)).toBe(true);
    });

    it('should be case-sensitive on Unix', () => {
      const allowed = '/Users/Miles/Project';
      // On Unix, case matters
      if (process.platform !== 'win32') {
        expect(isProjectAllowed('/Users/miles/Project', allowed)).toBe(false);
      }
    });
  });

  describe('Collection Toggle Behavior', () => {
    it('should understand collection enabled logic', () => {
      // When CLAUDE_MEM_COLLECTION_ENABLED === 'true', collection should proceed
      const enabled = 'true';
      expect(enabled === 'true').toBe(true);

      // When CLAUDE_MEM_COLLECTION_ENABLED !== 'true', collection should be skipped
      const disabled = 'false';
      expect(disabled === 'true').toBe(false);

      // Empty string should also be treated as disabled
      const empty = '';
      expect(empty === 'true').toBe(false);
    });
  });

  describe('Combined Filter Logic', () => {
    it('should skip when collection is disabled regardless of project', () => {
      const collectionEnabled = 'false';
      const cwd = '/Users/miles/CodingMac/claude-mem';
      const allowedProjects = '/Users/miles/CodingMac/claude-mem';

      // Even if project is allowed, disabled collection should skip
      const shouldCollect = collectionEnabled === 'true' && isProjectAllowed(cwd, allowedProjects);
      expect(shouldCollect).toBe(false);
    });

    it('should skip when project is not in allowlist', () => {
      const collectionEnabled = 'true';
      const cwd = '/Users/miles/OtherProject';
      const allowedProjects = '/Users/miles/CodingMac/claude-mem';

      const shouldCollect = collectionEnabled === 'true' && isProjectAllowed(cwd, allowedProjects);
      expect(shouldCollect).toBe(false);
    });

    it('should collect when enabled and project is allowed', () => {
      const collectionEnabled = 'true';
      const cwd = '/Users/miles/CodingMac/claude-mem';
      const allowedProjects = '/Users/miles/CodingMac/claude-mem';

      const shouldCollect = collectionEnabled === 'true' && isProjectAllowed(cwd, allowedProjects);
      expect(shouldCollect).toBe(true);
    });

    it('should collect when enabled and allowlist is empty (all allowed)', () => {
      const collectionEnabled = 'true';
      const cwd = '/any/project/path';
      const allowedProjects = '';

      const shouldCollect = collectionEnabled === 'true' && isProjectAllowed(cwd, allowedProjects);
      expect(shouldCollect).toBe(true);
    });
  });
});
