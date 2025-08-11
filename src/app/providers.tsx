'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { Provider } from "react-redux";
import { store } from "@/store";
import GlobalModal from '@/components/paymentModal';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    
    <SessionProvider>
      <Provider store={store}>
        <GlobalModal/>
        <Toaster />
        {children}
      </Provider>
    </SessionProvider>
  );
}