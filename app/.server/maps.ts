import fs from 'node:fs/promises';
import { Image, createCanvas } from 'canvas';
import { z } from 'zod';
import { CONFIG } from '~/config';
import { getItemById } from './items';
import { MapTileSpec } from './map-tile-spec';
import { getNpcById } from './npcs';

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

const MapLayerDetails = z.object({
  name: z.string(),
  rows: z.number(),
  columns: z.number().optional(),
});

const MapLayerTile = z.object({
  x: z.number(),
  y: z.number(),
  tile: z.number().optional(),
});

const MapLayer = z.object({
  details: MapLayerDetails,
  tiles: z.array(MapLayerTile).optional(),
});

const SpecTile = z.object({
  x: z.number(),
  y: z.number(),
  spec: z.number(),
});

const MapSign = z.object({
  x: z.number(),
  y: z.number(),
  msg: z.object({
    title: z.string(),
    message: z.string(),
  }),
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
  scroll_allow: z.number(),
  minimap_allow: z.number(),
  channel_busy: z.number(),
  channel_full: z.number(),
  daymode: z.number(),
  daymode_override: z.number(),
  weather_type: z.number(),
  respawn_x: z.number(),
  respawn_y: z.number(),
  wayfarer_id: z.number(),
  wayfarer_x: z.number(),
  wayfarer_y: z.number(),
  npcs: z.array(Npc),
  items: z.array(Item),
  map_gathers: z.array(Gather).optional(),
  warp_tiles: z.array(WarpTile),
  map_layers: z.array(MapLayer),
  spec_tiles: z.array(SpecTile),
  signs: z.array(MapSign),
});

const MapArraySchema = z.array(MapSchema);

export type Map = z.infer<typeof MapSchema>;

type MapListEntry = {
  id: number;
  name: string;
};

let MAPS: Map[] | null = null;
export async function getMaps(): Promise<Map[]> {
  const json = await fs.readFile('data/maps.json', 'utf8');
  if (!MAPS) {
    const object = JSON.parse(json);
    MAPS = MapArraySchema.parse(object);
  }

  return MAPS;
}

export function reset() {
  MAPS = null;
}

type MapListResult = {
  count: number;
  records: MapListEntry[];
};

