import fs from 'node:fs/promises';
import { z } from 'zod';

const ShopNpc = z.object({
  map_id: z.number(),
  x: z.number(),
  y: z.number(),
  npc_name: z.string(),
  map_name: z.string(),
});

const ShopBuy = z.object({
  item_id: z.number(),
  price: z.number(),
});

const ShopCraft = z.object({
  item_id: z.number(),
});

const ShopSchema = z.object({
  name: z.string(),
  npcs: z.array(ShopNpc),
  buys: z.array(ShopBuy),
  crafts: z.array(ShopCraft),
});

const ShopArraySchema = z.array(ShopSchema);

type Shop = z.infer<typeof ShopSchema>;

let SHOPS: Shop[] | null = null;
export async function getShops(): Promise<Shop[]> {
  if (!SHOPS) {
    const json = await fs.readFile('data/shops.json', 'utf8');
    const object = JSON.parse(json);
    SHOPS = ShopArraySchema.parse(object);
  }

  return SHOPS;
}

export function reset() {
  SHOPS = null;
}

export async function getShopList(): Promise<string[]> {
  const shops = await getShops();
  return shops.map((i) => i.name);
}

export async function getShopByName(name: string): Promise<Shop | undefined> {
  const shops = await getShops();
  return shops.find((i) => i.name === name);
}

export async function getShopByNpcName(
  name: string,
): Promise<Shop | undefined> {
  const shops = await getShops();
  return shops.find((i) =>
    i.npcs.some((n) => n.npc_name.toLowerCase() === name.toLowerCase()),
  );
}
