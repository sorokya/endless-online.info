import fs from 'node:fs/promises';
import { z } from 'zod';

const DropSchema = z.object({
  itemID: z.number(),
  drop_percent: z.number(),
  item_url: z.string().url(),
});

const NpcSchema = z.object({
  id: z.number(),
  name: z.string(),
  default_boundary: z.number(),
  graphic: z.number(),
  race: z.number(),
  boss: z.number(),
  child: z.number(),
  behavior: z.number(),
  vendor_id: z.number(),
  greeting_sfx_id: z.number(),
  agro_sfx_id: z.number(),
  idle_sfx_id: z.number(),
  attack_sfx_id: z.number(),
  walk_sfx_id: z.number(),
  alert_sfx_id: z.number(),
  death_sfx_id: z.number(),
  npc_respawn_secs: z.number(),
  npc_spawn_time: z.number(),
  npc_default_speed: z.number(),
  max_loaded_frames_flag: z.number(),
  max_loaded_frames: z.number(),
  alpha_normal_frames: z.number(),
  alpha_attack_frames: z.number(),
  move_flag: z.number(),
  move_blocked: z.number(),
  move_conveyor: z.number(),
  idle_aura: z.number(),
  role: z.number(),
  range: z.number(),
  hp: z.number(),
  tp: z.number(),
  min_damage: z.number(),
  max_damage: z.number(),
  accuracy: z.number(),
  evasion: z.number(),
  armor: z.number(),
  critical_chance: z.number(),
  level: z.number(),
  experience: z.number(),
  drops: z.array(DropSchema).optional(),
  spawnMaps: z.number().optional(),
  spawns: z.number().optional(),
  respawn: z.string().optional(),
});

const NpcArraySchema = z.array(NpcSchema);

type Npc = z.infer<typeof NpcSchema>;

type NpcListEntry = {
  id: number;
  name: string;
};

async function getNpcs(): Promise<Npc[]> {
  const json = await fs.readFile('data/npcs.json', 'utf8');
  const object = JSON.parse(json);
  return NpcArraySchema.parse(object);
}

export async function getNpcList(): Promise<NpcListEntry[]> {
  const npcs = await getNpcs();
  return npcs.map((i) => ({
    id: i.id,
    name: i.name,
  }));
}

export async function getNpcById(id: number): Promise<Npc | undefined> {
  const npcs = await getNpcs();
  return npcs.find((i) => i.id === id);
}

export async function getNpcByName(name: string): Promise<Npc | undefined> {
  const npcs = await getNpcs();
  return npcs.find((i) => i.name === name);
}

export async function getNpcByQuestBehaviorId(
  id: number,
): Promise<Npc | undefined> {
  const npcs = await getNpcs();
  return npcs.find((i) => i.behavior === 15 && i.vendor_id === id);
}
