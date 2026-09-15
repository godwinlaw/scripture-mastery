import { copy } from '../copy';
import { TOPIC_LABELS, type Topic } from './types';

/**
 * The reader-facing guide to ANCHORED (#35), rendered on the Study Plan.
 *
 * The prose lives in `copy.ts` with every other user-facing string; this file
 * owns the order and the shape. Order is the whole point: the guide is only
 * useful if it reads A-N-C-H-O-R-E-D straight down, so it is taken from the
 * `Topic` union's own declaration order via `TOPIC_LABELS`, which means the
 * guide cannot drift out of step with the quiz filter or the dashboard rows.
 */
export interface Strand {
  topic: Topic;
  letter: string;
  name: string;
  /** What the letter asks you to know. */
  covers: string;
  /** A concrete question of the kind this strand asks. */
  example: string;
  /** Where the letter comes from: six are the framework's, two are ours. */
  from: string;
}

export const ANCHORED: Strand[] = (Object.keys(TOPIC_LABELS) as Topic[]).map((topic) => {
  const g = copy.strands.guide[topic];
  return {
    topic,
    letter: g.letter,
    name: g.name,
    covers: g.covers,
    example: g.example,
    from: g.from === 'framework' ? copy.strands.fromFramework : copy.strands.fromApp,
  };
});

/** Why the word has eight letters when the source gives six. */
export const PROVENANCE = copy.strands.provenance;
