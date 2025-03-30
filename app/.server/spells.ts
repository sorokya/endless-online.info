import fs from 'node:fs/promises';
import { z } from 'zod';
import { CONFIG } from '~/config';

const SpellSchema = z.object({
  id: z.number(),
  name: z.string(),
  shout: z.string(),
  icon: z.number(),
  graphic: z.number(),
  tp_cost: z.number(),
  sp_cost: z.number(),
  cast_time: z.number(),
  spell_type: z.number(),
  element: z.number(),
  element_power: z.number(),
  target_restrict: z.number(),
  target_type: z.number(),
  min_damage: z.number(),
  max_damage: z.number(),
  accuracy: z.number(),
  hp: z.number(),
});

const SpellArraySchema = z.array(SpellSchema);

type Spell = z.infer<typeof SpellSchema>;

type SpellListEntry = {
  id: number;
  name: string;
};

let SPELLS: Spell[] | null = null;
async function getSpells(): Promise<Spell[]> {
  if (!SPELLS) {
    const json = await fs.readFile('data/spells.json', 'utf8');
    const object = JSON.parse(json);
    SPELLS = SpellArraySchema.parse(object);
  }

  return SPELLS;
}

export function reset() {
  SPELLS = null;
}

type SpellListResult = {
  count: number;
  records: SpellListEntry[];
};

export async function getSpellList(search: {
  name: string;
  page: string;
}): Promise<SpellListResult> {
  const spells = await getSpells();
  const filtered = spells
    .filter((s) => {
      return (
        !search.name ||
        s.name.toLowerCase().indexOf(search.name.toLowerCase()) > -1
      );
    })
    .map((i) => ({
      id: i.id,
      name: i.name,
    }));

  const page = Number.parseInt(search.page, 10);
  if (Number.isNaN(page)) {
    throw new Error(`Invalid page: ${search.page}`);
  }

  const start = CONFIG.PAGE_SIZE * (page - 1);
  const end = start + CONFIG.PAGE_SIZE;

  return {
    count: filtered.length,
    records: filtered.slice(start, end),
  };
}

export async function getSpellById(id: number): Promise<Spell | undefined> {
  const spells = await getSpells();
  return spells.find((i) => i.id === id);
}
