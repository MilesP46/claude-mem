/**
 * Save Hook - PostToolUse
 *
 * Pure HTTP client - sends data to worker, worker handles all database operations
 * including privacy checks. This allows the hook to run under any runtime
 * (Node.js or Bun) since it has no native module dependencies.
 */

import { stdin } from 'process';
import path from 'path';
import { STANDARD_HOOK_RESPONSE } from './hook-response.js';
import { logger } from '../utils/logger.js';
import { ensureWorkerRunning, getWorkerPort } from '../shared/worker-utils.js';
import { HOOK_TIMEOUTS } from '../shared/hook-constants.js';
import { SettingsDefaultsManager } from '../shared/SettingsDefaultsManager.js';

/**
 * Check if the current working directory is in the allowed projects list
 */
function isProjectAllowed(cwd: string, allowedProjects: string): boolean {
  if (!allowedProjects) return true; // Empty = all projects allowed
  // Normalize and remove trailing slashes for consistent comparison
  const normalized = path.normalize(cwd).replace(/\/+$/, '');
  const allowed = allowedProjects.split(',').map(p => path.normalize(p.trim()).replace(/\/+$/, ''));
  return allowed.some(p => normalized.startsWith(p));
}

export interface PostToolUseInput {
  session_id: string;
  cwd: string;
  tool_name: string;
  tool_input: any;
  tool_response: any;
}

/**
 * Save Hook Main Logic - Fire-and-forget HTTP client
 */
async function saveHook(input?: PostToolUseInput): Promise<void> {
  // Validate input first (before any async operations)
  if (!input) {
    throw new Error('saveHook requires input');
  }

  const { session_id, cwd, tool_name, tool_input, tool_response } = input;

  // Validate required fields early
  if (!cwd) {
    throw new Error(`Missing cwd in PostToolUse hook input for session ${session_id}, tool ${tool_name}`);
  }

  // Check collection settings BEFORE waiting for worker (avoids 15s worker startup wait)
  const settingsPath = path.join(
    SettingsDefaultsManager.get('CLAUDE_MEM_DATA_DIR'),
    'settings.json'
  );
  const settings = SettingsDefaultsManager.loadFromFile(settingsPath);

  // Step 1: Check global toggle
  if (settings.CLAUDE_MEM_COLLECTION_ENABLED !== 'true') {
    console.log(STANDARD_HOOK_RESPONSE);
    return;
  }

  // Step 2: Check project allowlist
  if (!isProjectAllowed(cwd, settings.CLAUDE_MEM_ALLOWED_PROJECTS)) {
    console.log(STANDARD_HOOK_RESPONSE);
    return;
  }

  // Now safe to wait for worker
  await ensureWorkerRunning();

  const port = getWorkerPort();

  const toolStr = logger.formatTool(tool_name, tool_input);

  logger.dataIn('HOOK', `PostToolUse: ${toolStr}`, {
    workerPort: port
  });

  // Send to worker - worker handles privacy check and database operations
  const response = await fetch(`http://127.0.0.1:${port}/api/sessions/observations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contentSessionId: session_id,
      tool_name,
      tool_input,
      tool_response,
      cwd
    })
    // Note: Removed signal to avoid Windows Bun cleanup issue (libuv assertion)
  });

  if (!response.ok) {
    throw new Error(`Observation storage failed: ${response.status}`);
  }

  logger.debug('HOOK', 'Observation sent successfully', { toolName: tool_name });

  console.log(STANDARD_HOOK_RESPONSE);
}

// Entry Point
let input = '';
stdin.on('data', (chunk) => input += chunk);
stdin.on('end', async () => {
  try {
    let parsed: PostToolUseInput | undefined;
    try {
      parsed = input ? JSON.parse(input) : undefined;
    } catch (error) {
      throw new Error(`Failed to parse hook input: ${error instanceof Error ? error.message : String(error)}`);
    }
    await saveHook(parsed);
  } catch (error) {
    logger.error('HOOK', 'save-hook failed', {}, error as Error);
  } finally {
    process.exit(0);
  }
});
