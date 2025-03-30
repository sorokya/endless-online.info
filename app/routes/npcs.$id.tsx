import { Link, data } from 'react-router';
import {
  getNpcBuyItems,
  getNpcById,
  getNpcCrafts,
  getNpcDrops,
  getNpcSpawns,
} from '~/.server/npcs';
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
  const buyItems = await getNpcBuyItems(id);
  const crafts = await getNpcCrafts(id);

  return data({
    npc,
    drops,
    spawns,
    buyItems,
    crafts,
  });
}

export default function Npc({ loaderData }: Route.ComponentProps) {
  const { npc, drops, spawns, buyItems, crafts } = loaderData;

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

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-base-100 p-4 shadow md:grid-cols-6">
              <div className="font-bold">HP</div>
              <div>{npc.hp}</div>
              <div className="font-bold">MP</div>
              <div>{npc.tp}</div>
              <div className="font-bold">Level</div>
              <div>{npc.level}</div>

              <div className="font-bold">Accuracy</div>
              <div>{npc.accuracy}</div>
              <div className="font-bold">Evade</div>
              <div>{npc.evasion}</div>
              <div className="font-bold">Armor</div>
              <div>{npc.armor}</div>

              <div className="font-bold">Damage</div>
              <div>
                {npc.min_damage} - {npc.max_damage}
              </div>
              <div className="font-bold">Experience</div>
              <div>{npc.experience}</div>
            </div>
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
                      className="transform-[scale(2)] mx-auto mt-4"
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

          {buyItems.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Items for Sale:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {buyItems.map((item) => (
                  <Link
                    to={`/items/${item.item_id}`}
                    key={item.item_id}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/items/${item.item_id}/graphic`}
                      alt={item.item_name}
                      className="h-8 w-full object-contain"
                    />
                    <div className="mt-2 text-center font-bold">
                      {item.item_name}
                    </div>
                    <div className="mt-2 text-center">{item.price}</div>
                  </Link>
                ))}
              </div>
            </details>
          )}

          {crafts.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Craftable Items:
              </summary>

              <table className="hidden lg:table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Cost</th>
                    <th>Ingredients</th>
                  </tr>
                </thead>
                <tbody>
                  {crafts.map((c) => (
                    <tr key={c.item_name}>
                      <td className="flex gap-1">
                        <Link
                          to={`/items/${c.item_id}`}
                          key={c.item_name}
                          className="card bg-base-200 p-4 shadow-xl"
                        >
                          <img
                            src={`https://eor-api.exile-studios.com/api/items/${c.item_id}/graphic/ground`}
                            alt={c.item_name}
                            className="transform-[scale(2)] mx-auto mt-4"
                          />
                          <div className="mt-2 text-center font-bold">
                            {c.item_name}
                          </div>
                        </Link>
                      </td>
                      <td>
                        <Link
                          to="/items/1"
                          className="card bg-base-200 p-4 shadow-xl"
                        >
                          <img
                            src="https://eor-api.exile-studios.com/api/items/1/graphic"
                            alt="Eons"
                            className="h-8 w-full object-contain"
                          />
                          <div className="mt-2 text-center font-bold">Eons</div>
                          <div className="mt-2 text-center">{c.eons}</div>
                        </Link>
                      </td>
                      <td className="flex gap-1">
                        {c.ingredients.map((i) => (
                          <Link
                            to={`/items/${i.item_id}`}
                            key={i.item_id}
                            className="card bg-base-200 p-4 shadow-xl"
                          >
                            <img
                              src={`https://eor-api.exile-studios.com/api/items/${i.item_id}/graphic/ground`}
                              alt={i.item_name}
                              className="transform-[scale(2)] mx-auto mt-4"
                            />
                            <div className="mt-2 text-center font-bold">
                              {i.item_name}
                            </div>
                            <div className="mt-2 text-center">{i.quantity}</div>
                          </Link>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-4 lg:hidden">
                {crafts.map((c) => (
                  <div
                    key={c.item_id}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <h2 className="text-center font-bold text-lg">
                      <Link
                        to={`/items/${c.item_id}`}
                        className="card w-24 bg-base-100 p-3 text-center shadow-md"
                      >
                        <img
                          src={`https://eor-api.exile-studios.com/api/items/${c.item_id}/graphic`}
                          alt={c.item_name}
                          className="transform-[scale(2)] mx-auto mt-4"
                        />
                        <div className="mt-1 font-bold text-sm">
                          {c.item_name}
                        </div>
                      </Link>
                    </h2>

                    <details
                      className="collapse-arrow collapse mt-2 bg-base-300"
                      open
                    >
                      <summary className="collapse-title font-semibold">
                        Ingredients
                      </summary>
                      <div className="collapse-content flex flex-wrap justify-center gap-2">
                        {c.eons > 0 && (
                          <Link
                            to="/items/1"
                            className="card bg-base-100 p-3 text-center shadow-md"
                          >
                            <img
                              src="https://eor-api.exile-studios.com/api/items/1/graphic"
                              alt="Eons"
                              className="h-8 w-full object-contain"
                            />
                            <div className="mt-1 font-bold">Eons</div>
                            <div>{c.eons}</div>
                          </Link>
                        )}
                        {c.ingredients.map((i) => (
                          <Link
                            to={`/items/${i.item_id}`}
                            key={i.item_id}
                            className="card w-24 bg-base-100 p-3 text-center shadow-md"
                          >
                            <img
                              src={`https://eor-api.exile-studios.com/api/items/${i.item_id}/graphic/ground`}
                              alt={i.item_name}
                              className="transform-[scale(2)] mx-auto mt-4"
                            />
                            <div className="mt-1 font-bold text-sm">
                              {i.item_name}
                            </div>
                            <div className="text-xs">x{i.quantity}</div>
                          </Link>
                        ))}
                      </div>
                    </details>
                  </div>
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
                      Coords:{' '}
                      <Link
                        to={`/maps/${spawn.map_id}/find?x=${spawn.x}&y=${spawn.y}`}
                        className="link-info"
                      >
                        {spawn.x}, {spawn.y}
                      </Link>
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
