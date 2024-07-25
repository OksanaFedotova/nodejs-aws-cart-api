import { Cart, CartItem } from '../models';

/**
 * @param {Cart} cart
 * @returns {number}
 */
export function calculateCartTotal(cart): number {
  return cart?.items?.length
    ? cart.items.reduce(
        (acc: number, { count }: CartItem) => {
          return (acc += count);
        },
        0,
      )
    : 0;
}
