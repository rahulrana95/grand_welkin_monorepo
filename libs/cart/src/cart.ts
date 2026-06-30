// Business logic that consumes the GENERATED cart types.
//
// The import below resolves to the TypeScript produced by
// //proto/acme/cart/v1:cart_ts_proto (Protobuf-ES). Under Bazel this edge is a
// `deps` entry; for non-Bazel/editor use it resolves via the generated output
// (gen/ts/...) — Gazelle keeps the Bazel dep in sync with this import.
//
// The point of this file: if a field is renamed/removed in cart.proto and the
// types are regenerated, the lines that touch it stop compiling — a breaking
// schema change becomes a `tsc` error here, caught in CI before merge.
import type { Cart, LineItem } from "../../../proto/acme/cart/v1/cart_pb.js";

/** Total price of a cart in minor units (cents). */
export function cartTotalCents(cart: Cart): bigint {
  return cart.items.reduce(
    (sum: bigint, item: LineItem) => sum + item.unitPriceCents * BigInt(item.quantity),
    0n,
  );
}

/** Whether the cart can still be modified. */
export function isEditable(cart: Cart): boolean {
  switch (cart.status) {
    case "CART_STATUS_OPEN":
      return true;
    case "CART_STATUS_CHECKED_OUT":
    case "CART_STATUS_ABANDONED":
    case "CART_STATUS_UNSPECIFIED":
      return false;
    default:
      // Exhaustive: a new CartStatus added to the proto makes this a compile error.
      return cart.status satisfies never;
  }
}
