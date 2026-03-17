'use server'

import { getBasket } from "@/lib/baskets/basket";
import { setItemQuantity, removeBasketItem, placeOrder, setEmail} from "@/app/_actions/basketActions";
import BasketListComponent from "@/components/basket/BasketListComponent";
import ButtonRose from "@/components/ui/button";
import { createServer } from "@/lib/supabase/server";

export default async function BasketPage() {

  const basket = await getBasket()
  const supabase = await createServer();
  const {data: {user}} = await supabase.auth.getUser();
  const {data: profile} = await supabase.from('profiles').select('id, email').eq('id', user?.id).single();

  const subTotals = basket?.map((i) => {
    const calc = i.quantity * i.items.price
    return calc
  });

  const total = subTotals?.reduce((a, b) => a + b, 0)

  return (
    <div className="relative mx-auto w-full max-w-7xl p-5 md:px-6">
      <div className="relative mb-6">
        <h1 className="text-2xl font-semibold text-rose-900 md:text-3xl">Your Basket</h1>
        <p className="text-sm text-rose-700/80 md:text-base">Review items and place your order when ready.</p>
      </div>
      <div className="relative">
        {basket && basket?.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="flex flex-col gap-2">
              <BasketListComponent basket={basket} setItemQuantity={setItemQuantity} removeBasketItem={removeBasketItem}/>
            </div>
            <aside className="h-fit rounded-2xl border border-rose-100 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(190,24,93,0.6)]">
              <div className="mb-3 border-b border-rose-100 pb-3">
                <h2 className="text-lg font-semibold text-rose-900">Order Summary</h2>
              </div>
              <div className="flex justify-between p-1 text-sm text-stone-600">
                  <p>Items:</p>
                  <p>{basket.length}</p>
              </div>
              <div className="flex justify-between p-1 text-base font-semibold text-rose-800">
                  <p>Total:</p>
                  <p>R {total?.toFixed(2)}</p>
              </div>
              <div className="my-4 h-px bg-rose-100" />
              {user?.is_anonymous && profile?.email === null ? (
                <form action={setEmail} className="space-y-2">
                  <p className="text-xs text-stone-600">Please provide an email address for your order:</p>
                  <div className="my-2">
                  <input className='w-full rounded-md border border-rose-200 p-2 focus:border-rose-400 focus:outline-none' type="text" name="email" aria-label="Please provide an email address for your order" placeholder="john@mail.com"></input>
                  <input type="hidden" name="id" value={profile?.id} />
                  </div>
                  <ButtonRose type="submit" variant="secondary1">Sumbit Email</ButtonRose>
                </form>
              ) : (
                <form action={placeOrder} className="w-full">
                  <input type="hidden" name="basket_id" value={basket[0]?.basket_id} />
                  <ButtonRose type="submit" variant="secondary1">Place Order</ButtonRose>
                </form>
              )}
              <p className="mt-4 text-xs text-stone-500">All orders are made to order and can take up to two weeks to be completed.</p>
            </aside>
          </div>
        ) : <div className="flex justify-center items-center h-200">
          <h1>No items in basket!</h1>
        </div> }
      </div>
    </div>
  );
}
