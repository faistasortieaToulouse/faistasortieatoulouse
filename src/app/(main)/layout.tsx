'use client'

import type { ReactNode } from 'react'
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Footer } from '@/components/footer'
import GoogleTranslate from '@/components/GoogleTranslate'

function MainWrapper({ children }: { children: ReactNode }) {
  const { state } = useSidebar()                      // <= clé
  const isCollapsed = state === "collapsed"           // shadcn v2

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-0' : 'ml-64'}`}>
      <header className="relative z-10 flex justify-between p-2 bg-background shadow-sm">
        <SidebarTrigger />
        <div className="w-48">
          <GoogleTranslate />
        </div>
      </header>

      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  )
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <AppSidebar />
      </Sidebar>

      <SidebarInset>
        <MainWrapper>
          {children}
        </MainWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
