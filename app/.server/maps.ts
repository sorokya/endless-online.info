import fs from 'node:fs/promises';
import { z } from 'zod';

const Npc = z.object({
  x: z.number(),
  y: z.number(),
  id: z.number(),
  interaction_id: z.number(),
  boundary_x: z.number(),
  boundary_y: z.number(),
  courage: z.number(),
  speed: z.number(),
  time: z.number(),
  amount: z.number(),
});

const Item = z.object({
  x: z.number(),
  y: z.number(),
  key: z.number(),
  slot: z.number(),
  item_id: z.number(),
  time: z.number(),
  amount: z.number(),
});

const Gather = z.object({
  x: z.number(),
  y: z.number(),
  type: z.number(),
  hit_count: z.number(),
  item_id: z.number(),
  max_amount: z.number(),
  graphic_id: z.number(),
});

const WarpTile = z.object({
  x: z.number(),
  y: z.number(),
  destination_id: z.number(),
  destination_x: z.number(),
  destination_y: z.number(),
});

const MapSchema = z.object({
  id: z.number(),
  rid1: z.number(),
  rid2: z.number(),
  version: z.number(),
  subversion: z.number(),
  width: z.number(),
  height: z.number(),
  name: z.string(),
  wayfarer_id: z.number(),
  wayfarer_x: z.number(),
  wayfarer_y: z.number(),
  npcs: z.array(Npc),
  items: z.array(Item),
  map_gathers: z.array(Gather).optional(),
  warp_tiles: z.array(WarpTile),
});

const MapArraySchema = z.array(MapSchema);

export type Map = z.infer<typeof MapSchema>;

type MapListEntry = {
  id: number;
  name: string;
};

export async function getMaps(): Promise<Map[]> {
  const json = await fs.readFile('data/maps.json', 'utf8');
  const object = JSON.parse(json);
  return MapArraySchema.parse(object);
}

export async function getMapList(): Promise<MapListEntry[]> {
  const maps = await getMaps();
  return maps.map((i) => ({
    id: i.id,
    name: i.name,
  }));
}

export async function getMapById(id: number): Promise<Map | undefined> {
  const maps = await getMaps();
  return maps.find((i) => i.id === id);
}
