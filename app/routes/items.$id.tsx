import { Link, data } from 'react-router';
import { getClassById } from '~/.server/classes';
import {
  getItemById,
  getItemCraftables,
  getItemDrops,
  getItemGatherSpots,
  getItemIngredientFor,
  getItemRewards,
} from '~/.server/items';
import { capitalize } from '~/utils/capitalize';
import { getItemType } from '~/utils/get-item-type';
import type { Route } from './+types/items.$id';
import React from 'react';

export function meta({ data }: Route.MetaArgs) {
  const { item } = data;
  if (!item) {
    return [];
  }

  return [
    { title: `EOR Database - ${item.name}` },
    { name: 'og:title', content: `EOR Database - ${item.name}` },
    { name: 'og:url', content: `https://endless-online.info/items/${item.id}` },
    {
      name: 'og:image',
      content: `https://eor-api.exile-studios.com/api/items/${item.id}/graphic`,
    },
    {
      name: 'og:description',
      content: `Stats, drops, crafting recipes, and more for ${item.name} in Endless Online`,
    },
    {
      name: 'description',
      content: `Stats, drops, crafting recipes, and more for ${item.name} in Endless Online`,
    },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const id = Number.parseInt(params.id, 10);
  const item = await getItemById(id);
  const drops = await getItemDrops(id);
  const ingredientFor = await getItemIngredientFor(id);
  const craftables = await getItemCraftables(id);
  const requiredClass = item?.required_class
    ? await getClassById(item.required_class)
    : null;
  const rewards = await getItemRewards(id);
  const gatherSpots = await getItemGatherSpots(id);

  return data({
    item,
    drops,
    ingredientFor,
    craftables,
    requiredClassName: requiredClass?.name || 'None',
    rewards,
    gatherSpots,
  });
}

export default function Item({ loaderData }: Route.ComponentProps) {
  const {
    item,
    drops,
    ingredientFor,
    craftables,
    requiredClassName,
    rewards,
    gatherSpots,
  } = loaderData;

  if (!item) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="card bg-base-200 text-center shadow-xl">
          <div className="card-body">
            <h2 className="font-bold text-gray-600 text-xl">Not found</h2>
            <p className="mt-2 text-gray-400 text-sm">
              An item with that ID does not exist
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
          <h2 className="mb-4 text-center font-bold text-2xl">{item.name}</h2>
          <span className="mb-4 text-center text-md italic">
            {getItemType(item.item_type)}
          </span>

          <div className="mb-4 flex justify-center">
            <img
              src={item.graphic_url}
              alt={item.name}
              className="h-16 w-auto object-contain"
            />
          </div>

          <details className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl">
            <summary className="collapse-title font-bold text-xl">
              Stats:
            </summary>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-base-100 p-4 shadow md:grid-cols-6">
              <div className="font-bold">HP</div>
              <div>{item.hp}</div>
              <div className="font-bold">MP</div>
              <div>{item.tp}</div>
              <div className="hidden md:block" />
              <div className="hidden md:block" />

              <div className="font-bold">Power</div>
              <div>{item.power}</div>
              <div className="font-bold">Accuracy</div>
              <div>{item.accuracy}</div>
              <div className="font-bold">Dexterity</div>
              <div>{item.dexterity}</div>

              <div className="font-bold">Defense</div>
              <div>{item.defense}</div>
              <div className="font-bold">Vitality</div>
              <div>{item.vitality}</div>
              <div className="font-bold">Aura</div>
              <div>{item.aura}</div>

              <div className="font-bold">Hit Rate</div>
              <div>{item.hit_rate}</div>
              <div className="font-bold">Evade</div>
              <div>{item.evasion}</div>
              <div className="font-bold">Armor</div>
              <div>{item.armor}</div>

              <div className="font-bold">Damage</div>
              <div>
                {item.min_damage} - {item.max_damage}
              </div>
              <div className="font-bold">Range</div>
              <div>{item.range}</div>
              <div className="font-bold">Critical Chance</div>
              <div>{item.critical_chance}</div>
            </div>
          </details>

          {drops.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Dropped from:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {drops.map((drop) => (
                  <Link
                    to={`/npcs/${drop.npc_id}`}
                    key={drop.npc_id}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/npcs/${drop.npc_id}/graphic`}
                      alt={drop.npc_name}
                      className="h-16 w-full object-contain"
                    />
                    <div className="mt-2 text-center font-bold">
                      {drop.npc_name}
                    </div>
                    <div className="mt-2 text-center">{drop.percent}%</div>
                  </Link>
                ))}
              </div>
            </details>
          )}

          {craftables.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Crafted at:
              </summary>

              <table className="table-zebra hidden lg:table">
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Cost</th>
                    <th>Ingredients</th>
                  </tr>
                </thead>
                <tbody>
                  {craftables.map((c) => (
                    <tr key={c.shopName}>
                      <td className="flex gap-1">
                        {c.npcs.map((n) => (
                          <Link
                            to={`/npcs/${n.id}`}
                            key={n.name}
                            className="card bg-base-200 p-4 shadow-xl"
                          >
                            <img
                              src={`https://eor-api.exile-studios.com/api/npcs/${n.id}/graphic`}
                              alt={n.name}
                              className="h-16 w-full object-contain"
                            />
                            <div className="mt-2 text-center font-bold">
                              {n.name}
                            </div>
                            <div className="mt-2 text-center">
                              <Link to={`/maps/${n.map_id}`}>
                                {capitalize(n.map_name)}
                              </Link>
                            </div>
                          </Link>
                        ))}
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
                              className="h-16 w-full object-contain"
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
                {craftables.map((c) => (
                  <div
                    key={c.shopName}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <h2 className="text-center font-bold text-lg">
                      {c.shopName}
                    </h2>

                    <details
                      className="collapse-arrow collapse mt-2 bg-base-300"
                      open
                    >
                      <summary className="collapse-title font-semibold">
                        Available At
                      </summary>
                      <div className="collapse-content flex flex-wrap justify-center gap-2">
                        {c.npcs.map((n) => (
                          <Link
                            to={`/npcs/${n.id}`}
                            key={n.name}
                            className="card w-24 bg-base-100 p-3 text-center shadow-md"
                          >
                            <img
                              src={`https://eor-api.exile-studios.com/api/npcs/${n.id}/graphic`}
                              alt={n.name}
                              className="h-16 w-full object-contain"
                            />
                            <div className="mt-1 font-bold text-sm">
                              {n.name}
                            </div>
                            <div className="text-xs">
                              <Link to={`/maps/${n.map_id}`}>
                                {capitalize(n.map_name)}
                              </Link>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </details>

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
                              className="h-16 w-full object-contain"
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

          {ingredientFor.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Ingredient for:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {ingredientFor.map((item) => (
                  <Link
                    to={`/items/${item.id}`}
                    key={item.id}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/items/${item.id}/graphic/ground`}
                      alt={item.name}
                      className="h-16 w-full object-contain"
                    />
                    <div className="mt-2 text-center font-bold">
                      {item.name}
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          )}

          {rewards.length > 0 && (
            <details
              className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl"
              open
            >
              <summary className="collapse-title font-bold text-xl">
                Rewarded from:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {rewards.map((reward) => (
                  <Link
                    to={`/quests/${reward.quest_id}`}
                    key={reward.npc_id}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/npcs/${reward.npc_id}/graphic`}
                      alt={reward.quest_name}
                      className="h-16 w-full object-contain"
                    />
                    <div className="mt-2 text-center font-bold">
                      {reward.quest_name}
                    </div>
                    <div className="mt-2 text-center">{reward.amount}</div>
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
                Gatherable from:
              </summary>

              <div className="mt-1 grid grid-cols-2 gap-4 md:grid-cols-4">
                {gatherSpots.map((spot) => (
                  <Link
                    to={`/maps/${spot.map_id}`}
                    key={spot.map_id}
                    className="card bg-base-200 p-4 shadow-xl"
                  >
                    <img
                      src={`https://eor-api.exile-studios.com/api/graphics/6/${spot.graphic_id}`}
                      alt={item.name}
                      className="h-16 w-full object-contain"
                    />
                    <div className="mt-2 text-center font-bold">
                      {spot.map_name}
                    </div>
                    <div className="mt-2 text-center">
                      {spot.x}, {spot.y}
                    </div>
                    <div className="mt-2 text-center">{spot.amount}</div>
                  </Link>
                ))}
              </div>
            </details>
          )}

          <details className="collapse-arrow collapse rounded-xl bg-base-100 p-4 shadow-xl">
            <summary className="collapse-title font-bold text-xl">
              Requirements:
            </summary>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-base-100 p-4 shadow md:grid-cols-6">
              <div className="font-bold">Level</div>
              <div>{item.required_level}</div>
              <div className="font-bold">Class</div>
              <div>{requiredClassName}</div>
              <div className="hidden md:block" />
              <div className="hidden md:block" />

              <div className="font-bold">Power</div>
              <div>{item.required_power}</div>
              <div className="font-bold">Accuracy</div>
              <div>{item.required_accuracy}</div>
              <div className="font-bold">Dexterity</div>
              <div>{item.required_dexterity}</div>

              <div className="font-bold">Defense</div>
              <div>{item.required_defense}</div>
              <div className="font-bold">Vitality</div>
              <div>{item.required_vitality}</div>
              <div className="font-bold">Aura</div>
              <div>{item.required_aura}</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
