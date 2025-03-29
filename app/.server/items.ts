import fs from 'node:fs/promises';
import { z } from 'zod';
import { CONFIG } from '~/config';
import { MapTileSpec } from './map-tile-spec';
import { getMaps } from './maps';
import { getNpcById, getNpcByName, getNpcByQuestBehaviorId } from './npcs';
import { getQuestByName } from './quests';
import { getShopByName } from './shops';

const DropSchema = z.object({
  npc_id: z.number(),
  drop_percent: z.number(),
  npc_url: z.string().url(),
});

const SharedSchema = z.object({
  npc_id: z.number(),
  drop_percent: z.number(),
});

const CraftIngredientSchema = z.object({
  itemID: z.number(),
  quantity: z.number(),
  item_url: z.string().url(),
});

const CraftableSchema = z.object({
  shopName: z.string(),
  craftEon: z.number(),
  craftGold: z.number(),
  craftIngredients: z.array(CraftIngredientSchema),
});

const SoldBySchema = z.object({
  soldByName: z.string(),
});

const QuestRewardSchema = z.object({
  questName: z.string(),
});

const ItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  graphic: z.number(),
  item_type: z.number(),
  item_sub_type: z.number(),
  item_unique: z.number(),
  hp: z.number(),
  tp: z.number(),
  sp: z.number(),
  min_damage: z.number(),
  max_damage: z.number(),
  hit_rate: z.number(),
  evasion: z.number(),
  armor: z.number(),
  critical_chance: z.number(),
  power: z.number(),
  accuracy: z.number(),
  defense: z.number(),
  dexterity: z.number(),
  vitality: z.number(),
  aura: z.number(),
  light: z.number(),
  dark: z.number(),
  earth: z.number(),
  air: z.number(),
  water: z.number(),
  fire: z.number(),
  spec1: z.number(),
  spec2: z.number(),
  spec3: z.number(),
  required_level: z.number(),
  required_class: z.number(),
  required_power: z.number(),
  required_accuracy: z.number(),
  required_dexterity: z.number(),
  required_defense: z.number(),
  required_vitality: z.number(),
  required_aura: z.number(),
  weight: z.number(),
  range: z.number(),
  aoe_flag: z.number(),
  size: z.number(),
  sell_price: z.number(),
  drops: z.array(DropSchema).optional(),
  shared: z.array(SharedSchema).optional(),
  craftables: z.array(CraftableSchema).optional(),
  ingredientFor: z.array(z.number()).optional(),
  soldBy: z.array(SoldBySchema).optional(),
  questRewards: z.array(QuestRewardSchema).optional(),
  gatherableMaps: z.boolean().optional(),
  gatherableSpots: z.boolean().optional(),
  chestSpawnChests: z.boolean().optional(),
  graphic_url: z.string().url(),
});

const ItemArraySchema = z.array(ItemSchema);

type Item = z.infer<typeof ItemSchema>;

type ItemListEntry = {
  id: number;
  name: string;
};

let ITEMS: Item[] | null = null;
export async function getItems(): Promise<Item[]> {
  if (!ITEMS) {
    const json = await fs.readFile('data/items.json', 'utf8');
    const object = JSON.parse(json);
    ITEMS = ItemArraySchema.parse(object).filter(
      (i) => !i.name.endsWith('-res'),
    );
  }

  return ITEMS;
}

export function reset() {
  ITEMS = null;
}

type ItemListResult = {
  count: number;
  records: ItemListEntry[];
};

