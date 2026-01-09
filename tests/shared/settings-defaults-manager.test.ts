import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { SettingsDefaultsManager } from '../../src/shared/SettingsDefaultsManager';

describe('SettingsDefaultsManager', () => {
  let testDir: string;
  let testSettingsPath: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `claude-mem-test-${Date.now()}`);
    mkdirSync(testDir, { recursive: true });
    testSettingsPath = join(testDir, 'settings.json');
  });

  afterEach(() => {
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getAllDefaults', () => {
    it('should return complete SettingsDefaults object', () => {
      const defaults = SettingsDefaultsManager.getAllDefaults();

      expect(defaults).toBeDefined();
      expect(typeof defaults).toBe('object');
    });

    it('should include collection control settings', () => {
      const defaults = SettingsDefaultsManager.getAllDefaults();

      expect(defaults.CLAUDE_MEM_COLLECTION_ENABLED).toBe('true');
      expect(defaults.CLAUDE_MEM_ALLOWED_PROJECTS).toBe('');
    });
  });

  describe('get', () => {
    it('should return default value for CLAUDE_MEM_COLLECTION_ENABLED', () => {
      const value = SettingsDefaultsManager.get('CLAUDE_MEM_COLLECTION_ENABLED');
      expect(value).toBe('true');
    });

    it('should return default value for CLAUDE_MEM_ALLOWED_PROJECTS', () => {
      const value = SettingsDefaultsManager.get('CLAUDE_MEM_ALLOWED_PROJECTS');
      expect(value).toBe('');
    });

    it('should return default worker port', () => {
      const value = SettingsDefaultsManager.get('CLAUDE_MEM_WORKER_PORT');
      expect(value).toBe('37777');
    });
  });

  describe('getInt', () => {
    it('should parse integer correctly', () => {
      const port = SettingsDefaultsManager.getInt('CLAUDE_MEM_WORKER_PORT');
      expect(port).toBe(37777);
      expect(typeof port).toBe('number');
    });
  });

  describe('getBool', () => {
    it('should return true for CLAUDE_MEM_COLLECTION_ENABLED default', () => {
      const enabled = SettingsDefaultsManager.getBool('CLAUDE_MEM_COLLECTION_ENABLED');
      expect(enabled).toBe(true);
    });
  });

  describe('loadFromFile', () => {
    it('should return defaults when file is missing', () => {
      const settings = SettingsDefaultsManager.loadFromFile('/nonexistent/path/settings.json');

      expect(settings.CLAUDE_MEM_COLLECTION_ENABLED).toBe('true');
      expect(settings.CLAUDE_MEM_ALLOWED_PROJECTS).toBe('');
    });

    it('should merge file settings with defaults', () => {
      writeFileSync(testSettingsPath, JSON.stringify({
        CLAUDE_MEM_WORKER_PORT: '38888',
        CLAUDE_MEM_COLLECTION_ENABLED: 'false'
      }));

      const settings = SettingsDefaultsManager.loadFromFile(testSettingsPath);

      expect(settings.CLAUDE_MEM_WORKER_PORT).toBe('38888');
      expect(settings.CLAUDE_MEM_COLLECTION_ENABLED).toBe('false');
      // Should have default for unset keys
      expect(settings.CLAUDE_MEM_ALLOWED_PROJECTS).toBe('');
    });

    it('should handle new collection settings from file', () => {
      writeFileSync(testSettingsPath, JSON.stringify({
        CLAUDE_MEM_COLLECTION_ENABLED: 'false',
        CLAUDE_MEM_ALLOWED_PROJECTS: '/path/to/project1,/path/to/project2'
      }));

      const settings = SettingsDefaultsManager.loadFromFile(testSettingsPath);

      expect(settings.CLAUDE_MEM_COLLECTION_ENABLED).toBe('false');
      expect(settings.CLAUDE_MEM_ALLOWED_PROJECTS).toBe('/path/to/project1,/path/to/project2');
    });

    it('should handle corrupted JSON gracefully', () => {
      writeFileSync(testSettingsPath, 'not valid json {{{');

      const settings = SettingsDefaultsManager.loadFromFile(testSettingsPath);

      // Should return defaults on parse error
      expect(settings.CLAUDE_MEM_COLLECTION_ENABLED).toBe('true');
    });

    it('should handle backward compatibility (files without new settings)', () => {
      // Old settings file without collection controls
      writeFileSync(testSettingsPath, JSON.stringify({
        CLAUDE_MEM_WORKER_PORT: '37777',
        CLAUDE_MEM_MODEL: 'claude-sonnet-4-5'
      }));

      const settings = SettingsDefaultsManager.loadFromFile(testSettingsPath);

      // Should have defaults for new collection settings
      expect(settings.CLAUDE_MEM_COLLECTION_ENABLED).toBe('true');
      expect(settings.CLAUDE_MEM_ALLOWED_PROJECTS).toBe('');
      // Should preserve existing settings
      expect(settings.CLAUDE_MEM_MODEL).toBe('claude-sonnet-4-5');
    });
  });
});
