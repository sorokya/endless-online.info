import fs from 'node:fs/promises';
import { z } from 'zod';
import { CONFIG } from '~/config';
import { getItemById } from './items';
import { getMaps } from './maps';
import { getShopByNpcName } from './shops';

const DropSchema = z.object({
  itemID: z.number(),
  drop_percent: z.number(),
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
  shared: z.array(DropSchema).optional(),
  spawnMaps: z.number().optional(),
  spawns: z.number().optional(),
  respawn: z.string().optional(),
});

const NpcArraySchema = z.array(NpcSchema);

export type Npc = z.infer<typeof NpcSchema>;

type NpcListEntry = {
  id: number;
  name: string;
};

let NPCS: Npc[] | null = null;
export async function getNpcs(): Promise<Npc[]> {
  if (!NPCS) {
    const json = await fs.readFile('data/npcs.json', 'utf8');
    const object = JSON.parse(json);
    NPCS = NpcArraySchema.parse(object);
  }

  return NPCS;
}

export function reset() {
  NPCS = null;
}

type NpcListResult = {
  count: number;
  records: NpcListEntry[];
};

export async function getNpcList(search: {
  name: string;
  type: string;
  page: string;
}): Promise<NpcListResult> {
  const npcs = await getNpcs();
  const filtered = npcs
    .filter((i) => {
      return (
        (!search.name ||
          i.name.toLowerCase().indexOf(search.name.toLowerCase()) > -1) &&
        (search.type === 'all' ||
          i.behavior === Number.parseInt(search.type, 10))
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

type NpcDrop = {
  id: number;
  name: string;
  percent: number;
};

export async function getNpcDrops(id: number): Promise<NpcDrop[]> {
  const npc = await getNpcById(id);
  if (!npc || !npc.drops) {
    return [];
  }

  const drops = await Promise.all(
    npc.drops.map(async (drop) => {
      const item = await getItemById(drop.itemID);
      if (!item) {
        return undefined;
      }

      return {
        id: item.id,
        name: item.name,
        percent: drop.drop_percent,
      };
    }),
  );

  const shared = npc.shared || [];
  const sharedDrops = await Promise.all(
    shared.map(async (share) => {
      const item = await getItemById(share.itemID);
      if (!item) {
        return undefined;
      }

      return {
        id: item.id,
        name: item.name,
        percent: share.drop_percent,
      };
    }),
  );

  return drops.concat(sharedDrops).filter((d) => !!d);
}

type NpcSpawn = {
  npc_id: number;
  map_id: number;
  map_name: string;
  x: number;
  y: number;
  amount: number;
  respawn: number;
  speed: number;
};

export async function getNpcSpawns(id: number): Promise<NpcSpawn[]> {
  const npc = await getNpcById(id);
  if (!npc) {
    return [];
  }

  const maps = await getMaps();
  return maps
    .filter((m) => {
      return m.npcs?.some((n) => n.id === id);
    })
    .flatMap((m) =>
      m.npcs?.map((n) => ({
        npc_id: n.id,
        map_id: m.id,
        map_name: m.name,
        x: n.x,
        y: n.y,
        amount: n.amount,
        respawn: n.time,
        speed: n.speed || npc.npc_default_speed,
      })),
    )
    .filter((m) => !!m)
    .filter((m) => m.npc_id === id);
}

type NpcSellItem = {
  item_id: number;
  item_name: string;
  price: number;
};

export async function getNpcBuyItems(id: number): Promise<NpcSellItem[]> {
  const npc = await getNpcById(id);
  if (!npc) {
    return [];
  }

  const shop = await getShopByNpcName(npc.name);
  if (!shop) {
    return [];
  }

  const buys = await Promise.all(
    shop.buys.map(async (b) => {
      const item = await getItemById(b.item_id);
      if (!item) {
        return undefined;
      }

      return {
        item_id: item.id,
        item_name: item.name,
        price: b.price,
      };
    }),
  );

  return buys.filter((b) => !!b);
}

type CraftableIngredient = {
  item_id: number;
  item_name: string;
  quantity: number;
};

type NpcCraft = {
  item_id: number;
  item_name: string;
  eons: number;
  gold: number;
  ingredients: CraftableIngredient[];
};

export async function getNpcCrafts(id: number): Promise<NpcCraft[]> {
  const npc = await getNpcById(id);
  if (!npc) {
    return [];
  }

  const shop = await getShopByNpcName(npc.name);
  if (!shop) {
    return [];
  }

  const crafts = await Promise.all(
    shop.crafts.map(async (c) => {
      const item = await getItemById(c.item_id);
      if (!item) {
        return undefined;
      }

      const craftable = item.craftables?.find((i) => i.shopName === shop.name);
      if (!craftable) {
        return undefined;
      }

      const ingredients = await Promise.all(
        craftable.craftIngredients.map(async (i) => {
          const item = await getItemById(i.itemID);
          if (!item) {
            return undefined;
          }

          return {
            item_id: item.id,
            item_name: item.name,
            quantity: i.quantity,
          };
        }),
      );

      return {
        item_id: item.id,
        item_name: item.name,
        eons: craftable.craftEon,
        gold: craftable.craftGold,
        ingredients: ingredients.filter((i) => !!i),
      };
    }),
  );

  return crafts.filter((c) => !!c);
}
