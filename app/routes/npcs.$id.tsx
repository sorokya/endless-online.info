import { Link, data } from 'react-router';
import { getNpcById, getNpcDrops, getNpcSpawns } from '~/.server/npcs';
import { getNpcSpeed } from '~/utils/get-npc-speed';
import { getNpcType } from '~/utils/get-npc-type';
import type { Route } from './+types/npcs.$id';

export function meta({ data }: Route.MetaArgs) {
  const { npc } = data;
  if (!npc) {
    return [];
  }

  return [
    { title: `EOR Database - ${npc.name}` },
    { name: 'og:title', content: `EOR Database - ${npc.name}` },
    { name: 'og:url', content: `https://endless-online.info/npcs/${npc.id}` },
    {
      name: 'og:image',
      content: `https://eor-api.exile-studios.com/api/npcs/${npc.id}/graphic`,
    },
    {
      name: 'og:description',
      content: `Stats, drops, and spawn locations for ${npc.name} in Endless Online`,
    },
    {
      name: 'description',
      content: `Stats, drops, and spawn locations for ${npc.name} in Endless Online`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number.parseInt(params.id, 10);
  const npc = await getNpcById(id);
  const drops = await getNpcDrops(id);
  const spawns = await getNpcSpawns(id);

  return data({
    npc,
    drops,
    spawns,
  });
}

export default function Npc({ loaderData }: Route.ComponentProps) {
  const { npc, drops, spawns } = loaderData;

  if (!npc) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="card bg-base-200 text-center shadow-xl">
          <div className="card-body">
            <h2 className="font-bold text-gray-600 text-xl">Not found</h2>
            <p className="mt-2 text-gray-400 text-sm">
              An npc with that ID does not exist
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
          <h2 className="mb-4 text-center font-bold text-2xl">{npc.name}</h2>
          <span className="mb-4 text-center text-md italic">
            {getNpcType(npc.behavior)}
          </span>

          <div className="mb-4 flex justify-center">
            <img
              src={`https://eor-api.exile-studios.com/api/npcs/${npc.id}/graphic`}
              alt={npc.name}
              className="h-16 w-auto object-contain"
            />
          </div>

          <details
            className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
            open
          >
            <summary className="collapse-title font-bold text-xl">
              Stats:
            </summary>

            <table className="table-zebra table">
              <tbody>
                <tr>
                  <td>HP</td>
                  <td>{npc.hp}</td>
                  <td>MP</td>
                  <td>{npc.tp}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Accuracy</strong>
                  </td>
                  <td>{npc.accuracy}</td>
                  <td>
                    <strong>Evade</strong>
                  </td>
                  <td>{npc.evasion}</td>
                  <td>
                    <strong>Armor</strong>
                  </td>
                  <td>{npc.armor}</td>
                </tr>
                <tr>
                  <td>Damage</td>
                  <td>
                    {npc.min_damage} - {npc.max_damage}
                  </td>
                  <td>Level</td>
                  <td>{npc.level}</td>
                  <td>Experience</td>
                  <td>{npc.experience}</td>
                </tr>
              </tbody>
            </table>
          </details>

          {drops.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Drops:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {drops.map((drop) => (
                  <Link
                    to={`/items/${drop.id}`}
                    key={drop.id}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/items/${drop.id}/graphic/ground`}
                      alt={drop.name}
                      className="h-16 w-full object-contain"
                    />
                    <div className="mt-2 text-center font-bold">
                      {drop.name}
                    </div>
                    <div className="mt-2 text-center">{drop.percent}%</div>
                  </Link>
                ))}
              </div>
            </details>
          )}

          {spawns.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Spawns:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {spawns.map((spawn) => (
                  <Link
                    to={`/maps/${spawn.map_id}`}
                    key={`${spawn.map_id}${spawn.x}${spawn.y}`}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <div className="mt-2 text-center font-bold">
                      {spawn.map_name}
                    </div>
                    <div className="mt-2 text-center">
                      Coords: {spawn.x}, {spawn.y}
                    </div>
                    <div className="mt-2 text-center">
                      Respawn:{' '}
                      {spawn.respawn
                        ? `${spawn.respawn} seconds`
                        : npc.respawn || 'Unknown'}
                    </div>
                    <div className="mt-2 text-center">
                      Amount: {spawn.amount}
                    </div>
                    <div className="mt-2 text-center">
                      Speed: {getNpcSpeed(spawn.speed)}
                    </div>
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
