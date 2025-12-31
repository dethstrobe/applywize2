import { type LayoutProps } from "rwsdk/router"
import { Header } from "@/app/components/Header"
import { Toaster } from "@/app/components/ui/sonner"

export const InteriorLayout = ({ children }: LayoutProps) => {
  return (
    <div className="page-wrapper">
      <div className="page bg-white">
        <Header />
        <div className="px-page-side">{children}</div>
        <Toaster
          position="top-right"
          richColors
          expand
          visibleToasts={4}
          closeButton
        />
      </div>
    </div>
  )
}
