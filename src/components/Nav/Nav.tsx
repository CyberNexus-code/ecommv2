'use client'

import Image from "next/image";
import Link from "next/link";
import { UserCircleIcon, Bars3Icon, ShoppingCartIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Popover, PopoverButton, PopoverPanel, CloseButton } from "@headlessui/react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";
import { type User } from "@supabase/supabase-js";
import { logout } from "@/app/_actions/authActions";
import type { CategoryType } from "@/types/categoryType";
import logo2 from "../../../public/logo2.png";

type NavProps = {
  categories: CategoryType[];
};

export default function Nav({ categories }: NavProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function resolveRole(user: User | null) {
      if (!user) {
        setRole(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Unable to resolve role:", error.message);
      }
      setRole(data?.role ?? null);
    }

    async function initializeUser() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      setCurrentUser(user);
      await resolveRole(user);
    }

    initializeUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      await resolveRole(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const isGuest = !currentUser || currentUser.is_anonymous;

  function formatName(name: string) {
    return name
      .replace(/-/g, " ")
      .split(" ")
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
      .join(" ");
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
                  href={`/products/${c.name}`}
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

          {isGuest ? (
            <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white hover:text-rose-700">
              Log in
              <UserCircleIcon className="size-5" />
            </Link>
          ) : (
            <Popover className="relative">
              <PopoverButton className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-white hover:text-rose-700">
                {`Hi, ${currentUser.user_metadata?.display_name ?? "there"}`}
                <UserCircleIcon className="size-5" />
              </PopoverButton>
              <PopoverPanel anchor="bottom end" className="z-50 mt-2 w-44 rounded-xl border border-rose-200 bg-white p-2 shadow-lg">
                <CloseButton as={Link} href="/account" className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50">
                  Account
                </CloseButton>
                <form action={logout}>
                  <button type="submit" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-800 transition hover:bg-rose-50">
                    Logout
                  </button>
                </form>
              </PopoverPanel>
            </Popover>
          )}
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 md:hidden">
          <Popover className="relative">
            <PopoverButton className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-white/10 p-1.5 text-white">
              <Bars3Icon className="size-6" />
            </PopoverButton>
            <PopoverPanel anchor="bottom end" className="z-50 mt-2 w-[88vw] max-w-sm rounded-xl border border-rose-200 bg-white p-3 shadow-lg">
              <div className="mb-2 flex items-center justify-between border-b border-rose-100 pb-2">
                <p className="text-sm font-semibold text-rose-800">Menu</p>
                <Link href="/basket" className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
                  <ShoppingCartIcon className="size-4" /> Basket
                </Link>
              </div>

              {currentUser && role === "admin" ? (
                <CloseButton as={Link} href="/dashboard" className="mb-1 block rounded-lg px-3 py-2 text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                  Dashboard
                </CloseButton>
              ) : null}

              <CloseButton as={Link} href="/products" className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50">
                All Products
              </CloseButton>
              {categories.map((c) => (
                <CloseButton
                  as={Link}
                  key={`mobile-${c.id}`}
                  href={`/products/${c.name}`}
                  className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50"
                >
                  {formatName(c.name)}
                </CloseButton>
              ))}

              <CloseButton as={Link} href="/about" className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50">
                About
              </CloseButton>
              <CloseButton as={Link} href="/contact" className="block rounded-lg px-3 py-2 text-sm text-rose-800 transition hover:bg-rose-50">
                Contact
              </CloseButton>

              <div className="mt-2 border-t border-rose-100 pt-2">
                {isGuest ? (
                  <CloseButton as={Link} href="/login" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                    <UserCircleIcon className="size-5" /> Log in
                  </CloseButton>
                ) : (
                  <form action={logout}>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-800 transition hover:bg-rose-50">
                      <UserCircleIcon className="size-5" /> Logout
                    </button>
                  </form>
                )}
              </div>
            </PopoverPanel>
          </Popover>
        </div>
      </nav>
    </header>
  );
}
