import { Link, data } from 'react-router';
import {
  getQuestById,
  getQuestRewards,
  getQuestStartMap,
  getQuestStartNpc,
} from '~/.server/quests';
import type { Route } from './+types/quests.$id';

export function meta({ data }: Route.MetaArgs) {
  const { quest, npc } = data;
  if (!quest || !npc) {
    return [];
  }

  return [
    { title: `EOR Database - ${quest.title}` },
    { name: 'og:title', content: `EOR Database - ${quest.title}` },
    {
      name: 'og:url',
      content: `https://endless-online.info/quests/${quest.id}`,
    },
    {
      name: 'og:image',
      content: `https://eor-api.exile-studios.com/api/npcs/${npc.id}/graphic`,
    },
    {
      name: 'og:description',
      content: `Information for ${quest.title} Quest in Endless Online`,
    },
    {
      name: 'description',
      content: `Information for ${quest.title} Quest in Endless Online`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number.parseInt(params.id, 10);
  const quest = await getQuestById(id);
  const rewards = await getQuestRewards(id);
  const npc = await getQuestStartNpc(id);
  const startMap = await getQuestStartMap(id);

  return data({
    quest,
    npc,
    startMap,
    rewards,
  });
}

export default function Quest({ loaderData }: Route.ComponentProps) {
  const { npc, quest, startMap, rewards } = loaderData;

  if (!quest || !npc) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="card bg-base-200 text-center shadow-xl">
          <div className="card-body">
            <h2 className="font-bold text-gray-600 text-xl">Not found</h2>
            <p className="mt-2 text-gray-400 text-sm">
              A quest with that ID does not exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="card bg-base-200 p-4 shadow-xl">
        <div className="card-body">
          <h2 className="mb-4 text-center font-bold text-2xl">{quest.title}</h2>

          <div className="mb-4 flex justify-center">
            <Link to={`/npcs/${npc.id}`}>
              <img
                src={`https://eor-api.exile-studios.com/api/npcs/${npc.id}/graphic`}
                alt={npc.name}
                className="m-auto h-16 w-auto object-contain"
              />
              <div className="mt-2 text-center font-bold">{npc.name}</div>
            </Link>
          </div>

          <details
            className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
            open
          >
            <summary className="collapse-title font-bold text-xl">
              Details:
            </summary>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-base-100 p-4 shadow md:grid-cols-6">
              <div className="font-bold">Start map</div>
              <div>
                {startMap ? (
                  <Link to={`/maps/${startMap.id}`} className="link-info">
                    {startMap.name}
                  </Link>
                ) : (
                  'None'
                )}
              </div>

              <div className="font-bold">Min level</div>
              <div>{quest.min_level}</div>

              <div className="font-bold">Max level</div>
              <div>{quest.max_level}</div>

              <div className="font-bold">Reward EXP</div>
              <div>{quest.reward_exp}</div>
            </div>
          </details>

          {rewards.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Rewards:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {rewards.map((reward) => (
                  <Link
                    to={`/items/${reward.id}`}
                    key={reward.id}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/items/${reward.id}/graphic/ground`}
                      alt={reward.name}
                      className="transform-[scale(2)] mx-auto mt-4"
                    />
                    <div className="mt-2 text-center font-bold">
                      {reward.name}
                    </div>
                    <div className="mt-2 text-center">{reward.amount}</div>
                  </Link>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
