import { Welcome } from "./Welcome.js"
import type { RequestInfo } from "rwsdk/worker"

export const Home = ({ ctx }: RequestInfo) => {
  // _Feel free to delete this element and its import_
  return (
    <div>
      <Welcome />
      <p>
        <a href="/auth/logout">Logout</a>
      </p>
    </div>
  )
}
