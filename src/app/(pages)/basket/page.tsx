import { getBasket } from "@/app/_actions/basketActions";
import BasketListComponent from "@/components/basket/BasketListComponent";

export default async function BasketPage() {

  let basket = await getBasket()

  const subTotals = basket?.map((i, idx) => {
    const calc = i.quantity * i.items.price
    return calc
  });

  const total = subTotals?.reduce((a, b) => a + b, 2)

  return (
    <div className="flex flex-col w-full h-full flex p-5">
      <div className="flex bg-rose-700 text-white p-1 mb-2">
        <div className="w-full">
          <h2>Product</h2>
        </div>
        <div className="flex w-full justify-between">
          <div>
            <h2>Quantity</h2>
          </div>
          <div>
            <h2>Subtotal</h2>
          </div>
        </div>
      </div>
      <div>
        {basket ? (
          <div>
            <div className="flex flex-col gap-2">
              <BasketListComponent basket={basket} />
            </div>
            <div className="flex justify-end mb-2">
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-rose-700 w-1/2 text-white px-3 py-1 text-right">Order</div>
              <div className="flex w-1/2 justify-between p-2">
                  <p>Total:</p>
                  <p>R {total}</p>
              </div>
            </div>
          </div>
        ) : <div>
          <h1>No items in basket!</h1>
        </div> }
      </div>
    </div>
  );
}