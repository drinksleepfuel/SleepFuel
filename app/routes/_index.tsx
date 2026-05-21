import {redirect} from 'react-router';
import type {Route} from './+types/_index';
import {PRODUCT} from '~/lib/sleepfuelProduct';

/**
 * SleepFuel has a single product, and that product page IS the landing
 * page for paid media ads. Redirect the root to it.
 */
export async function loader(_args: Route.LoaderArgs) {
  throw redirect(`/products/${PRODUCT.handle}`);
}

export default function Index() {
  return null;
}
