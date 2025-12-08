import { link } from "../shared/links"
import { Avatar, AvatarFallback } from "./ui/avatar"

export const Header = () => {
  return (
    <header className="py-5 px-page-side h-20 flex justify-between items-center border-b-1 border-border mb-12">
      {/* left side */}
      <div className="flex items-center gap-8">
        <a
          href={link("/")}
          className="flex items-center gap-3 font-display font-bold text-3xl"
        >
          <img
            src="/images/logo.svg"
            alt="ApplyWize Logo"
            className="pt-5 -mb-3"
          />
          <span>Apply Wize</span>
        </a>
        <nav>
          <ul>
            <li>
              <a href={link("/applications")}>Dashboard</a>
            </li>
          </ul>
        </nav>
      </div>

      {/* right side */}
      <div>
        <nav>
          <ul className="flex items-center gap-7">
            <li>
              <a href={link("/settings")}>Settings</a>
            </li>
            <li>
              <a href={link("/auth/logout")}>Logout</a>
            </li>
            <li>
              <a href={link("/account")} aria-label="Account">
                <Avatar>
                  <AvatarFallback>R</AvatarFallback>
                </Avatar>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
