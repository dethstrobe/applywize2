import { type LayoutProps } from "rwsdk/router"
import { Header } from "@/app/components/Header"

export const InteriorLayout = ({ children }: LayoutProps) => {
  return (
    <div className="page-wrapper">
      <div className="page bg-white">
        <Header />
        <div className="px-page-side">{children}</div>
      </div>
    </div>
  )
}
