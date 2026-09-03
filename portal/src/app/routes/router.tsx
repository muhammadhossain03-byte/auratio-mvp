import { createBrowserRouter, Navigate } from 'react-router-dom'

import { FoundationPage } from '../../features/foundation/FoundationPage'
import {
  PortalAccessUnavailablePage,
  PortalEmailVerificationPage,
  PortalRoleAuthorizationPage,
  PortalSignInPage,
} from '../../features/auth'
import { portalRoutePaths } from './routePaths'

// Journey route groups are reserved in routePaths and are registered here only
// as their corresponding Step IV screens are implemented.
export const router = createBrowserRouter([
  {
    path: portalRoutePaths.foundation,
    element: <FoundationPage />,
  },
  {
    path: portalRoutePaths.authentication.root,
    element: <Navigate to={portalRoutePaths.authentication.signIn} replace />,
  },
  {
    path: portalRoutePaths.authentication.signIn,
    element: <PortalSignInPage />,
  },
  {
    path: portalRoutePaths.authentication.roleAuthorization,
    element: <PortalRoleAuthorizationPage />,
  },
  {
    path: portalRoutePaths.authentication.emailVerification,
    element: <PortalEmailVerificationPage />,
  },
  {
    path: portalRoutePaths.authentication.accessUnavailable,
    element: <PortalAccessUnavailablePage />,
  },
])

