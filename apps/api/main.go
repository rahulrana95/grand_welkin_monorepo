// Minimal Go service demonstrating that the SAME proto drives Go types.
// Rename a field in cart.proto and regenerate, and this file stops compiling —
// identical contract-safety guarantee as the TypeScript consumer, one source.
package main

import (
	"fmt"

	cartv1 "github.com/grand-welkin/monorepo/proto/acme/cart/v1"
)

// totalCents sums unit price * quantity across the cart's line items.
func totalCents(cart *cartv1.Cart) int64 {
	var sum int64
	for _, item := range cart.GetItems() {
		sum += item.GetUnitPriceCents() * int64(item.GetQuantity())
	}
	return sum
}

func main() {
	cart := &cartv1.Cart{
		Id:     "11111111-1111-1111-1111-111111111111",
		Status: cartv1.CartStatus_CART_STATUS_OPEN,
		Items: []*cartv1.LineItem{
			{ProductId: "33333333-3333-3333-3333-333333333333", Quantity: 2, UnitPriceCents: 500},
		},
	}
	fmt.Printf("cart %s total: %d cents\n", cart.GetId(), totalCents(cart))
}
