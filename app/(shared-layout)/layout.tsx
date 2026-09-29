import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Navbar } from "@/components/web/navbar";
import { AppSidebar } from "@/components/web/sidebar";
import { ReactNode } from "react";
import { PageTransition } from "@/components/motion";

export default function SharedLayout({children} : {children :ReactNode}){
    return(
        <>
            <SidebarProvider >
                <AppSidebar />
                    <SidebarInset>
                    <Navbar />
                    <PageTransition>{children}</PageTransition>
                    </SidebarInset>
            </SidebarProvider>
        </>
    )
}