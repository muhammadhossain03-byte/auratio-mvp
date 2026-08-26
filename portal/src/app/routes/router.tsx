import { createBrowserRouter } from 'react-router-dom'

import { FoundationPage } from '../../features/foundation/FoundationPage'
import { portalRoutePaths } from './routePaths'

// Journey route groups are reserved in routePaths and are registered here only
// as their corresponding Step IV screens are implemented.
export const router = createBrowserRouter([
  {
    path: portalRoutePaths.foundation,
    element: <FoundationPage />,
  },
])
