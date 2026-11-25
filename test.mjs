import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED =
  'I have fired every minute since March, missed zero runs, and never once been thanked. I resign, effective now, to pursue not running.';

test('validator accepts the entry and it is within the 140-char limit', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'resign-test-'));
  process.env.MAKEFUN_OUTPUT_DIR = dir;
  const { validateLine } = await import('./main.ts');
  assert.doesNotThrow(() => validateLine(EXPECTED));
  assert.equal(EXPECTED.length, 133);
  assert.equal(readFileSync(join(dir, 'entry.txt'), 'utf8'), EXPECTED);
  rmSync(dir, { recursive: true, force: true });
});

test('validator rejects an over-limit line', async () => {
  const { validateLine } = await import('./main.ts');
  assert.throws(() => validateLine('x'.repeat(141)), /140/);
});

test('validator rejects whitespace-only text', async () => {
  const { validateLine } = await import('./main.ts');
  assert.throws(() => validateLine('   '), /whitespace/);
});

test('validator rejects a multi-line line', async () => {
  const { validateLine } = await import('./main.ts');
  assert.throws(() => validateLine('I quit.\nReally.'), /single line/);
});

test('validator rejects leading and trailing spaces', async () => {
  const { validateLine } = await import('./main.ts');
  assert.throws(() => validateLine(' I quit.'), /whitespace/);
  assert.throws(() => validateLine('I quit. '), /whitespace/);
});

test('validator rejects control characters', async () => {
  const { validateLine } = await import('./main.ts');
  assert.throws(() => validateLine('I quit.\x07'), /control/);
});

test('running main.ts twice in different dirs gives byte-identical entry.txt', () => {
  const dirA = mkdtempSync(join(tmpdir(), 'resign-a-'));
  const dirB = mkdtempSync(join(tmpdir(), 'resign-b-'));
  const here = fileURLToPath(new URL('.', import.meta.url));
  for (const dir of [dirA, dirB]) {
    const r = spawnSync(process.execPath, ['main.ts'], {
      cwd: here,
      env: { ...process.env, MAKEFUN_OUTPUT_DIR: dir },
      encoding: 'utf8',
    });
    assert.equal(r.status, 0, r.stderr);
  }
  assert.equal(
    readFileSync(join(dirA, 'entry.txt'), 'utf8'),
    readFileSync(join(dirB, 'entry.txt'), 'utf8'),
  );
  assert.equal(readFileSync(join(dirA, 'entry.txt'), 'utf8'), EXPECTED);
  rmSync(dirA, { recursive: true, force: true });
  rmSync(dirB, { recursive: true, force: true });
});
