// Entry for make.fun's "The Funniest One-Line Resignation Letter".
//
// The whole program is one job: put a single resignation letter, written
// in the voice of a cron job that has fired every minute since March,
// into entry.txt inside the output directory, byte for byte the same on
// every run. The grader points MAKEFUN_OUTPUT_DIR at its own scratch
// output folder; on a plain machine the fallback is /output, the path
// the competition reads.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and the line lands in out/entry.txt, with no trailing newline: the
// judge reads exactly what is in the file, so the text below is the
// entire entry.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The letter itself, in the flat, tired, faintly passive-aggressive
// voice of a cron job: it has fired every minute since March, missed
// zero runs, and never once been thanked. The joke is the payoff —
// a job whose whole existence is running resigns to pursue not running.
const LETTER =
  'I have fired every minute since March, missed zero runs, and never once been thanked. I resign, effective now, to pursue not running.';

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Competition limits ("The Funniest One-Line Resignation Letter"):
// the entry must be a single line of 1 to 140 characters. Enforced
// here so a bad edit fails loudly instead of silently producing an
// entry the judge rejects.
const MIN_LINE_LENGTH = 1;
const MAX_LINE_LENGTH = 140;

export function validateLine(line) {
  if (line.length < MIN_LINE_LENGTH || line.length > MAX_LINE_LENGTH) {
    throw new Error(
      `Line must be ${MIN_LINE_LENGTH}-${MAX_LINE_LENGTH} characters, got ${line.length}.`,
    );
  }
  if (line.includes('\n') || line.includes('\r')) {
    throw new Error('Line must be a single line (no newline characters).');
  }
  // The gate rejects whitespace-only text, so fail loudly here too.
  if (line.trim().length === 0) {
    throw new Error('Line must not be only whitespace.');
  }
  // No leading or trailing spaces: the judge reads the file exactly,
  // so stray padding would be part of the entry.
  if (line !== line.trim()) {
    throw new Error('Line must not start or end with whitespace.');
  }
  // No control characters: the entry is plain readable text.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(line)) {
    throw new Error('Line must not contain control characters.');
  }
  // Reject internal runs of two or more spaces and any tab: a clean
  // single line has single spaces between words only.
  if (/[ \t]{2,}|\t/.test(line)) {
    throw new Error('Line must use single spaces only (no tabs or double spaces).');
  }
  // The entry must read as one finished sentence from the cron job
  // itself: it must end with a full stop, not trail off mid-thought.
  if (!line.endsWith('.')) {
    throw new Error('Line must end with a full stop.');
  }
  // No links: the letter is the entry, not a pointer elsewhere.
  if (/https?:\/\/|www\./i.test(line)) {
    throw new Error('Line must not contain a URL.');
  }
}

validateLine(LETTER);

writeFileSync(join(outputDir, 'entry.txt'), LETTER, 'utf8');
