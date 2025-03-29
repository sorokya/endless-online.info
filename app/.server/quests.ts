import fs from 'node:fs/promises';
import { z } from 'zod';

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
};

async function getQuests(): Promise<Quest[]> {
  const json = await fs.readFile('data/quests.json', 'utf8');
  const object = JSON.parse(json);
  return QuestArraySchema.parse(object);
}

export async function getQuestList(): Promise<QuestListEntry[]> {
  const quests = await getQuests();
  return quests.map((i) => ({
    id: i.id,
    name: i.title,
  }));
}

export async function getQuestById(id: number): Promise<Quest | undefined> {
  const quests = await getQuests();
  return quests.find((i) => i.id === id);
}

export async function getQuestByName(name: string): Promise<Quest | undefined> {
  const quests = await getQuests();
  return quests.find((i) => i.title === name);
}
