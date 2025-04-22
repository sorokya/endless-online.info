import fs from 'node:fs/promises';
import { z } from 'zod';
import { CONFIG } from '~/config';

const ClassSchema = z.object({
  id: z.number(),
  name: z.string(),
  base: z.number(),
  class_group: z.number(),
  preview_weap_item_id: z.number(),
  preview_shield_item_id: z.number(),
  preview_armor_male_item_id: z.number(),
  preview_armor_female_item_id: z.number(),
  preview_boots_item_id: z.number(),
  maximum_training_level: z.number(),
  maximum_knowledge_level: z.number(),
  base_power: z.number(),
  base_accuracy: z.number(),
  base_defense: z.number(),
  base_dexterity: z.number(),
  base_vitality: z.number(),
  base_aura: z.number(),
});

const ClassArraySchema = z.array(ClassSchema);

type Class = z.infer<typeof ClassSchema>;

type ClassListEntry = {
  id: number;
  name: string;
};

let CLASSES: Class[] | null = null;
async function getClasses(): Promise<Class[]> {
  if (!CLASSES) {
    const json = await fs.readFile('data/classes.json', 'utf8');
    const object = JSON.parse(json);
    CLASSES = ClassArraySchema.parse(object);
  }

  return CLASSES;
}

export function reset() {
  CLASSES = null;
}

type ClassListResult = {
  count: number;
  records: ClassListEntry[];
};

export async function getClassList(search: {
  name: string;
  page: string;
}): Promise<ClassListResult> {
  const classes = await getClasses();

  const filtered = classes
    .filter((i) => {
      return (
        !search.name ||
        i.name.toLowerCase().indexOf(search.name.toLowerCase()) > -1
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

export async function getClassById(id: number): Promise<Class | undefined> {
  const classes = await getClasses();
  return classes.find((i) => i.id === id);
}
