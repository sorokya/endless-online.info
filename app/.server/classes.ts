import fs from 'node:fs/promises';
import { z } from 'zod';

const ClassSchema = z.object({
  id: z.number(),
  name: z.string(),
  base: z.number(),
  class_type: z.number(),
  classpicker_equip_1: z.number(),
  classpicker_equip_2: z.number(),
  classpicker_equip_3: z.number(),
  classpicker_equip_4: z.number(),
  classpicker_equip_5: z.number(),
  power: z.number(),
  accuracy: z.number(),
  defense: z.number(),
  dexterity: z.number(),
  vitality: z.number(),
  aura: z.number(),
});

const ClassArraySchema = z.array(ClassSchema);

type Class = z.infer<typeof ClassSchema>;

type ClassListEntry = {
  id: number;
  name: string;
};

async function getClasses(): Promise<Class[]> {
  const json = await fs.readFile('data/classes.json', 'utf8');
  const object = JSON.parse(json);
  return ClassArraySchema.parse(object);
}

export async function getClassList(): Promise<ClassListEntry[]> {
  const classes = await getClasses();
  return classes.map((i) => ({
    id: i.id,
    name: i.name,
  }));
}

export async function getClassById(id: number): Promise<Class | undefined> {
  const classes = await getClasses();
  return classes.find((i) => i.id === id);
}
