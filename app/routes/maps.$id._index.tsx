import { Link, data } from 'react-router';
import {
  getMapById,
  getMapChests,
  getMapGatherSpots,
  getMapNpcSpawns,
  getMapSigns,
  getMapWarps,
} from '~/.server/maps';
import { getLightMode } from '~/utils/get-light-mode';
import { getNpcSpeed } from '~/utils/get-npc-speed';
import { getWeatherType } from '~/utils/get-weather-type';
import type { Route } from './+types/maps.$id._index';

export function meta({ data }: Route.MetaArgs) {
  const { map } = data;
  if (!map) {
    return [];
  }

  return [
    { title: `EOR Database - ${map.name}` },
    { name: 'og:title', content: `EOR Database - ${map.name}` },
    {
      name: 'og:url',
      content: `https://endless-online.info/maps/${map.id}`,
    },
    {
      name: 'og:image',
      content: `https://endless-online.info/maps/${map.id}/preview`,
    },
    {
      name: 'og:description',
      content: `Information for ${map.name} Map in Endless Online`,
    },
    {
      name: 'description',
      content: `Information for ${map.name} Map in Endless Online`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number.parseInt(params.id, 10);
  const map = await getMapById(id);
  const npcSpawns = await getMapNpcSpawns(id);
  const gatherSpots = await getMapGatherSpots(id);
  const chests = await getMapChests(id);
  const signs = await getMapSigns(id);
  const warps = await getMapWarps(id);

  return data({
    map,
    npcSpawns,
    gatherSpots,
    chests,
    signs,
    warps,
  });
}

export default function MapPage({ loaderData }: Route.ComponentProps) {
  const { map, npcSpawns, gatherSpots, chests, signs, warps } = loaderData;

  if (!map) {
    return (
      <div className="clss-center flex h-60 justify-center">
        <div className="card bg-base-200 text-center shadow-xl">
          <div className="card-body">
            <h2 className="font-bold text-gray-600 text-xl">Not found</h2>
            <p className="mt-2 text-gray-400 text-sm">
              A Map with that ID does not exist
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
          <h2 className="mb-4 text-center font-bold text-2xl">{map.name}</h2>

          <img src={`/maps/${map.id}/preview`} alt="Map Preview" />

          <details
            className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
            open
          >
            <summary className="collapse-title font-bold text-xl">
              Details:
            </summary>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-base-100 p-4 shadow md:grid-cols-6">
              <div className="font-bold">Dimensions</div>
              <div>
                {map.width}x{map.height}
              </div>

              <div className="font-bold">Can scroll?</div>
              <div>{map.scroll_allow === 1 ? 'Yes' : 'No'}</div>

              <div className="font-bold">Respawn</div>
              <div>
                {map.respawn_x === 0
                  ? 'Default'
                  : `${map.respawn_x}, ${map.respawn_y}`}
              </div>

              <div className="font-bold">Mini-map?</div>
              <div>{map.minimap_allow === 1 ? 'Yes' : 'No'}</div>

              <div className="font-bold">Light mode</div>
              <div>{getLightMode(map.daymode)}</div>

              <div className="font-bold">Weather</div>
              <div>{getWeatherType(map.weather_type)}</div>

              <div className="font-bold">Channel Busy</div>
              <div>{map.channel_busy}</div>

              <div className="font-bold">Channel Full</div>
              <div>{map.channel_full}</div>
            </div>
          </details>

          {npcSpawns.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                NPC Spawns:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {npcSpawns.map((spawn) => (
                  <Link
                    to={`/npcs/${spawn.id}`}
                    key={`${spawn.id}${spawn.x}${spawn.y}`}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/npcs/${spawn.id}/graphic`}
                      alt={spawn.name}
                      className="h-16 w-full object-contain"
                    />
                    <div className="mt-2 text-center font-bold">
                      {spawn.name}
                    </div>
                    <div className="mt-2 text-center">
                      Coords:{' '}
                      <Link
                        to={`/maps/${map.id}/find?x=${spawn.x}&y=${spawn.y}`}
                        className="link-info"
                      >
                        {spawn.x}, {spawn.y}
                      </Link>
                    </div>
                    <div className="mt-2 text-center">
                      Respawn: {spawn.time}s
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

          {gatherSpots.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Gather spots:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {gatherSpots.map((spot) => (
                  <Link
                    to={`/items/${spot.item_id}`}
                    key={`${spot.item_id}${spot.x}${spot.y}`}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/graphics/6/${spot.graphic_id}`}
                      alt={spot.item_name}
                      className="h-16 w-full object-contain"
                    />
                    <div className="mt-2 text-center font-bold">
                      {spot.item_name}
                    </div>
                    <div className="mt-2 text-center">
                      Coords:{' '}
                      <Link
                        to={`/maps/${map.id}/find?x=${spot.x}&y=${spot.y}`}
                        className="link-info"
                      >
                        {spot.x}, {spot.y}
                      </Link>
                    </div>
                    <div className="mt-2 text-center">
                      Amount: {spot.amount}
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          )}

          {chests.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Chests:
              </summary>

              <table className="hidden lg:table">
                <thead>
                  <tr>
                    <th>Chest</th>
                    <th>Items</th>
                  </tr>
                </thead>
                <tbody>
                  {chests.map((c) => (
                    <tr key={`${c.x}{c.y}`}>
                      <td className="flex gap-1">
                        <div className="card bg-base-200 p-4 shadow-xl">
                          {c.graphic_id && (
                            <img
                              src={`https://eor-api.exile-studios.com/api/graphics/6/${c.graphic_id + 100}`}
                              alt="Chest Graphic"
                              className="h-16 w-full object-contain"
                            />
                          )}
                          <div className="mt-2 text-center">
                            Coords:{' '}
                            <Link
                              to={`/maps/${map.id}/find?x=${c.x}&y=${c.y}`}
                              className="link-info"
                            >
                              {c.x}, {c.y}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {c.spawns.map((s) => (
                            <Link
                              to={`/items/${s.item_id}`}
                              key={s.item_id}
                              className="card bg-base-200 p-4 shadow-xl"
                            >
                              <img
                                src={`https://eor-api.exile-studios.com/api/items/${s.item_id}/graphic/ground`}
                                alt={s.item_name}
                                className="transform-[scale(2)] mx-auto mt-4"
                              />
                              <div className="mt-2 text-center font-bold">
                                {s.item_name}
                              </div>
                              <div className="mt-2 text-center">
                                Amount: {s.amount}
                              </div>
                              <div className="mt-2 text-center">
                                Respawn: {s.time} minutes
                              </div>
                            </Link>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="space-y-4 lg:hidden">
                {chests.map((c) => (
                  <div
                    key={`${c.x}${c.y}`}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <details
                      className="collapse-arrow collapse mt-2 bg-base-300"
                      open
                    >
                      <summary className="collapse-title font-semibold">
                        Coords:{' '}
                        <Link
                          to={`/maps/${map.id}/find?x=${c.x}&y=${c.y}`}
                          className="link-info"
                        >
                          {c.x}, {c.y}
                        </Link>
                      </summary>
                      <div className="collapse-content flex flex-wrap justify-center gap-2">
                        {c.graphic_id && (
                          <img
                            src={`https://eor-api.exile-studios.com/api/graphics/6/${c.graphic_id + 100}`}
                            alt="Chest Graphic"
                            className="h-16 w-full object-contain"
                          />
                        )}

                        <div className="flex w-full flex-col">
                          {c.spawns.map((s) => (
                            <div
                              className="card bg-base-100 p-3 text-center shadow-md"
                              key={`${s.item_id}${s.slot}`}
                            >
                              <Link
                                to={`/items/${s.item_id}`}
                                key={s.item_id}
                                className="card bg-base-200 p-4 shadow-xl"
                              >
                                <img
                                  src={`https://eor-api.exile-studios.com/api/items/${s.item_id}/graphic/ground`}
                                  alt={s.item_name}
                                  className="transform-[scale(2)] mx-auto mt-4"
                                />
                                <div className="mt-2 text-center font-bold">
                                  {s.item_name}
                                </div>
                                <div className="mt-2 text-center">
                                  Amount: {s.amount}
                                </div>
                                <div className="mt-2 text-center">
                                  Respawn: {s.time} minutes
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </details>
          )}

          {warps.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Warps:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {warps.map((warp) => (
                  <Link
                    to={`/maps/${warp.map_id}`}
                    key={`${warp.x}${warp.y}`}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <div className="mt-2 text-center font-bold">
                      {warp.map_name} (
                      <Link
                        to={`/maps/${warp.map_id}/find?x=${warp.destination_x}&y=${warp.destination_y}`}
                        className="link-info"
                      >
                        {warp.destination_x}, {warp.destination_y}
                      </Link>
                      )
                    </div>
                    <div className="mt-2 text-center">
                      Coords:{' '}
                      <Link
                        to={`/maps/${map.id}/find?x=${warp.x}&y=${warp.y}`}
                        className="link-info"
                      >
                        {warp.x}, {warp.y}
                      </Link>
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          )}

          {signs.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Signs:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {signs.map((sign) => (
                  <div key={`${sign.x}${sign.y}`}>
                    {sign.graphic_id && (
                      <img
                        src={`https://eor-api.exile-studios.com/api/graphics/6/${sign.graphic_id + 100}`}
                        alt="Chest Graphic"
                        className="h-16 w-full object-contain"
                      />
                    )}
                    <div className="mt-2 text-center font-bold">
                      {sign.title}
                    </div>
                    <div className="mt-2 text-center italic">
                      {sign.message}
                    </div>
                    <div className="mt-2 text-center">
                      Coords:{' '}
                      <Link
                        to={`/maps/${map.id}/find?x=${sign.x}&y=${sign.y}`}
                        className="link-info"
                      >
                        {sign.x}, {sign.y}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
