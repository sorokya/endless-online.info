import { data } from 'react-router';
import { getItems } from '~/.server/items';

export async function loader() {
  const items = await getItems();
  const shops = [];

  for (const item of items) {
    if (item.craftables) {
      for (const craftable of item.craftables) {
        if (shops.indexOf(craftable.shopName) === -1) {
          shops.push(craftable.shopName);
        }
      }
    }

    if (item.soldBy) {
      for (const soldBy of item.soldBy) {
        if (shops.indexOf(soldBy.soldByName) === -1) {
          shops.push(soldBy.soldByName);
        }
      }
    }
  }

  return data(shops);
}