export async function getMapList(search: {
  name: string;
  page: string;
}): Promise<MapListResult> {
  const maps = await getMaps();
  const filtered = maps
    .filter((i) => {
      return (
        !search.name ||
        i.name.toLowerCase().indexOf(search.name.toLowerCase()) > -1
      );
    })
    .map((i) => ({
      id: i.id,
      name: i.name || '???',
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

export async function getMapById(id: number): Promise<Map | undefined> {
  const maps = await getMaps();
  return maps.find((i) => i.id === id);
}

type NpcSpawn = {
  id: number;
  name: string;
  x: number;
  y: number;
  amount: number;
  speed: number;
  time: number;
};

export async function getMapNpcSpawns(id: number): Promise<NpcSpawn[]> {
  const map = await getMapById(id);
  if (!map) {
    return [];
  }

  const spawns = await Promise.all(
    map.npcs.map(async (spawn) => {
      const npc = await getNpcById(spawn.id);
      if (!npc) {
        return undefined;
      }

      return {
        id: npc.id,
        name: npc.name,
        x: spawn.x,
        y: spawn.y,
        amount: spawn.amount,
        speed: spawn.speed || npc.npc_default_speed,
        time: spawn.time > 0 ? spawn.time : npc.npc_respawn_secs,
      };
    }),
  );

  return spawns.filter((s) => !!s);
}

type GatherSpot = {
  item_id: number;
  item_name: string;
  x: number;
  y: number;
  amount: number;
  graphic_id: number;
};

export async function getMapGatherSpots(id: number): Promise<GatherSpot[]> {
  const map = await getMapById(id);
  if (!map?.map_gathers) {
    return [];
  }

  const spots = await Promise.all(
    map.map_gathers.map(async (gather) => {
      const item = await getItemById(gather.item_id);

      if (!item) {
        return undefined;
      }

      return {
        item_id: item.id,
        item_name: item.name,
        x: gather.x,
        y: gather.y,
        amount: gather.max_amount,
        graphic_id: gather.graphic_id + 100,
      };
    }),
  );

  return spots.filter((s) => !!s);
}

type Chest = {
  x: number;
  y: number;
  graphic_id: number | undefined;
  spawns: ChestSpawn[];
};

type ChestSpawn = {
  item_id: number;
  item_name: string;
  amount: number;
  slot: number;
  time: number;
};

export async function getMapChests(id: number): Promise<Chest[]> {
  const map = await getMapById(id);
  if (!map) {
    return [];
  }

  const getObjectGraphicAt = (x: number, y: number) => {
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

  const mapHasChestSpecAt = (x: number, y: number) => {
    const tile = map.spec_tiles.find((t) => t.x === x && t.y === y);
    if (!tile) {
      return undefined;
    }

    return tile.spec === MapTileSpec.Chest;
  };

  const spawns = (
    await Promise.all(
      map.items.map(async (i) => {
        const item = await getItemById(i.item_id);
        if (!item || !mapHasChestSpecAt(i.x, i.y)) {
          return undefined;
        }

        return {
          item_id: item.id,
          item_name: item.name,
          x: i.x,
          y: i.y,
          amount: i.amount,
          slot: i.slot,
          time: i.time,
          key: i.key,
          graphic_id: getObjectGraphicAt(i.x, i.y),
        };
      }),
    )
  ).filter((s) => !!s);

  const chests: Chest[] = [];

  for (const spawn of spawns) {
    const chest = chests.find((c) => c.x === spawn.x && c.y === spawn.y);
    if (chest) {
      chest.spawns.push({
        item_id: spawn.item_id,
        item_name: spawn.item_name,
        amount: spawn.amount,
        time: spawn.time,
        slot: spawn.slot,
      });
    } else {
      chests.push({
        x: spawn.x,
        y: spawn.y,
        graphic_id: spawn.graphic_id,
        spawns: [
          {
            item_id: spawn.item_id,
            item_name: spawn.item_name,
            amount: spawn.amount,
            time: spawn.time,
            slot: spawn.slot,
          },
        ],
      });
    }
  }

  return chests;
}

type MapSign = {
  x: number;
  y: number;
  title: string;
  message: string;
  graphic_id: number | undefined;
};

export async function getMapSigns(id: number): Promise<MapSign[]> {
  const map = await getMapById(id);
  if (!map) {
    return [];
  }

  const getObjectGraphicAt = (x: number, y: number) => {
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

  return map.signs.map((sign) => ({
    x: sign.x,
    y: sign.y,
    title: sign.msg.title,
    message: sign.msg.message,
    graphic_id: getObjectGraphicAt(sign.x, sign.y),
  }));
}

type MapWarp = {
  x: number;
  y: number;
  map_id: number;
  map_name: string;
  destination_x: number;
  destination_y: number;
};

export async function getMapWarps(id: number): Promise<MapWarp[]> {
  const map = await getMapById(id);
  if (!map) {
    return [];
  }

  const warps = await Promise.all(
    map.warp_tiles.map(async (warp) => {
      if (warp.destination_id === id) {
        return undefined;
      }

      const map = await getMapById(warp.destination_id);
      if (!map) {
        return undefined;
      }

      return {
        x: warp.x,
        y: warp.y,
        map_id: map.id,
        map_name: map.name,
        destination_x: warp.destination_x,
        destination_y: warp.destination_y,
      };
    }),
  );

  return warps.filter((w) => !!w);
}

const TILE_WIDTH = 16;
const TILE_HEIGHT = 8;
export async function getMapPreview(id: number): Promise<Buffer> {
  const map = await getMapById(id);
  if (!map) {
    throw new Error('Map not found');
  }

  await fs.mkdir('data/maps', { recursive: true });
  const path = `data/maps/${map.id}.png`;

  try {
    const buf = await fs.readFile(path);
    return buf;
  } catch (_err) {}

  const width = (map.width + map.height) * (TILE_WIDTH / 2);
  const height = (map.width + map.height) * (TILE_HEIGHT / 2);
  const canvas = createCanvas(width, height);

  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#000';

  const getTile = (x: number, y: number): number => {
    const tile = map.spec_tiles.find((t) => t.x === x && t.y === y);
    if (tile) {
      return tile.spec;
    }

    return -1;
  };

  const npcSpawnAt = (x: number, y: number): boolean =>
    map.npcs.some((n) => n.x === x && n.y === y);

  const warpAt = (x: number, y: number): boolean =>
    map.warp_tiles.some((w) => w.x === x && w.y === y);

  const getColor = (tile: number): string => {
    switch (tile) {
      case MapTileSpec.Edge:
      case MapTileSpec.Wall:
        return '#505050'; // Softer dark gray for walls/edges
      case MapTileSpec.Gather:
      case MapTileSpec.GatherBlock:
        return '#3b8656'; // Muted green for gathering spots
      case MapTileSpec.FishingUp:
      case MapTileSpec.FishingDown:
      case MapTileSpec.FishingRight:
      case MapTileSpec.FishingLeft:
        return '#2b4f75'; // Muted deep blue for fishing areas
      case MapTileSpec.Chest:
        return '#774a89'; // Muted purple for chests
      default:
        return '#333333'; // Default dark tile background
    }
  };

  const offsetX = ((map.width - map.height) * (TILE_WIDTH / 2)) / 2;
  for (let y = 0; y < map.height; ++y) {
    for (let x = 0; x < map.width; ++x) {
      const tile = getTile(x, y);
      if (tile > -1) {
        ctx.fillStyle = getColor(tile);
      } else if (npcSpawnAt(x, y)) {
        ctx.fillStyle = '#b34b5e';
      } else if (warpAt(x, y)) {
        ctx.fillStyle = '#4a5c9c';
      } else {
        ctx.fillStyle = '#333333';
      }

      const isoX = (x - y) * (TILE_WIDTH / 2) + width / 2 - offsetX;
      const isoY = (x + y) * (TILE_HEIGHT / 2);

      ctx.beginPath();
      ctx.moveTo(isoX, isoY);
      ctx.lineTo(isoX + TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
      ctx.lineTo(isoX, isoY + TILE_HEIGHT);
      ctx.lineTo(isoX - TILE_WIDTH / 2, isoY + TILE_HEIGHT / 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  const image = canvas.toBuffer('image/png');
  await fs.writeFile(`data/maps/${map.id}.png`, image);

  return image;
}

export async function getMapPreviewWithArrow(
  id: number,
  x: number,
  y: number,
): Promise<string> {
  const map = await getMapById(id);
  if (!map) {
    return '';
  }

  const buffer = await getMapPreview(id);
  const img = new Image();
  img.src = buffer;

  const width = (map.width + map.height) * (TILE_WIDTH / 2);
  const height = (map.width + map.height) * (TILE_HEIGHT / 2);
  const canvas = createCanvas(width, height);

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const arrowSize = 10; // Adjust arrow size
  const offsetX = ((map.width - map.height) * (TILE_WIDTH / 2)) / 2;
  const isoX = (x - y) * (TILE_WIDTH / 2) + width / 2 - offsetX;
  const isoY =
    (x + y) * (TILE_HEIGHT / 2) -
    TILE_HEIGHT +
    TILE_HEIGHT / 2 +
    arrowSize * 2 +
    5;

  ctx.fillStyle = '#ffcc00'; // Bright yellow for visibility
  ctx.strokeStyle = '#000'; // Black outline for contrast
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(isoX, isoY - arrowSize); // Top point
  ctx.lineTo(isoX - arrowSize, isoY + arrowSize); // Bottom left
  ctx.lineTo(isoX + arrowSize, isoY + arrowSize); // Bottom right
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  return canvas.toDataURL();
}

export async function getMapNameById(id: number): Promise<string> {
  const map = await getMapById(id);
  if (!map) {
    return '';
  }

  return map.name;
}
