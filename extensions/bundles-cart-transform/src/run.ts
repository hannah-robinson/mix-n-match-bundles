import type {
  RunInput,
  FunctionRunResult,
  CartLine,
  CartOperation,
  Product,
  ProductVariant
} from "../generated/api";

export function run(input: RunInput): FunctionRunResult {
  const groupedItems: Record<string, Pick<CartLine, "id" | "quantity">[] > = {};
  
  input.cart.lines.forEach(line => {
    const bundleId = line.bundleId;
    if(bundleId && bundleId.value){
      if(!groupedItems[bundleId.value]){
        groupedItems[bundleId.value] = []
      }
      groupedItems[bundleId.value].push(line);
    }
  })

  const itemsWithNoBundleId = input.cart.lines.filter( line => !!line.bundleId?.value === false)
  return {
    operations: [
      ...Object.values(groupedItems).map(group => {
        const mergeOperation: CartOperation = {
          merge: {
            cartLines: group.map(line => {
              return { cartLineId: line.id,
                quantity: line.quantity
              }
            }),
            parentVariantId: "gid://shopify/ProductVariant/48071724564782"  
          }
        }
        return mergeOperation
      }),
      ...itemsWithNoBundleId.map(item => {
        const expandOperation: CartOperation = {
          expand: {
            cartLineId: item.id,
            expandedCartItems: [
              {
                merchandiseId: (item.merchandise as ProductVariant).id,
                quantity: item.quantity,
                price: {
                  adjustment: {
                    fixedPricePerUnit: {
                      amount: item.cost.totalAmount.amount
                    }
                  }
                }
              },
              {
                merchandiseId: "gid://shopify/ProductVariant/46557034053934",
                quantity: item.quantity,
                price: {
                  adjustment: {
                    fixedPricePerUnit: {
                      amount: 1
                    }
                  }
                }
              }
            ],
            title: `${(item.merchandise as ProductVariant).product.title} + Free Sticker`
          }
        }
        return expandOperation;
      })
      // {
      //   update: {
      //     cartLineId: input.cart.lines[0].id,
      //     title: `${(input.cart.lines[0].merchandise as ProductVariant).product.title} – Updated`,
      //     "image": {
      //       "url": "https://cdn.shopify.com/[...]/custom-image.png"
      //     },
      //     "price": {
      //       "adjustment": {
      //         "fixedPricePerUnit": {
      //           "amount": "100"
      //         }
      //       }
      //     }
      //   } 
      // }
    ]
  };
};  