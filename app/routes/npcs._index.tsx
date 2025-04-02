import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from './+types/npcs._index';

import { useDebounce } from '@uidotdev/usehooks';
import { Form, Link, data } from 'react-router';
import { getNpcList } from '~/.server/npcs';
import { CONFIG } from '~/config';

export function links() {
  return [{ rel: 'canonical', href: 'https://endless-online.info/npcs' }];
}

export function meta() {
  return [
    { title: 'EOR Database - NPCs' },
    { name: 'og:title', content: 'EOR Database - NPCs' },
    { name: 'og:url', content: 'https://endless-online.info/npcs' },
    { name: 'og:image', content: 'https://endless-online.info/icon.png' },
    {
      name: 'og:description',
      content: 'Endless Online NPC Search',
    },
    {
      name: 'description',
      content: 'Endless Online NPC Search',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const search = {
    name: url.searchParams.get('name') || '',
    type: url.searchParams.get('type') || 'all',
    page: url.searchParams.get('page') || '1',
  };

  const npcs = await getNpcList(search);
  return data({
    npcs,
    search,
  });
}

export default function Npcs({ loaderData }: Route.ComponentProps) {
  const { npcs, search } = loaderData;

  const [name, setName] = useState(search.name);
  const [type, setType] = useState(search.type);
  const [page, setPage] = useState(search.page);

  const debouncedName = useDebounce(name, 300);

  // Use useRef for the form element
  const formRef = useRef<HTMLFormElement | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Run effect when name changes
  useEffect(() => {
    if (formRef.current) {
      setPage('1');
      formRef.current.requestSubmit();
    }
  }, [debouncedName]);

  const pageCount = useMemo(
    () => Math.ceil(npcs.count / CONFIG.PAGE_SIZE),
    [npcs],
  );

  const getSearchParams = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.append('name', name);
      params.append('type', type);
      params.append('page', page.toString());

      return Array.from(params.entries())
        .map(([key, value]) =>
          value ? `${key}=${encodeURIComponent(value)}` : key,
        )
        .join('&');
    },
    [name, type],
  );

  const pageLinks = useMemo(() => {
    if (pageCount === 1) {
      return undefined;
    }

    const links = [];
    for (let i = 1; i <= pageCount; i++) {
      const active = search.page === i.toString();
      links.push(
        <Link
          key={i}
          to={{
            search: getSearchParams(i),
          }}
          className={`join-item btn ${active ? 'btn-primary' : ''}`}
        >
          {i}
        </Link>,
      );
    }

    return links;
  }, [pageCount, getSearchParams, search.page]);

  return (
    <div className="container mx-auto p-4">
      <Form
        className="mb-2 flex justify-end gap-2"
        method="get"
        replace
        ref={formRef}
      >
        <div className="form-control flex-2/3">
          <label htmlFor="name" className="label">
            <span className="label-text">Name</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter name"
            className="input input-bordered w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-control">
          <label htmlFor="type" className="label">
            <span className="label-text">Type</span>
          </label>
          <select
            id="type"
            name="type"
            className="select select-bordered w-full"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (formRef.current) {
                formRef.current.requestSubmit();
              }
            }}
          >
            <option value="all">All Types</option>
            <option value="0">Friendly</option>
            <option value="1">Passive</option>
            <option value="2">Aggressive</option>
            <option value="5">Crafting</option>
            <option value="6">Shop</option>
            <option value="7">Inn Keeper</option>
            <option value="9">Bank</option>
            <option value="10">Barber</option>
            <option value="11">Guild Master</option>
            <option value="12">Priest</option>
            <option value="13">Lawyer</option>
            <option value="14">Trainer</option>
            <option value="15">Quest</option>
          </select>
        </div>

        <input name="page" type="hidden" value={page} />

        <div className="mt-6">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </Form>
      {npcs.records.length === 0 ? (
        <div className="flex h-60 items-center justify-center">
          <div className="card bg-base-200 text-center shadow-xl">
            <div className="card-body">
              <h2 className="font-bold text-gray-600 text-xl">
                No results found
              </h2>
              <p className="mt-2 text-gray-400 text-sm">
                Try adjusting your search criteria.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {npcs.records.map((npc) => (
              <Link
                to={`/npcs/${npc.id}`}
                key={npc.id}
                className="card bg-base-200 p-4 shadow-xl"
              >
                <img
                  src={`https://eor-api.exile-studios.com/api/npcs/${npc.id}/graphic`}
                  alt={npc.name}
                  className="h-16 w-full object-contain"
                />
                <div className="mt-2 text-center font-bold">{npc.name}</div>
                <div className="flex flex-col items-center text-xs opacity-75">
                  {npc.meta.map((meta) => (
                    <div key={meta}>{meta}</div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          {pageCount > 1 && (
            <div className="mt-4 flex items-center justify-center">
              <div className="join flex-wrap">{pageLinks}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
