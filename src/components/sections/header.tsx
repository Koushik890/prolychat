"use client";

import { Logo } from "@/components/ui/logo";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [addBorder, setAddBorder] = useState(false);
  const [menuState, setMenuState] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setAddBorder(true);
      } else {
        setAddBorder(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-50 py-2 bg-background/60 backdrop-blur font-mona"
      }
    >
      <div className="flex justify-between items-center container mx-auto">
        <Link
          href="/"
          title="brand-logo"
          className="relative mr-6 flex items-center space-x-2"
        >
          <Logo collapsed={false} />
        </Link>

        <div className="hidden lg:block">
          <div className="flex items-center">
            <nav className="mr-10">
              <div className="flex items-center space-x-6">
                <Link href="/#features" className="text-foreground hover:text-primary transition-colors font-mona">
                  Features
                </Link>
                <Link href="/#pricing" className="text-foreground hover:text-primary transition-colors font-mona">
                  Pricing
                </Link>
                <Link href="/blog" className="text-foreground hover:text-primary transition-colors font-mona">
                  Blog
                </Link>
              </div>
            </nav>

            <div className="gap-2 flex">
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "outline" }), "font-mona")}
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "w-full sm:w-auto text-background flex gap-2 font-mona"
                )}
              >
                <Logo className="h-6 w-6" collapsed={true} />
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-2 cursor-pointer block lg:hidden">
          <button
            onClick={() => setMenuState(!menuState)}
            aria-label={menuState ? 'Close Menu' : 'Open Menu'}
            className="relative z-20 -m-3 -mr-4 block cursor-pointer p-3"
          >
            <Menu className={cn("size-7 duration-200", menuState && "rotate-180 scale-0 opacity-0")} />
            <X className={cn("absolute inset-0 m-auto size-7 -rotate-180 scale-0 opacity-0 duration-200", menuState && "rotate-0 scale-100 opacity-100")} />
          </button>
        </div>
      </div>
      <hr
        className={cn(
          "absolute w-full bottom-0 transition-opacity duration-300 ease-in-out",
          addBorder ? "opacity-100" : "opacity-0"
        )}
      />
    </header>
  );
}

