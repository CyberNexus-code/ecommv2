'use client'

import Link from "next/link"
import { UserCircleIcon, Bars3Icon, ShoppingCartIcon } from "@heroicons/react/24/outline"
import { Popover, PopoverButton, PopoverPanel, CloseButton } from "@headlessui/react"
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { type User} from "@supabase/supabase-js"



export default function Nav(){

  const [currentUser, setCurrentUser] =  useState<User | null>(null)

  const supabase = createClient();

  useEffect(() => {
    
      const { data: { subscription }} =  supabase.auth.onAuthStateChange((event, session) => {
        setCurrentUser(session?.user ?? null)
      })

      //console.log(user)
    return () => {
      subscription.unsubscribe()
    }

  },[])

  function Logout(){
    supabase.auth.signOut();
    setCurrentUser(null);
  }

  return <div className="color-primary p-4 md:p-4">
    <nav>
      <div className="hidden md:flex justify-between">
        {/* Desktop Nav */}
        <Link href="/"><img src="/logo2.png" alt="Cute & Creative Toppers" className="absolute -top-4 md:-top-5 -left-7 md:left-4 h-28 w-auto"/></Link>
          <div className="w-1/3 flex justify-around items-center">
            <Popover>
              <PopoverButton className="block text-white focus:outline-none data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-shadow-xs text-shadow-white">
                Products
              </PopoverButton>
              <PopoverPanel transition anchor="bottom"
                className="divide-y divide-white bg-rose-700 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:--spacing(5)] data-closed:-translate-y-1 data-closed:opacity-50"
                >
                  <div className="p-3 z-1000">
                    <CloseButton  as={Link} href="/products" className="color-secondary block px-3 py-2 transition hover:bg-white/20 z-1001">All Products</CloseButton>
                    <CloseButton  as={Link} href="/products/cake-toppers" className="color-secondary block px-3 py-2 transition hover:bg-white/20 z-1001">Cake Toppers</CloseButton>
                    <CloseButton as={Link} href="/products/party-boxes" className="color-secondary block px-3 py-2 transition hover:bg-white/20 z-1001">Party Boxes</CloseButton>
                  </div>
              </PopoverPanel>
            </Popover>
            <Link className="color-secondary hover:text-shadow-xs text-shadow-white" href="/about">About us</Link>
            <Link className="color-secondary hover:text-shadow-xs text-shadow-white" href="/contact">Contact Us</Link>
          </div>
          {!currentUser || null || currentUser.is_anonymous ? (<Link className="flex color-secondary hover:text-shadow-sm text-shadow-white" href="/login">Hello, Log in<UserCircleIcon className="size-6"/></Link>) : 
          (<div className="flex justify-around items-center">
            <Link href="/basket" className="group flex justify-center rounded-sm items-center border border-white px-6 py-2 mr-2 bg-transparent text-white hover:bg-white hover:text-rose-700 transition-colors">
              <ShoppingCartIcon className="size-6"/>
            </Link>
            <Popover>
            <PopoverButton className="block text-white focus:outline-none data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-shadow-xs text-shadow-white">
              <div className="flex">
                {`Hi, ${currentUser.user_metadata?.display_name}!`}<UserCircleIcon className="size-6 ml-2"/>
              </div>
              </PopoverButton>
                <PopoverPanel transition anchor="bottom" className="divide-y divide-white bg-rose-700 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:--spacing(5)] data-closed:-translate-y-1 data-closed:opacity-50">
                  <CloseButton as={Link} className="color-secondary block px-3 py-2 transition hover:bg-white/20 z-1001" href="/account">Account</CloseButton>
                  <CloseButton as={Link} onClick={() => Logout()} className="color-secondary block px-3 py-2 transition hover:bg-white/20 z-1001" href="/">Logout</CloseButton>
                </PopoverPanel>
            </Popover>
          </div>)}
      </div>
      <div className="flex w-screen h-12 justify-end px-10 md:hidden">
        {/* Mobile Nav*/}
        <Link href="/"><img src="/logo2.png" alt="Cute & Creative Toppers" className="absolute -top-4 md:-top-5 -left-7 md:left-4 h-28 w-auto"/></Link>
         <div className="">
          <Popover>
            <PopoverButton className="block text-white focus:outline-none data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-shadow-xs text-shadow-white">
              <Bars3Icon className="size-10" />
            </PopoverButton>
            <PopoverPanel 
              transition 
              anchor="bottom"
              className="divide-y divide-white bg-rose-700 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:--spacing(5)] data-closed:-translate-y-1 data-closed:opacity-50"
              >
               <div className="p-3">
                  <CloseButton as={Link} href="/products" className="color-secondary block px-3 py-2 transition hover:bg-white/20">
                    All Products
                  </CloseButton>
                  <CloseButton as={Link} href="/products/cake-toppers" className="color-secondary block px-3 py-2 transition hover:bg-white/20">
                    Cake Toppers
                  </CloseButton>
                  <CloseButton as={Link} href="/products/party-boxes" className="color-secondary block px-3 py-2 transition hover:bg-white/20">
                    Party Boxes
                  </CloseButton>
                  <CloseButton as={Link} href="/about" className="color-secondary block px-3 py-2 transition hover:bg-white/20">
                    About us
                  </CloseButton>
                  <CloseButton as={Link} href="/contact" className="color-secondary block px-3 py-2 transition hover:bg-white/20">
                    Contact Us
                  </CloseButton>
                  {!currentUser || null ? (<CloseButton as={Link} className="color-secondary hover:text-shadow-sm text-shadow-white" href="/login"><UserCircleIcon className="size-6"/>Login</CloseButton>) : (<CloseButton as={Link} className="flex color-secondary hover:text-shadow-sm text-shadow-white" href="/basket"><UserCircleIcon className="size-6 mx-2 "/> Logout</CloseButton>)}
                </div>
            </PopoverPanel>
          </Popover>
        </div>
      </div>
    </nav>
  </div>
}