export async function getItemList(search: {
  name: string;
  type: string;
  page: string;
}): Promise<ItemListResult> {
  const items = await getItems();
  const filtered = items
    .filter((i) => {
      return (
        (!search.name ||
          i.name.toLowerCase().indexOf(search.name.toLowerCase()) > -1) &&
        (search.type === 'all' ||
          i.item_type === Number.parseInt(search.type, 10))
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

export async function getItemById(id: number): Promise<Item | undefined> {
  const items = await getItems();
  return items.find((i) => i.id === id);
}

type ItemDrop = {
  npc_id: number;
  npc_name: string;
  percent: number;
};

export async function getItemDrops(id: number): Promise<ItemDrop[]> {
  const item = await getItemById(id);
  if (!item || !item.drops) {
    return [];
  }

  const drops = await Promise.all(
    item.drops.map(async (drop) => {
      const npc = await getNpcById(drop.npc_id);
      if (!npc) {
        return undefined;
      }

      return {
        npc_id: npc.id,
        npc_name: npc.name,
        percent: drop.drop_percent,
      };
    }),
  );

  const shared = item.shared || [];
  const sharedDrops = await Promise.all(
    shared.map(async (share) => {
      const npc = await getNpcById(share.npc_id);
      if (!npc) {
        return undefined;
      }

      return {
        npc_id: npc.id,
        npc_name: npc.name,
        percent: share.drop_percent,
      };
    }),
  );

  return drops.concat(sharedDrops).filter((drop) => !!drop);
}

export async function getItemIngredientFor(
  id: number,
): Promise<ItemListEntry[]> {
  const item = await getItemById(id);
  if (!item || !item.ingredientFor) {
    return [];
  }

  const items = await Promise.all(
    item?.ingredientFor.map(async (i) => {
      const item = await getItemById(i);
      if (!item) {
        return undefined;
      }

      return {
        id: item.id,
        name: item.name,
      };
    }),
  );

  return items.filter((i) => !!i);
}

type CraftableIngredient = {
  item_id: number;
  item_name: string;
  quantity: number;
};

type CraftableNpc = {
  name: string;
  id: number;
  map_id: number;
  map_name: string;
  x: number;
  y: number;
};

type Craftable = {
  shopName: string;
  npcs: CraftableNpc[];
  eons: number;
  gold: number;
  ingredients: CraftableIngredient[];
};

export async function getItemCraftables(id: number): Promise<Craftable[]> {
  const item = await getItemById(id);
  if (!item || !item.craftables) {
    return [];
  }

  return Promise.all(
    item.craftables.map(async (c) => {
      const ingredients = await Promise.all(
        c.craftIngredients.map(async (i) => {
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

      const shop = await getShopByName(c.shopName);
      if (!shop) {
        throw new Error(`Shop not found: ${c.shopName}`);
      }

      const npcs = await Promise.all(
        shop.npcs.map(async (n) => {
          const npc = await getNpcByName(n.npc_name);
          if (!npc) {
            return undefined;
          }

          return {
            name: npc.name,
            id: npc.id,
            map_id: n.map_id,
            map_name: n.map_name,
            x: n.x,
            y: n.y,
          };
        }),
      );

      return {
        shopName: c.shopName,
        npcs: npcs.filter((n) => !!n),
        eons: c.craftEon,
        gold: c.craftGold,
        ingredients: ingredients.filter((i) => !!i),
      };
    }),
  );
}

type Reward = {
  quest_id: number;
  quest_name: string;
  npc_id: number;
  amount: number;
};

export async function getItemRewards(id: number): Promise<Reward[]> {
  const item = await getItemById(id);
  if (!item || !item.questRewards) {
    return [];
  }

  const rewards = await Promise.all(
    item.questRewards.map(async (r) => {
      const quest = await getQuestByName(r.questName);
      if (!quest) {
        return undefined;
      }

      const questRewards = quest.item_rewards_1.concat(quest.item_rewards_2);
      const reward = questRewards.find((r) => r.item_id === id);
      if (!reward) {
        return undefined;
      }

      const npc = await getNpcByQuestBehaviorId(quest.start_npcs[0]);
      if (!npc) {
        return undefined;
      }

      return {
        quest_id: quest.id,
        quest_name: r.questName,
        npc_id: npc.id,
        amount: reward.amount,
      };
    }),
  );

  return rewards.filter((r) => !!r);
}

type GatherSpot = {
  item_id: number;
  map_id: number;
  map_name: string;
  x: number;
  y: number;
  amount: number;
  graphic_id: number;
};

export async function getItemGatherSpots(id: number): Promise<GatherSpot[]> {
  const maps = await getMaps();

  return maps
    .filter((m) => {
      return m.map_gathers?.some((g) => g.item_id === id);
    })
    .flatMap((m) =>
      m.map_gathers?.map((g) => ({
        item_id: g.item_id,
        map_id: m.id,
        map_name: m.name,
        x: g.x,
        y: g.y,
        amount: g.max_amount,
        graphic_id: g.graphic_id + 100,
      })),
    )
    .filter((m) => !!m)
    .filter((m) => m.item_id === id);
}

type ChestSpawn = {
  item_id: number;
  map_id: number;
  map_name: string;
  x: number;
  y: number;
  amount: number;
  slot: number;
  time: number;
  graphic_id: number | undefined;
};

export async function getItemChestSpawns(id: number): Promise<ChestSpawn[]> {
  const maps = await getMaps();

  const getObjectGraphicAt = (mapId: number, x: number, y: number) => {
    const map = maps.find((m) => m.id === mapId);
    if (!map) {
      return undefined;
    }

    const objectLayer = map.map_layers.find((l) => l.details.name === 'Object');
    if (!objectLayer?.tiles) {
      return undefined;
    }

    const tile = objectLayer.tiles.find((t) => t.x === x && t.y === y);
    if (!tile) {
      return undefined;
    }

    return tile.tile;
  };

  const mapHasChestSpecAt = (mapId: number, x: number, y: number) => {
    const map = maps.find((m) => m.id === mapId);
    if (!map) {
      return undefined;
    }

    const tile = map.spec_tiles.find((t) => t.x === x && t.y === y);
    if (!tile) {
      return undefined;
    }

    return tile.spec === MapTileSpec.Chest;
  };

  return maps
    .filter((m) => {
      return m.items.some((i) => i.item_id === id);
    })
    .flatMap((m) =>
      m.items.map((i) => ({
        item_id: i.item_id,
        map_id: m.id,
        map_name: m.name,
        x: i.x,
        y: i.y,
        amount: i.amount,
        slot: i.slot,
        time: i.time,
        key: i.key,
        graphic_id: getObjectGraphicAt(m.id, i.x, i.y),
      })),
    )
    .filter((m) => m.item_id === id && mapHasChestSpecAt(m.map_id, m.x, m.y));
}
