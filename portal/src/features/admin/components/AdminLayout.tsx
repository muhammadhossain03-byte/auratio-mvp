import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { portalRoutePaths } from "../../../app/routes/routePaths";
import compactLockupSvg from "../../../assets/images/auratio_compact_lockup.svg";
import {
  currentPortalSession,
  isTransientPortalAuthenticationError,
  subscribeToPortalAuth,
} from "../../../foundation/integration/auth/portalAuthService";
import { portalSupabaseRuntimeMode } from "../../../foundation/integration/supabaseConfig";
import "../styles/admin.css";

interface AdminLayoutProps {
  children: ReactNode;
  topbarTitle: string;
  activeNav?:
    | "dashboard"
    | "requests"
    | "evaluations"
    | "moderation"
    | "volunteers"
    | "events"
    | "audit";
  topbarRightVariant?: "avatar" | "pill";
  ariaLabel: string;
}

type OperationalShellRole = "admin" | "super_admin";

function useOperationalShellRole(): OperationalShellRole | null {
  const runtimeMode = portalSupabaseRuntimeMode();
  const [role, setRole] = useState<OperationalShellRole | null>(
    runtimeMode === "prototype" ? "admin" : null,
  );

  useEffect(() => {
    if (runtimeMode === "prototype") {
      setRole("admin");
      return;
    }
    if (runtimeMode !== "configured") {
      setRole(null);
      return;
    }

    let active = true;

    const refresh = () => {
      void currentPortalSession()
        .then((authenticated) => {
          if (!active) return;

          if (authenticated?.profile.role === "super_admin") {
            setRole("super_admin");
            return;
          }
          if (authenticated?.profile.role === "admin") {
            setRole("admin");
            return;
          }

          setRole(null);
        })
        .catch((error: unknown) => {
          if (!active) return;
          if (!isTransientPortalAuthenticationError(error)) {
            setRole(null);
          }
        });
    };

    refresh();

    const unsubscribeAuth = subscribeToPortalAuth(() => refresh());
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        (event.key.startsWith("sb-") && event.key.endsWith("-auth-token"))
      ) {
        refresh();
      }
    };
    const handleFocus = () => refresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    const interval = window.setInterval(refresh, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      unsubscribeAuth();
    };
  }, [runtimeMode]);

  return role;
}

