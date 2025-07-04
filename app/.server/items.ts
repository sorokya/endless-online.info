import fs from 'node:fs/promises';
import { z } from 'zod';
import { CONFIG } from '~/config';
import { ItemSubType } from './item-sub-type';
import { ItemType } from './item-type';
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
  pierce: z.number(),
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
  target_area: z.number().optional(),
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
  meta: string[];
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
  const filtered = await Promise.all(
    items
      .filter((i) => {
        return (
          (!search.name ||
            i.name.toLowerCase().indexOf(search.name.toLowerCase()) > -1) &&
          (search.type === 'all' ||
            i.item_type === Number.parseInt(search.type, 10))
        );
      })
      .map(async (i) => ({
        id: i.id,
        name: i.name,
        meta: await getItemMeta(i.id),
      })),
  );

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

export async function getItemMeta(id: number): Promise<string[]> {
  const item = await getItemById(id);
  if (!item) {
    return [];
  }

  const meta = [];

  const uniqueDiv20 = Math.floor(item.item_unique / 20);

  let itemType: string;
  if (item.item_type > 27) {
    switch (item.item_type) {
      case ItemType.General: {
        let line = 'general';
        switch (item.pierce) {
          case ItemSubType.Craft:
            line += ' craft';
            break;
          case ItemSubType.Quest:
            line += ' quest';
            break;
          case ItemSubType.Fillable:
            line += ' fillable';
            break;
          case ItemSubType.Deprecated:
            line += ' deprecated';
        }
        line += ' item';
        itemType = line;
        break;
      }
      case ItemType.Currency:
        itemType = 'currency';
        break;
      case ItemType.Potion:
        itemType = 'potion';
        if (item.hp) {
          itemType += ` + ${item.hp}hp`;
        }
        if (item.tp) {
          itemType += ` + ${item.tp}mp`;
        }
        break;
      case ItemType.Teleport:
        itemType = 'teleport';
        break;
      case ItemType.Transformation:
        itemType = 'transformation';
        break;
      case ItemType.ExpReward:
        itemType = 'exp reward';
        break;
      case ItemType.SkillBook:
        itemType = 'skill book';
        break;
      case ItemType.Reserved:
        itemType = 'reserved';
        break;
      case ItemType.Key:
        itemType = 'key';
        break;
      case ItemType.Title:
        if (item.spec1 === 1) {
          itemType = 'title';
        } else {
          itemType = 'announcement';
        }
        break;
      case ItemType.Beverage:
        itemType = 'beverage';
        break;
      case ItemType.Effect:
        itemType = 'effect';
        break;
      case ItemType.Hairdye:
        itemType = 'hairdye';
        break;
      case ItemType.Hairtool:
        itemType = 'hairtool';
        break;
      case ItemType.Cure:
        itemType = 'cure';
        break;
      case ItemType.VisualDocument:
        itemType = 'visual document';
        break;
      case ItemType.AudioDocument:
        itemType = 'audio document';
        break;
      case ItemType.TransportTicket:
        itemType = 'transport ticket';
        break;
      case ItemType.Fireworks:
        itemType = 'fireworks';
        break;
      case ItemType.Explosive:
        itemType = 'explosive';
        break;
      case ItemType.ReviveOther:
      case ItemType.ReviveSelf:
        itemType = 'medical supply';
        break;
      case ItemType.Buff:
        itemType = 'buff';
        break;
      case ItemType.Debuff:
        itemType = 'debuff';
        break;
      default:
        itemType = 'unknown';
    }
  } else {
    switch (item.item_type) {
      case ItemType.Currency:
        itemType = 'currency';
        break;
      case ItemType.Potion:
        itemType = 'potion';
        if (item.hp) {
          itemType += ` + ${item.hp}hp`;
        }
        if (item.tp) {
          itemType += ` + ${item.tp}mp`;
        }
        break;
      case ItemType.Teleport:
        itemType = 'teleport';
        break;
      case ItemType.Transformation:
        itemType = 'transformation';
        break;
      case ItemType.ExpReward:
        itemType = 'exp reward';
        break;
      case ItemType.SkillBook:
        itemType = 'skill book';
        break;
      case ItemType.Reserved:
        itemType = 'reserved';
        break;
      case ItemType.Key:
        itemType = 'key';
        break;
      default:
        if (uniqueDiv20 === 5) {
          itemType = 'cursed';
        } else {
          itemType = 'normal';
        }

        if (item.target_area) {
          itemType += ' target_aread';
        }

        if (
          item.item_type === ItemType.Clothing ||
          item.item_type === ItemType.Costume
        ) {
          if (item.spec2 === 1) {
            itemType += ' male';
          } else {
            itemType += ' female';
          }
        }

        switch (item.item_type) {
          case ItemType.Weapon:
            itemType += ' weapon';
            break;
          case ItemType.Shield:
            itemType += ' shield';
            break;
          case ItemType.Clothing:
            itemType += ' clothing';
            break;
          case ItemType.Hat:
            itemType += ' hat';
            break;
          case ItemType.Boots:
            itemType += ' boots';
            break;
          case ItemType.Gloves:
            itemType += ' gloves';
            break;
          case ItemType.Accessory:
            itemType += ' accessory';
            break;
          case ItemType.Belt:
            itemType += ' belt';
            break;
          case ItemType.Necklace:
            itemType += ' necklace';
            break;
          case ItemType.Ring:
            itemType += ' ring';
            break;
          case ItemType.Bracelet:
            itemType += ' bracelet';
            break;
          case ItemType.Bracer:
            itemType += ' bracer';
            break;
          case ItemType.Costume:
            itemType += ' costume';
            break;
          case ItemType.CostumeHat:
            itemType += ' coshat';
            break;
          case ItemType.Wings:
            itemType += ' wings';
            break;
          case ItemType.BuddyShoulder:
          case ItemType.BuddyGround:
            itemType += ' buddy';
            break;
          case ItemType.Torch:
            itemType += ' torch';
            break;
        }
    }
  }

  switch (uniqueDiv20) {
    case 1:
      itemType += ' (lore)';
      break;
    case 2:
      itemType += ' (bound)';
      break;
    case 3:
      itemType += ' (forever)';
      break;
    case 4:
      itemType += ' (volatile)';
      break;
  }

  if (uniqueDiv20 >= 6) {
    itemType += ' (expiring)';
  }

  meta.push(itemType);

  if (item.pierce === ItemSubType.Wedding) {
    meta.push('+wedding');
  }

  if (item.pierce === ItemSubType.Warmth) {
    meta.push('+warmth');
  }

  if (
    (item.item_type === ItemType.Shield ||
      item.item_type === ItemType.Weapon) &&
    item.pierce === ItemSubType.Playable
  ) {
    meta.push('+playable');
  }

  if (
    item.item_type === ItemType.Weapon &&
    item.pierce === ItemSubType.Mining
  ) {
    meta.push('+minerable mining');
  }

  if (
    item.item_type === ItemType.Weapon &&
    item.pierce === ItemSubType.Logging
  ) {
    meta.push('+wood logging');
  }

  if (
    item.item_type === ItemType.Weapon &&
    item.pierce === ItemSubType.Farming
  ) {
    meta.push('+farming');
  }

  if (
    item.item_type === ItemType.Weapon &&
    item.pierce === ItemSubType.Fishing
  ) {
    meta.push('+fishing');
  }

  if (
    item.item_type === ItemType.Weapon &&
    item.pierce === ItemSubType.Antidote
  ) {
    meta.push('+antidote');
  }

  if (
    item.item_type === ItemType.Weapon &&
    item.pierce === ItemSubType.Unboxing
  ) {
    meta.push('+unboxing');
  }

  if (item.pierce === ItemSubType.StealTheShow) {
    meta.push('.. steal the show');
  }

  if (item.item_type === ItemType.ReviveOther) {
    meta.push('revive other');
  }

  if (item.item_type === ItemType.ReviveSelf) {
    meta.push('revive self');
  }

  if (item.item_type >= 10 && item.item_type <= 27) {
    if (item.min_damage || item.max_damage) {
      let damage: string;
      if (item.aoe_flag) {
        damage = 'aoe: ';
      } else {
        damage = 'damage: ';
      }

      damage += `${item.min_damage} - ${item.max_damage}`;

      if (item.target_area) {
        damage += ` +${item.target_area}r`;
      }

      meta.push(damage);
    }

    if (item.hp || item.tp || item.sp) {
      let add = 'add+';
      if (item.hp) {
        add += ` ${item.hp}hp`;
      }

      if (item.tp) {
        add += ` ${item.tp}mp`;
      }

      if (item.sp) {
        add += ` ${item.sp}sp`;
      }
      meta.push(add);
    }

    if (item.defense || item.evasion || item.armor) {
      let def = 'def+';
      if (item.defense) {
        def += ` ${item.defense}def`;
      }

      if (item.evasion) {
        def += ` ${item.evasion}eva`;
      }

      if (item.armor) {
        def += ` ${item.armor}arm`;
      }
      meta.push(def);
    }

    if (item.critical_chance && item.hit_rate) {
      let plus = 'plus+';
      if (item.hit_rate) {
        plus += ` ${item.hit_rate}hit`;
      }

      if (item.critical_chance) {
        plus += ` ${item.critical_chance}crit`;
      }

      meta.push(plus);
    } else if (item.critical_chance) {
      meta.push(`crit+ ${item.critical_chance}`);
    }

    if (
      item.power ||
      item.accuracy ||
      item.dexterity ||
      item.defense ||
      item.vitality ||
      item.aura
    ) {
      let stat = 'stat+';

      if (item.power) {
        stat += ` ${item.power}pow`;
      }

      if (item.accuracy) {
        stat += ` ${item.accuracy}acc`;
      }

      if (item.dexterity) {
        stat += ` ${item.dexterity}dex`;
      }

      if (item.defense) {
        stat += ` ${item.defense}def`;
      }

      if (item.vitality) {
        stat += ` ${item.vitality}vit`;
      }

      if (item.aura) {
        stat += ` ${item.aura}aur`;
      }

      meta.push(stat);
    }
  }

  if (
    item.required_level ||
    item.required_class ||
    item.required_power ||
    item.required_accuracy ||
    item.required_dexterity ||
    item.required_defense ||
    item.required_vitality ||
    item.required_aura
  ) {
    let req = 'req:';

    if (item.required_level) {
      req += ` ${item.required_level}LVL`;
    }

    if (item.required_class) {
      // TODO: Load class name
      req += ` Class ${item.required_class}`;
    }

    if (item.required_power) {
      req += ` ${item.power}pow`;
    }

    if (item.required_accuracy) {
      req += ` ${item.accuracy}acc`;
    }

    if (item.required_dexterity) {
      req += ` ${item.dexterity}dex`;
    }

    if (item.required_defense) {
      req += ` ${item.defense}def`;
    }

    if (item.required_vitality) {
      req += ` ${item.vitality}vit`;
    }

    if (item.required_aura) {
      req += ` ${item.aura}aur`;
    }

    meta.push(req);
  }

  if (item.sell_price) {
    meta.push(`sell: ${item.sell_price}`);
  }

  return meta;
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

type ItemIngredientFor = {
  id: number;
  name: string;
};

export async function getItemIngredientFor(
  id: number,
): Promise<ItemIngredientFor[]> {
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

type ItemSoldBy = {
  npc_id: number;
  npc_name: string;
  price: number;
  x: number;
  y: number;
  map_id: number;
  map_name: string;
};

export async function getItemSoldBy(id: number): Promise<ItemSoldBy[]> {
  const item = await getItemById(id);
  if (!item?.soldBy) {
    return [];
  }

  const soldBy = await Promise.all(
    item.soldBy.map(async (s) => {
      const shop = await getShopByName(s.soldByName);
      if (!shop) {
        return undefined;
      }

      const buy = shop.buys.find((b) => b.item_id === item.id);
      if (!buy) {
        return undefined;
      }

      const npcs = await Promise.all(
        shop.npcs.map(async (n) => {
          const npc = await getNpcByName(n.npc_name);
          if (!npc) {
            return undefined;
          }

          return {
            x: n.x,
            y: n.y,
            map_id: n.map_id,
            map_name: n.map_name,
            npc_id: npc.id,
            npc_name: npc.name,
            price: buy.price,
          };
        }),
      );

      return npcs.filter((n) => !!n);
    }),
  );

  return soldBy.filter((s) => !!s).flat();
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

  const questNames = new Set(item.questRewards.map((r) => r.questName));

  const rewards = await Promise.all(
    Array.from(questNames).map(async (name) => {
      const quest = await getQuestByName(name);
      if (!quest) {
        return undefined;
      }

      const questRewards = quest.item_rewards_1.concat(quest.item_rewards_2);
      const rewards = questRewards.filter((r) => r.item_id === id);
      if (!rewards) {
        return undefined;
      }

      const npc = await getNpcByQuestBehaviorId(quest.start_npcs[0]);
      if (!npc) {
        return undefined;
      }

      if (quest.id === 248) {
        console.log('rewards', rewards);
      }

      return rewards.flatMap((re) => ({
        quest_id: quest.id,
        quest_name: name,
        npc_id: npc.id,
        amount: re.amount,
      }));
    }),
  );

  return rewards.filter((r) => !!r).flat();
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
