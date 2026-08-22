import { describe, expect, it } from "vitest";
import type { Cart } from "../../../proto/acme/cart/v1/cart_pb.js";
import { cartTotalCents, isEditable } from "./cart.js";

const baseCart = (overrides: Partial<Cart> = {}): Cart =>
  ({
    id: "11111111-1111-1111-1111-111111111111",
    customerId: "22222222-2222-2222-2222-222222222222",
    status: "CART_STATUS_OPEN",
    items: [
      { productId: "33333333-3333-3333-3333-333333333333", quantity: 2, unitPriceCents: 500n },
      { productId: "44444444-4444-4444-4444-444444444444", quantity: 1, unitPriceCents: 250n },
    ],
    ...overrides,
  }) as Cart;

describe("cartTotalCents", () => {
  it("sums unit price times quantity across line items", () => {
    expect(cartTotalCents(baseCart())).toBe(1250n);
  });

  it("returns zero for an empty cart", () => {
    expect(cartTotalCents(baseCart({ items: [] }))).toBe(0n);
  });
});

describe("isEditable", () => {
  it("is editable only while the cart is open", () => {
    expect(isEditable(baseCart({ status: "CART_STATUS_OPEN" }))).toBe(true);
    expect(isEditable(baseCart({ status: "CART_STATUS_CHECKED_OUT" }))).toBe(false);
  });
});
