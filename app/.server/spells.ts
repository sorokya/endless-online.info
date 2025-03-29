import fs from 'node:fs/promises';
import { z } from 'zod';

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
  icon_url: z.string().url(),
  graphic_url: z.string().url(),
});

const SpellArraySchema = z.array(SpellSchema);

type Spell = z.infer<typeof SpellSchema>;

type SpellListEntry = {
  id: number;
  name: string;
};

async function getSpells(): Promise<Spell[]> {
  const json = await fs.readFile('data/spells.json', 'utf8');
  const object = JSON.parse(json);
  return SpellArraySchema.parse(object);
}

export async function getSpellList(): Promise<SpellListEntry[]> {
  const spells = await getSpells();
  return spells.map((i) => ({
    id: i.id,
    name: i.name,
  }));
}

export async function getSpellById(id: number): Promise<Spell | undefined> {
  const spells = await getSpells();
  return spells.find((i) => i.id === id);
}
