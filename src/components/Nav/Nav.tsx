'use client'

import Image from "next/image";
import Link from "next/link";
import { UserCircleIcon, Bars3Icon, ShoppingCartIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverButton, PopoverPanel, CloseButton } from "@headlessui/react";
import { getCategoryPath } from "@/lib/items/categories";
import type { CategoryType } from "@/types/categoryType";
import logo2 from "../../../public/logo2.png";
import { useAuth } from "@/lib/auth/context";

type NavProps = {
  categories: CategoryType[];
};

export default function Nav({ categories }: NavProps) {
  const { user: currentUser, role, displayName, signOut } = useAuth();

  const isAnonymousGuest = !!currentUser?.is_anonymous;
  const hasSession = !!currentUser;
  const showLoginCta = !hasSession;

  function formatName(name: string) {
    return name
      .replace(/-/g, " ")
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
      .join(" ");
  }

  async function handleSignOut() {
    await signOut();
  }

  return (
    <header className="color-primary sticky top-0 z-40 overflow-visible border-b border-rose-600/80 py-2 shadow-[0_6px_20px_-16px_rgba(15,23,42,0.9)] md:px-6">
      <Link
        href="/"
        className="absolute top-2 left-1 z-50 -translate-y-1/2 md:left-5 md:top-8 md:-translate-y-[54%]"
        aria-label="Home"
      >
        <Image
          src={logo2}
          alt="Cute & Creative Toppers"
          className="block h-20 w-auto object-contain md:h-30 mt-10"
          priority
        />
      </Link>

      <nav className="flex min-h-[44px] w-full items-center justify-between gap-2" aria-label="Main navigation">
        <div className="hidden w-44 shrink-0 md:block" aria-hidden />

        <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {currentUser && role === "admin" ? (
            <Link href="/dashboard" className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-rose-500">
              Dashboard
            </Link>
          ) : null}

          <Popover className="relative">
            <PopoverButton className="inline-flex items-center gap-1 rounded-full px-4 py-1.5 text-sm font-medium text-white transition hover:bg-rose-600/70">
              Products
              <ChevronDownIcon className="size-4" />
            </PopoverButton>
            <PopoverPanel anchor="bottom start" className="z-50 mt-2 w-56 rounded-xl border border-rose-200 bg-white p-2 shadow-lg">
              <CloseButton as={Link} href="/products" className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50">
                All Products
              </CloseButton>
              {categories.map((c) => (
                <CloseButton
                  as={Link}
                  key={c.id}
                  href={getCategoryPath(c.name)}
                  className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50"
                >
                  {formatName(c.name)}
                </CloseButton>
              ))}
            </PopoverPanel>
          </Popover>

          <Link className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition hover:bg-rose-600/70" href="/about">
            About
          </Link>
          <Link className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition hover:bg-rose-600/70" href="/contact">
            Contact
          </Link>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/basket"
            className="group inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/10 p-1.5 text-white transition hover:bg-white hover:text-rose-700"
            aria-label="Basket"
          >
            <ShoppingCartIcon className="size-5" />
          </Link>

          {showLoginCta ? (
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white hover:text-rose-700">
              Log in
              <UserCircleIcon className="size-5" />
            </Link>
          ) : (
            <Popover className="relative">
              <PopoverButton className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white hover:text-rose-700">
                {isAnonymousGuest ? 'Guest account' : `Hi, ${displayName ?? "there"}`}
                <UserCircleIcon className="size-5" />
              </PopoverButton>
              <PopoverPanel anchor="bottom end" className="z-50 mt-2 w-44 rounded-xl border border-rose-200 bg-white p-2 shadow-lg">
                <CloseButton as={Link} href="/account" className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50">
                  Account
                </CloseButton>
                <CloseButton as={Link} href="/account/orders" className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50">
                  My Orders
                </CloseButton>
                {isAnonymousGuest ? (
                  <CloseButton as={Link} href="/login" className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50">
                    Log in
                  </CloseButton>
                ) : null}
                <CloseButton as="button" type="button" onClick={handleSignOut} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-800 transition hover:bg-rose-50">
                  Logout
                </CloseButton>
              </PopoverPanel>
            </Popover>
          )}
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 md:hidden">
          <Popover className="relative">
            <PopoverButton className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/10 p-1.5 text-white transition hover:bg-white/15">
              <Bars3Icon className="size-6" />
            </PopoverButton>
            <PopoverPanel anchor="bottom end" className="z-50 mt-2 w-[min(92vw,22rem)] overflow-hidden rounded-[22px] border border-rose-200 bg-white p-2.5 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.55)] sm:w-[88vw] sm:max-w-sm sm:p-3">
              <div className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto pr-1">
                <div className="mb-2 flex items-center justify-between border-b border-rose-100 pb-2">
                  <p className="text-sm font-semibold text-rose-800">Menu</p>
                  <CloseButton as={Link} href="/basket" className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 sm:px-3 sm:text-sm">
                  <ShoppingCartIcon className="size-4" /> Basket
                  </CloseButton>
                </div>

                {currentUser && role === "admin" ? (
                  <CloseButton as={Link} href="/dashboard" className="mb-1 block rounded-xl px-3 py-2.5 text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                    Dashboard
                  </CloseButton>
                ) : null}

                <CloseButton as={Link} href="/products" className="block rounded-xl px-3 py-2.5 text-sm text-rose-800 transition hover:bg-rose-50">
                  All Products
                </CloseButton>
                {categories.map((c) => (
                  <CloseButton
                    as={Link}
                    key={`mobile-${c.id}`}
                    href={getCategoryPath(c.name)}
                    className="block rounded-xl px-3 py-2.5 text-sm text-rose-800 transition hover:bg-rose-50"
                  >
                    {formatName(c.name)}
                  </CloseButton>
                ))}

                <CloseButton as={Link} href="/about" className="block rounded-xl px-3 py-2.5 text-sm text-rose-800 transition hover:bg-rose-50">
                  About
                </CloseButton>
                <CloseButton as={Link} href="/contact" className="block rounded-xl px-3 py-2.5 text-sm text-rose-800 transition hover:bg-rose-50">
                  Contact
                </CloseButton>

                <div className="mt-2 border-t border-rose-100 pt-2">
                  {showLoginCta ? (
                    <CloseButton as={Link} href="/login" className="inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                      <UserCircleIcon className="size-5" /> Log in
                    </CloseButton>
                  ) : (
                    <div className="space-y-1.5">
                      <CloseButton as={Link} href="/account" className="flex w-full items-center gap-2 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                        <UserCircleIcon className="size-5" /> {isAnonymousGuest ? 'Guest account' : `${displayName ?? 'Account'}`}
                      </CloseButton>
                      <CloseButton as={Link} href="/account/orders" className="block w-full rounded-xl border border-rose-200 px-3 py-2.5 text-left text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                        My Orders
                      </CloseButton>
                      {isAnonymousGuest ? (
                        <CloseButton as={Link} href="/login" className="block w-full rounded-xl border border-rose-200 px-3 py-2.5 text-left text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                          Log in
                        </CloseButton>
                      ) : null}
                      <CloseButton as="button" type="button" onClick={handleSignOut} className="block w-full rounded-xl border border-rose-200 px-3 py-2.5 text-left text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                        Logout
                      </CloseButton>
                    </div>
                  )}
                </div>
              </div>
            </PopoverPanel>
          </Popover>
        </div>
      </nav>
    </header>
  );
}
