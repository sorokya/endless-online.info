import 'dotenv/config';
import fs from 'node:fs/promises';

const API_RESOURCES = [
  'classes',
  'items',
  'maps',
  'npcs',
  'spells',
  'quests',
  'shops',
];

export async function refresh(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (!key || key !== process.env.API_REFRESH_KEY) {
    throw new Response('Denied', { status: 403 });
  }

  await fs.mkdir('data', { recursive: true });

  for (const resource of API_RESOURCES) {
    const response = await fetch(
      `https://eor-api.exile-studios.com/api/${resource}/dump`,
    );
    const data = await response.text();
    await fs.writeFile(`data/${resource}.json`, data, 'utf8');
  }
}