export function AdminLayout({
  children,
  topbarTitle,
  activeNav = "dashboard",
  topbarRightVariant = "avatar",
  ariaLabel,
}: AdminLayoutProps) {
  const navigate = useNavigate();
  const runtimeMode = portalSupabaseRuntimeMode();
  const shellRole = useOperationalShellRole();

  if (runtimeMode === "configured" && shellRole === null) {
    return (
      <main
        aria-label={ariaLabel}
        aria-busy="true"
        className="auratio-admin-viewport"
        data-testid="admin-shell-role-loading"
      />
    );
  }

  const isSuperAdmin = shellRole === "super_admin";
  const roleLabel = isSuperAdmin ? "Super Admin" : "Admin";
  const isDetailed = topbarRightVariant === "pill";
  const useRoleSpacing = isDetailed || isSuperAdmin;
  const topbarUsesPill = isDetailed || isSuperAdmin;

  return (
    <main
      aria-label={ariaLabel}
      className="auratio-admin-viewport"
      data-testid="admin-viewport"
      data-operational-shell-role={shellRole ?? "admin"}
    >
      <aside
        className="auratio-admin-sidebar"
        aria-label={
          isSuperAdmin
            ? "Super Admin Portal Navigation"
            : "Admin Portal Navigation"
        }
      >
        <img
          src={compactLockupSvg}
          alt="Auratio"
          className="auratio-admin-logo"
          style={{ top: useRoleSpacing ? "24px" : "29px" }}
        />

        <div
          className="auratio-admin-sidebar-sub"
          style={{ top: useRoleSpacing ? "76px" : "77px" }}
        >
          Admin / Evaluator Portal
        </div>

        {useRoleSpacing && (
          <div
            className="auratio-admin-sidebar-role"
            data-testid="operational-shell-role"
          >
            {roleLabel}
          </div>
        )}

        {activeNav === "dashboard" ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: useRoleSpacing ? "114px" : "112px" }}
          >
            <span className="auratio-admin-nav-item--active">Dashboard</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.dashboard)}
            className="auratio-admin-nav-item"
            style={{ top: useRoleSpacing ? "124px" : "122px" }}
          >
            Dashboard
          </button>
        )}

        {activeNav === "requests" ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: useRoleSpacing ? "164px" : "162px" }}
          >
            <span className="auratio-admin-nav-item--active">Requests</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.requests)}
            className="auratio-admin-nav-item"
            style={{ top: useRoleSpacing ? "174px" : "172px" }}
          >
            Requests
          </button>
        )}

        {activeNav === "evaluations" ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: useRoleSpacing ? "214px" : "212px" }}
          >
            <span className="auratio-admin-nav-item--active">Evaluations</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.evaluations)}
            className="auratio-admin-nav-item"
            style={{ top: useRoleSpacing ? "224px" : "222px" }}
          >
            Evaluations
          </button>
        )}

        {activeNav === "moderation" ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: useRoleSpacing ? "264px" : "262px" }}
          >
            <span className="auratio-admin-nav-item--active">Moderation</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.moderation)}
            className="auratio-admin-nav-item"
            style={{ top: useRoleSpacing ? "274px" : "272px" }}
          >
            Moderation
          </button>
        )}

        {activeNav === "volunteers" ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: useRoleSpacing ? "314px" : "312px" }}
          >
            <span className="auratio-admin-nav-item--active">Volunteers</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.volunteers)}
            className="auratio-admin-nav-item"
            style={{ top: useRoleSpacing ? "324px" : "322px" }}
          >
            Volunteers
          </button>
        )}

        {activeNav === "events" ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: useRoleSpacing ? "364px" : "362px" }}
          >
            <span className="auratio-admin-nav-item--active">Events</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.events)}
            className="auratio-admin-nav-item"
            style={{ top: useRoleSpacing ? "374px" : "372px" }}
          >
            Events
          </button>
        )}

        {activeNav === "audit" ? (
          <div
            className="auratio-admin-nav-item--active-box"
            style={{ top: useRoleSpacing ? "414px" : "412px" }}
          >
            <span className="auratio-admin-nav-item--active">Audit Log</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate(portalRoutePaths.admin.audit)}
            className="auratio-admin-nav-item"
            style={{ top: useRoleSpacing ? "424px" : "422px" }}
          >
            Audit Log
          </button>
        )}

        {isSuperAdmin && (
          <button
            type="button"
            data-testid="super-admin-admin-accounts-link"
            onClick={() => navigate(portalRoutePaths.superAdmin.adminAccounts)}
            className="auratio-admin-nav-item"
            style={{ top: "474px" }}
          >
            Admin Accounts
          </button>
        )}

        {useRoleSpacing && (
          <>
            <div className="auratio-admin-sidebar-footer-title">
              {isSuperAdmin
                ? "Super Admin governance"
                : "Role-scoped navigation"}
            </div>
            <div className="auratio-admin-sidebar-footer-sub">
              Backend RBAC is authoritative.
            </div>
          </>
        )}
      </aside>

      <header className="auratio-admin-topbar" aria-label="Portal Header">
        <h1
          className="auratio-admin-topbar-title"
          style={{
            fontSize: topbarUsesPill ? "24px" : "22px",
            lineHeight: topbarUsesPill ? "32px" : "30px",
            top: topbarUsesPill ? "20px" : "22px",
          }}
        >
          {topbarTitle}
        </h1>

        {topbarUsesPill ? (
          <div
            className="auratio-admin-topbar-pill"
            data-testid="operational-shell-topbar-role"
          >
            {roleLabel}
          </div>
        ) : (
          <>
            <div
              className="auratio-admin-topbar-avatar"
              aria-label="Admin initials"
            >
              AU
            </div>
            <div className="auratio-admin-topbar-user-role">Admin</div>
          </>
        )}
      </header>

      <section className="auratio-admin-content">{children}</section>
    </main>
  );
}
