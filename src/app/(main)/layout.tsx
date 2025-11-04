"use client"

import type { ReactNode } from "react"
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Footer } from "@/components/footer"
import GoogleTranslate from "@/components/GoogleTranslate"

function LayoutContent({ children }: { children: ReactNode }) {
  const { state } = useSidebar()

  // expanded = sidebar width 256px (16rem)
  // collapsed = sidebar width 0
  const paddingLeft = state === "collapsed" ? 0 : 256

  return (
    <div style={{ paddingLeft, transition: "padding-left 300ms" }} className="flex flex-col min-h-screen">
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
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>

      <SidebarInset>
        <LayoutContent>
          {children}
        </LayoutContent>
      </SidebarInset>
    </SidebarProvider>
  )
}
