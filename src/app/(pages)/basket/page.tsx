'use server'

import { getBasket } from "@/lib/supabase/basket";
import { setItemQuantity, removeBasketItem, placeOrder } from "@/app/_actions/basketActions";
import BasketListComponent from "@/components/basket/BasketListComponent";
import ButtonRose from "@/components/ui/button";

export default async function BasketPage() {

  const basket = await getBasket()

  

  const subTotals = basket?.map((i, idx) => {
    const calc = i.quantity * i.items.price
    return calc
  });

  const total = subTotals?.reduce((a, b) => a + b, 2)

  return (
    <div className="flex flex-col w-full h-full flex p-5">
      <div className="flex bg-rose-700 text-white p-1 mb-2">
        <div className="w-full px-1">
          <h2>Product</h2>
        </div>
        <div className="flex w-full justify-between">
          <div>
            <h2>Quantity</h2>
          </div>
          <div className="px-1">
            <h2>Subtotal</h2>
          </div>
        </div>
      </div>
      <div>
        {basket ? (
          <div>
            <div className="flex flex-col gap-2">
              <BasketListComponent basket={basket} setItemQuantity={setItemQuantity} removeBasketItem={removeBasketItem}/>
            </div>
            <div className="flex justify-end mb-2">
            </div>
            <div className="flex flex-col items-end">
              <div className="bg-rose-700 w-1/2 text-white px-3 py-1 text-right">{`Order (incl. Vat)`}</div>
              <div className="flex w-1/2 justify-between p-2">
                  <p>Total:</p>
                  <p>R {total?.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <form action={placeOrder}>
                <input type="hidden" name="basket_id" value={basket[0].basket_id} />
                <ButtonRose type="submit" variant="secondary1">Place Order</ButtonRose>
              </form>
            </div>
            <div className="flex justify-center p-10">
              <p>Please note that all oreders are <span className="font-bold">made to order</span> and can take up to <span className="font-bold">two weeks</span> to be completed</p>
            </div>
          </div>
        ) : <div>
          <h1>No items in basket!</h1>
        </div> }
      </div>
    </div>
  );
}