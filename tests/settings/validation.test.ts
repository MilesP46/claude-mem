import { describe, it, expect } from 'bun:test';

/**
 * Settings validation tests for collection control settings
 * These mirror the validation logic in SettingsRoutes.ts
 */

// Extracted validation logic from SettingsRoutes
function validateBooleanSetting(value: any): { valid: boolean; error?: string } {
  if (value && !['true', 'false'].includes(value)) {
    return { valid: false, error: 'Value must be "true" or "false"' };
  }
  return { valid: true };
}

function validateSettings(settings: any): { valid: boolean; error?: string } {
  // Validate CLAUDE_MEM_COLLECTION_ENABLED as boolean string
  if (settings.CLAUDE_MEM_COLLECTION_ENABLED) {
    const result = validateBooleanSetting(settings.CLAUDE_MEM_COLLECTION_ENABLED);
    if (!result.valid) {
      return { valid: false, error: `CLAUDE_MEM_COLLECTION_ENABLED: ${result.error}` };
    }
  }

  // CLAUDE_MEM_ALLOWED_PROJECTS accepts any string (no validation needed)
  // It's interpreted as comma-separated paths at runtime

  return { valid: true };
}

describe('Settings Validation', () => {
  describe('CLAUDE_MEM_COLLECTION_ENABLED', () => {
    it('should accept "true" as valid', () => {
      const result = validateSettings({ CLAUDE_MEM_COLLECTION_ENABLED: 'true' });
      expect(result.valid).toBe(true);
    });

    it('should accept "false" as valid', () => {
      const result = validateSettings({ CLAUDE_MEM_COLLECTION_ENABLED: 'false' });
      expect(result.valid).toBe(true);
    });

    it('should reject invalid boolean strings', () => {
      const result = validateSettings({ CLAUDE_MEM_COLLECTION_ENABLED: 'yes' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('CLAUDE_MEM_COLLECTION_ENABLED');
    });

    it('should reject numeric values', () => {
      const result = validateSettings({ CLAUDE_MEM_COLLECTION_ENABLED: '1' });
      expect(result.valid).toBe(false);
    });

    it('should accept undefined (not provided)', () => {
      const result = validateSettings({});
      expect(result.valid).toBe(true);
    });
  });

  describe('CLAUDE_MEM_ALLOWED_PROJECTS', () => {
    it('should accept empty string', () => {
      const result = validateSettings({ CLAUDE_MEM_ALLOWED_PROJECTS: '' });
      expect(result.valid).toBe(true);
    });

    it('should accept single path', () => {
      const result = validateSettings({
        CLAUDE_MEM_ALLOWED_PROJECTS: '/Users/miles/CodingMac/claude-mem'
      });
      expect(result.valid).toBe(true);
    });

    it('should accept comma-separated paths', () => {
      const result = validateSettings({
        CLAUDE_MEM_ALLOWED_PROJECTS: '/path/a,/path/b,/path/c'
      });
      expect(result.valid).toBe(true);
    });

    it('should accept paths with spaces', () => {
      const result = validateSettings({
        CLAUDE_MEM_ALLOWED_PROJECTS: '/path/to/my project,/another path'
      });
      expect(result.valid).toBe(true);
    });

    it('should accept undefined (not provided)', () => {
      const result = validateSettings({});
      expect(result.valid).toBe(true);
    });
  });

  describe('Combined settings', () => {
    it('should validate both settings together', () => {
      const result = validateSettings({
        CLAUDE_MEM_COLLECTION_ENABLED: 'true',
        CLAUDE_MEM_ALLOWED_PROJECTS: '/path/to/project'
      });
      expect(result.valid).toBe(true);
    });

    it('should reject if COLLECTION_ENABLED is invalid even if ALLOWED_PROJECTS is valid', () => {
      const result = validateSettings({
        CLAUDE_MEM_COLLECTION_ENABLED: 'invalid',
        CLAUDE_MEM_ALLOWED_PROJECTS: '/path/to/project'
      });
      expect(result.valid).toBe(false);
    });
  });
});
