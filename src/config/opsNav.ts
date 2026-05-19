import type { LucideIcon } from 'lucide-react'
import {
  LayoutGrid,
  AlertTriangle,
  CheckCircle,
  ArrowRightCircle,
  Map,
  Settings,
  Users,
} from 'lucide-react'
import { ROUTES } from './routes'

export interface OpsNavItem {
  path: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

/** Appeals always visible — not gated by VITE_DEMO_CORE_FOCUS */
export const OPS_NAV_ITEMS: OpsNavItem[] = [
  { path: ROUTES.operations, label: 'Overview', icon: LayoutGrid, exact: true },
  { path: ROUTES.operationsEvents, label: 'Active Events', icon: AlertTriangle },
  { path: ROUTES.operationsVerification, label: 'Approvals', icon: CheckCircle },
  { path: ROUTES.operationsCommunityQueue, label: 'Appeals', icon: Users },
  { path: ROUTES.operationsDisbursements, label: 'Release & Proof', icon: ArrowRightCircle },
  { path: ROUTES.operationsMap, label: 'Incident Map', icon: Map },
  { path: ROUTES.operationsSettings, label: 'Settings', icon: Settings },
]
