'use server'

import { getBasket } from "@/lib/baskets/basket";
import { setItemQuantity, removeBasketItem } from "@/app/_actions/basketActions";
import { setAddress } from "@/app/_actions/authActions";
import BasketListComponent from "@/components/basket/BasketListComponent";
import GuestCheckoutEmailForm from "@/components/basket/GuestCheckoutEmailForm";
import PlaceOrderForm from "@/components/basket/PlaceOrderForm";
import ButtonRose from "@/components/ui/button";
import { hasRegisteredAccountEmail } from "@/lib/auth/accountLookup";
import { getBusinessSettings } from "@/lib/businessSettings";
import { createServer } from "@/lib/supabase/server";

export default async function BasketPage() {

  const [basket, settings] = await Promise.all([getBasket(), getBusinessSettings()])
  const supabase = await createServer();
  const {data: {user}} = await supabase.auth.getUser();
  const {data: profile} = await supabase.from('profiles').select('id, email, delivery_address, postal_code, city').eq('id', user?.id).single();
  const guestShouldSignIn = Boolean(
    user?.is_anonymous &&
    profile?.email &&
    profile?.id &&
    await hasRegisteredAccountEmail(profile.email, profile.id)
  );

  const subTotals = basket?.map((i) => {
    const calc = i.quantity * i.items.price
    return calc
  });

  const itemsSubtotal = subTotals?.reduce((a, b) => a + b, 0) ?? 0
  const deliveryTotal = basket && basket.length > 0 ? settings.standard_delivery_rate : 0
  const total = itemsSubtotal + deliveryTotal

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
              <div className="mb-3 border-b border-rose-100 pb-3">
                <h2 className="text-lg font-semibold text-rose-900">Deliver to:</h2>
                <div className="flex justify-between p-1 text-base font-semibold text-rose-800">
                    {profile?.delivery_address && profile.postal_code ? 
                    <div>
                      <div>
                      <p>{profile.delivery_address}</p>
                      <p>{profile.city}</p>
                      <p>{profile.postal_code}</p>
                      </div>
                      <p className="mt-4 text-xs font-thin text-stone-500">
                        Please ensure your delivery address is complete and correct. Cute & Creative Toppers is not
                        responsible for failed, delayed, or misdirected delivery caused by incorrect customer-provided
                        address information.
                      </p>
                    </div>
                       :
                      <p>No Delivery Address Set</p>
                    }
                </div>
              </div>
              <div className="flex justify-between p-1 text-sm text-stone-600">
                  <p>Items:</p>
                  <p>{basket.length}</p>
              </div>
                <div className="flex justify-between p-1 text-sm text-stone-600">
                  <p>Items subtotal:</p>
                  <p>R {itemsSubtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between p-1 text-sm text-stone-600">
                  <p>Standard delivery:</p>
                  <p>R {deliveryTotal.toFixed(2)}</p>
                </div>
              <div className="flex justify-between p-1 text-base font-semibold text-rose-800">
                  <p>Total:</p>
                  <p>R {total.toFixed(2)}</p>
              </div>
              <div className="my-4 h-px bg-rose-100" />
              {user?.is_anonymous && profile?.id && (profile?.email === null || guestShouldSignIn) ? (
                <GuestCheckoutEmailForm
                  profileId={profile.id}
                  initialEmail={profile?.email ?? ''}
                  requiresSignIn={guestShouldSignIn}
                />
              ) : (
                  profile?.delivery_address && profile.postal_code ? 
                  <PlaceOrderForm basketId={basket[0]?.basket_id ?? ''} /> :
                  <form action={setAddress} className="w-full flex flex-col gap-2 font-semibold text-rose-900">
                    <input type="hidden" name="profile_id" value={profile?.id} />
                    <label>Street No:</label>
                    <input className='w-1/3 rounded-md border border-rose-200 p-2 focus:border-rose-400 focus:outline-none' type="text" name="street_no" required/>
                    <label>Street Name:</label>
                    <input className='w-full rounded-md border border-rose-200 p-2 focus:border-rose-400 focus:outline-none' type="text" name="street_name" required/>
                    <label>Town/City</label>
                    <input className='w-full rounded-md border border-rose-200 p-2 focus:border-rose-400 focus:outline-none' type="text" name="city" required/>
                    <label>Postal Code</label>
                    <input className='w-1/3 rounded-md border border-rose-200 p-2 focus:border-rose-400 focus:outline-none' type="text" inputMode="numeric" pattern="\d*" name="postal_code"  required/>
                    <p className="text-xs font-normal leading-5 text-stone-500">
                      Please double-check your delivery details before saving them. Incorrect or incomplete address
                      information can delay delivery and remains the customer&apos;s responsibility.
                    </p>
                    <ButtonRose type="submit" variant="secondary1">Set Address</ButtonRose>
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
