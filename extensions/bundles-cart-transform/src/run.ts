import type {
  RunInput,
  FunctionRunResult,
  CartLine,
  CartOperation
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
      })
    ]
  };
};