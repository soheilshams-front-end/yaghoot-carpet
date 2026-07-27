"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/Toast";
import { CartProvider } from "@/components/CartProvider";
import { WishlistProvider } from "@/components/WishlistProvider";
import { LoadingProvider } from "@/components/loading/LoadingProvider";
import { RouteLoading } from "@/components/loading/RouteLoading";
import { ConfirmProvider } from "@/components/ConfirmProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LoadingProvider>
        <ConfirmProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <Suspense fallback={null}>
                  <RouteLoading />
                </Suspense>
                {children}
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </ConfirmProvider>
      </LoadingProvider>
    </SessionProvider>
  );
}
