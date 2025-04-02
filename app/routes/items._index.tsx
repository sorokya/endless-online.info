import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Route } from './+types/items._index';

import { useDebounce } from '@uidotdev/usehooks';
import { Form, Link, data } from 'react-router';
import { getItemList } from '~/.server/items';
import { CONFIG } from '~/config';

export function links() {
  return [{ rel: 'canonical', href: 'https://endless-online.info/items' }];
}

export function meta() {
  return [
    { title: 'EOR Database - Items' },
    { name: 'og:title', content: 'EOR Database - Items' },
    { name: 'og:url', content: 'https://endless-online.info/items' },
    { name: 'og:image', content: 'https://endless-online.info/icon.png' },
    {
      name: 'og:description',
      content: 'Endless Online Item Search',
    },
    {
      name: 'description',
      content: 'Endless Online Item Search',
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

  const items = await getItemList(search);
  return data({
    items,
    search,
  });
}

export default function Items({ loaderData }: Route.ComponentProps) {
  const { items, search } = loaderData;

  const [name, setName] = useState(search.name);
  const [type, setType] = useState(search.type);
  const [page, setPage] = useState(search.page);

  const pageCount = useMemo(
    () => Math.ceil(items.count / CONFIG.PAGE_SIZE),
    [items],
  );

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
            <option value="0">Static</option>
            <option value="1">General</option>
            <option value="2">Money</option>
            <option value="3">Potion</option>
            <option value="4">Teleport</option>
            <option value="5">Transformation</option>
            <option value="6">EXP Reward</option>
            <option value="7">Skill Book</option>
            <option value="8">Reserved</option>
            <option value="9">Key</option>
            <option value="10">Weapon</option>
            <option value="11">Shield</option>
            <option value="12">Clothing</option>
            <option value="13">Hat</option>
            <option value="14">Boots</option>
            <option value="15">Gloves</option>
            <option value="16">Accessory</option>
            <option value="17">Belt</option>
            <option value="18">Necklace</option>
            <option value="19">Ring</option>
            <option value="20">Bracelet</option>
            <option value="21">Bracer</option>
            <option value="22">Costume</option>
            <option value="23">Costume Hat</option>
            <option value="24">Wings</option>
            <option value="25">Buddy</option>
            <option value="26">Buddy 2</option>
            <option value="27">Torch</option>
            <option value="28">Beverage</option>
            <option value="29">Effect</option>
            <option value="30">Hairdye</option>
            <option value="31">Hairtool</option>
            <option value="32">Cure</option>
            <option value="33">Title</option>
            <option value="34">Visual Document</option>
            <option value="35">Audio Document</option>
            <option value="36">Transport Ticket</option>
            <option value="37">Fireworks</option>
            <option value="38">Explosive</option>
            <option value="39">Buff</option>
            <option value="40">Debuff</option>
          </select>
        </div>

        <input name="page" type="hidden" value={page} />

        <div className="mt-6">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </Form>
      {items.records.length === 0 ? (
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
            {items.records.map((item) => (
              <Link
                to={`/items/${item.id}`}
                key={item.id}
                className="card bg-base-200 p-4 shadow-xl"
              >
                <img
                  src={`https://eor-api.exile-studios.com/api/items/${item.id}/graphic/ground`}
                  alt={item.name}
                  className="transform-[scale(2)] mx-auto mt-4"
                />
                <div className="mt-2 text-center font-bold">{item.name}</div>
                <div className="flex flex-col items-center text-xs opacity-75">
                  {item.meta.map((meta) => (
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
