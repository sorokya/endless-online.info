import fs from 'node:fs/promises';
import { z } from 'zod';
import { CONFIG } from '~/config';
import { getItemById } from './items';
import { getNpcByQuestBehaviorId, getNpcSpawns } from './npcs';

const NPCSchema = z.object({
  npc_type: z.number(),
  npc_id: z.number(),
});

const StateSchema = z.object({
  state_id: z.number(),
  npcs: z.array(NPCSchema),
});

const ItemRewardSchema = z.object({
  item_id: z.number(),
  amount: z.number(),
});

const QuestSchema = z.object({
  title: z.string(),
  id: z.number(),
  quest_type: z.number(),
  no_abort: z.number(),
  required_quest: z.number(),
  start_npcs: z.array(z.number()),
  start_map: z.number(),
  min_level: z.number(),
  max_level: z.number(),
  repeatable: z.number(),
  reward_exp: z.number(),
  additional_exp: z.number(),
  item_rewards_1: z.array(ItemRewardSchema),
  item_rewards_2: z.array(ItemRewardSchema),
  state_count: z.number(),
  states: z.array(StateSchema),
});

const QuestArraySchema = z.array(QuestSchema);

type Quest = z.infer<typeof QuestSchema>;

type QuestListEntry = {
  id: number;
  name: string;
  npc_id: number;
};

let QUESTS: Quest[] | null = null;
async function getQuests(): Promise<Quest[]> {
  if (!QUESTS) {
    const json = await fs.readFile('data/quests.json', 'utf8');
    const object = JSON.parse(json);
    QUESTS = QuestArraySchema.parse(object);
  }

  return QUESTS;
}

export function reset() {
  QUESTS = null;
}

type QuestListResult = {
  count: number;
  records: QuestListEntry[];
};

export async function getQuestList(search: {
  name: string;
  page: string;
}): Promise<QuestListResult> {
  const quests = await getQuests();
  const filtered = await Promise.all(
    quests
      .filter((i) => {
        return (
          !search.name ||
          i.title.toLowerCase().indexOf(search.name.toLowerCase()) > -1
        );
      })
      .map(async (i) => {
        const npc = await getNpcByQuestBehaviorId(i.start_npcs[0]);

        return {
          id: i.id,
          name: i.title,
          npc_id: npc?.id || 0,
        };
      }),
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

export async function getQuestById(id: number): Promise<Quest | undefined> {
  const quests = await getQuests();
  return quests.find((i) => i.id === id);
}

export async function getQuestByName(name: string): Promise<Quest | undefined> {
  const quests = await getQuests();
  return quests.find((i) => i.title === name);
}

type QuestReward = {
  id: number;
  name: string;
  amount: number;
};

export async function getQuestRewards(id: number): Promise<QuestReward[]> {
  const quest = await getQuestById(id);
  if (!quest) {
    return [];
  }

  const rewards = quest.item_rewards_1.concat(quest.item_rewards_2);

  return (
    await Promise.all(
      rewards.map(async (reward) => {
        const item = await getItemById(reward.item_id);
        if (!item) {
          return undefined;
        }

        return {
          id: item.id,
          name: item.name,
          amount: reward.amount,
        };
      }),
    )
  ).filter((r) => !!r);
}

type QuestStartNpc = {
  id: number;
  name: string;
};

export async function getQuestStartNpc(
  id: number,
): Promise<QuestStartNpc | undefined> {
  const quest = await getQuestById(id);
  if (!quest) {
    return undefined;
  }

  return getNpcByQuestBehaviorId(quest.start_npcs[0]);
}

export async function getQuestStartMap(
  id: number,
): Promise<{ name: string; id: number } | undefined> {
  const quest = await getQuestById(id);
  if (!quest) {
    return undefined;
  }

  const npc = await getNpcByQuestBehaviorId(quest.start_npcs[0]);
  if (!npc) {
    return undefined;
  }

  const spawns = await getNpcSpawns(npc.id);
  if (spawns.length) {
    return {
      id: spawns[0].map_id,
      name: spawns[0].map_name,
    };
  }
}
