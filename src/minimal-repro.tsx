/**
 * Minimal reproduction of TS2322 in rwsdk route definitions.
 *
 * Two conditions required to trigger the error:
 *   1. The layout component is explicitly typed: LayoutProps<RequestInfo<{ orgId }>>
 *   2. A route inside the layout uses a superset of those params: RequestInfo<{ orgId; date }>
 *
 * TypeScript infers T = RequestInfo<{ orgId }> from the layout, then checks that
 * all nested routes satisfy Route<T>. The route with { orgId; date } fails because
 * FC<LayoutProps<{ orgId; date }>> is not assignable to FC<LayoutProps<{ orgId }>>
 * (function-parameter variance on the `layouts` field of NormalizedRouteDefinition).
 */

import { layout, prefix, route, index } from "rwsdk/router"
import type { LayoutProps } from "rwsdk/router"
import type { RequestInfo } from "rwsdk/worker"

type ScheduleInfo = RequestInfo<{ orgId: string; date: string }>

// Layout typed with orgId — this sets T for all routes inside layout()
const AppLayout = ({
  children,
}: LayoutProps<RequestInfo<{ orgId: string }>>) => <>{children}</>

const OrgIndex = () => <div>Org</div>

// Explicitly typed with { orgId; date }
const Schedule = ({ params }: ScheduleInfo) => (
  <div>
    {params.orgId} / {params.date}
  </div>
)

export const routes = prefix("/:orgId", [
  layout(AppLayout, [
    index(OrgIndex),
    prefix("/schedule", [
      route("/:date", Schedule), // RequestInfo<{ orgId; date }, ...> — TS2322 here
    ]),
  ]),
])
