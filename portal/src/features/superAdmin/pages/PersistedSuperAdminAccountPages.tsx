import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { portalRoutePaths } from "../../../app/routes/routePaths";
import { SuperAdminLayout } from "../components/SuperAdminLayout";
import {
  deactivatePersistedAdminAccount,
  getPersistedAdminAccount,
  listPersistedAdminAccounts,
  updatePersistedAdminDisplayName,
  type PersistedSuperAdminAccount,
} from "../integration/persistedSuperAdminLifecycleService";

function LoadingCard({ text }: { text: string }) {
  return (
    <div
      className="auratio-admin-panel"
      style={{
        position: "absolute",
        left: "30px",
        top: "130px",
        width: "1076px",
        minHeight: "120px",
        padding: "24px",
      }}
    >
      {text}
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="auratio-admin-panel"
      role="alert"
      style={{
        position: "absolute",
        left: "30px",
        top: "130px",
        width: "1076px",
        minHeight: "140px",
        padding: "24px",
      }}
    >
      <div style={{ fontWeight: 700 }}>Unable to load persisted staff data</div>
      <div style={{ marginTop: "10px" }}>{message}</div>
      {onRetry && (
        <button
          type="button"
          className="auratio-admin-btn auratio-admin-btn--secondary"
          onClick={onRetry}
          style={{ marginTop: "18px", width: "120px", height: "40px" }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function ConfiguredSuperAdminAccountsPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<PersistedSuperAdminAccount[] | null>(
    null,
  );
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setError("");
    void listPersistedAdminAccounts()
      .then((value) => {
        if (active) setAccounts(value);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setAccounts(null);
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load Admin accounts.",
        );
      });

    return () => {
      active = false;
    };
  }, [revision]);

  const rows = useMemo(
    () =>
      (accounts ?? []).map((account) => ({
        ...account,
        destination: account.isRoot
          ? portalRoutePaths.superAdmin.protectedRootAccount
          : `/super-admin/admin-accounts/${account.id}`,
      })),
    [accounts],
  );

  return (
    <SuperAdminLayout ariaLabel="Admin Accounts" topbarTitle="Admin Accounts">
      <h2
        className="auratio-admin-page-title"
        style={{
          top: "34px",
          fontSize: "32px",
          lineHeight: "40px",
          fontWeight: 700,
        }}
      >
        Admin Accounts
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: "78px", fontSize: "16px", lineHeight: "24px" }}
      >
        Persisted ordinary Admin lifecycle management.
      </p>

      <button
        type="button"
        onClick={() => navigate(portalRoutePaths.superAdmin.inviteAdmin)}
        className="auratio-admin-btn auratio-admin-btn--primary"
        style={{
          position: "absolute",
          left: "890px",
          top: "36px",
          width: "190px",
          height: "44px",
        }}
      >
        Invite Admin
      </button>

      {error ? (
        <ErrorCard
          message={error}
          onRetry={() => setRevision((value) => value + 1)}
        />
      ) : accounts === null ? (
        <LoadingCard text="Loading persisted Admin accounts…" />
      ) : (
        <div
          className="auratio-admin-panel"
          style={{
            position: "absolute",
            left: "30px",
            top: "122px",
            width: "1076px",
            minHeight: "320px",
            padding: "18px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1.5fr 1fr 0.8fr 0.9fr 0.6fr",
              gap: "12px",
              fontSize: "12px",
              fontWeight: 700,
              color: "#6B788A",
            }}
          >
            <div>Name</div>
            <div>Email</div>
            <div>Account type</div>
            <div>Status</div>
            <div>Protection</div>
            <div>Action</div>
          </div>

          {rows.length === 0 ? (
            <div
              data-testid="persisted-admin-accounts-empty"
              style={{ marginTop: "28px", color: "#4E5968" }}
            >
              No persisted ordinary Admin or protected root account exists yet.
            </div>
          ) : (
            rows.map((account) => (
              <div
                key={`${account.kind}-${account.id}`}
                data-testid={`persisted-admin-account-row-${account.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.1fr 1.5fr 1fr 0.8fr 0.9fr 0.6fr",
                  gap: "12px",
                  alignItems: "center",
                  minHeight: "62px",
                  borderTop: "1px solid #DCE3ED",
                  marginTop: "14px",
                  paddingTop: "14px",
                }}
              >
                <div>{account.displayName}</div>
                <div>{account.email}</div>
                <div>{account.accountType}</div>
                <div>{account.status}</div>
                <div>{account.isRoot ? "Protected" : "—"}</div>
                <button
                  type="button"
                  onClick={() => navigate(account.destination)}
                  style={{
                    background: "none",
                    border: 0,
                    padding: 0,
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: 700,
                    color: "#256EA5",
                  }}
                >
                  {account.isRoot ? "View" : "Open"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </SuperAdminLayout>
  );
}

export function ConfiguredSuperAdminAccountPage() {
  const navigate = useNavigate();
  const { adminId } = useParams<{ adminId?: string }>();
  const accountId = adminId ?? "";
  const [account, setAccount] = useState<
    PersistedSuperAdminAccount | null | undefined
  >(undefined);
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setError("");
    void getPersistedAdminAccount(accountId)
      .then((value) => {
        if (!active) return;
        setAccount(value);
        setDisplayName(value?.displayName ?? "");
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setAccount(null);
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load Admin account.",
        );
      });

    return () => {
      active = false;
    };
  }, [accountId]);

  if (!accountId) {
    return <Navigate to={portalRoutePaths.superAdmin.adminAccounts} replace />;
  }

  if (error) {
    return (
      <SuperAdminLayout ariaLabel="Admin Account" topbarTitle="Admin Account">
        <ErrorCard message={error} />
      </SuperAdminLayout>
    );
  }

  if (account === undefined) {
    return (
      <SuperAdminLayout ariaLabel="Admin Account" topbarTitle="Admin Account">
        <LoadingCard text="Loading persisted Admin account…" />
      </SuperAdminLayout>
    );
  }

  if (account === null) {
    return <Navigate to={portalRoutePaths.superAdmin.adminAccounts} replace />;
  }

  if (account.isRoot) {
    return (
      <Navigate to={portalRoutePaths.superAdmin.protectedRootAccount} replace />
    );
  }

  const canEditDisplayName = account.kind === "profile";

  async function handleSave() {
    const currentAccount = account;
    if (!currentAccount || !canEditDisplayName || saving) return;
    setError("");
    setSaving(true);
    try {
      await updatePersistedAdminDisplayName(currentAccount.id, displayName);
      navigate(portalRoutePaths.superAdmin.adminAccounts);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to update Admin account.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SuperAdminLayout ariaLabel="Admin Account" topbarTitle="Admin Account">
      <h2
        className="auratio-admin-page-title"
        style={{
          top: "34px",
          fontSize: "32px",
          lineHeight: "40px",
          fontWeight: 700,
        }}
      >
        {account.displayName}
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: "78px", fontSize: "16px", lineHeight: "24px" }}
      >
        {account.kind === "invitation"
          ? "Persisted pending Admin invitation."
          : "Persisted ordinary Admin account."}
      </p>

      <div
        className="auratio-admin-panel"
        style={{
          position: "absolute",
          left: "30px",
          top: "124px",
          width: "620px",
          minHeight: "430px",
          padding: "18px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "18px" }}>Account details</div>

        <label
          htmlFor="persisted-admin-display-name"
          style={{
            display: "block",
            marginTop: "24px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Display name
        </label>
        <input
          id="persisted-admin-display-name"
          value={displayName}
          readOnly={!canEditDisplayName}
          onChange={(event) => setDisplayName(event.target.value)}
          style={{
            marginTop: "8px",
            width: "100%",
            height: "46px",
            padding: "0 12px",
          }}
        />

        <div style={{ marginTop: "22px", fontSize: "12px", fontWeight: 700 }}>
          Email / auth identity
        </div>
        <div
          data-testid="persisted-admin-email-readonly"
          style={{
            marginTop: "8px",
            width: "100%",
            height: "46px",
            border: "1px solid #C8D2E0",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            background: "#EEF2F7",
          }}
        >
          {account.email}
        </div>

        <div style={{ marginTop: "22px" }}>
          <strong>Status:</strong> {account.status}
        </div>

        {error && (
          <div role="alert" style={{ marginTop: "16px", color: "#B42318" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "14px", marginTop: "28px" }}>
          {canEditDisplayName && (
            <button
              type="button"
              className="auratio-admin-btn auratio-admin-btn--primary"
              disabled={saving}
              onClick={() => void handleSave()}
              style={{ width: "160px", height: "44px" }}
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          )}
          <button
            type="button"
            className="auratio-admin-btn auratio-admin-btn--secondary"
            onClick={() => navigate(portalRoutePaths.superAdmin.adminAccounts)}
            style={{ width: "160px", height: "44px" }}
          >
            Back
          </button>
        </div>
      </div>

      <div
        className="auratio-admin-panel"
        style={{
          position: "absolute",
          left: "680px",
          top: "124px",
          width: "426px",
          minHeight: "300px",
          padding: "18px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "18px" }}>
          Account lifecycle
        </div>
        <div style={{ marginTop: "18px" }}>
          {account.kind === "invitation"
            ? "Invite sent / activation pending"
            : account.status === "Deactivated"
              ? "Account deactivated"
              : "Account active"}
        </div>
        {account.status !== "Deactivated" && (
          <button
            type="button"
            className="auratio-admin-btn auratio-admin-btn--secondary"
            onClick={() =>
              navigate(`/super-admin/admin-accounts/${account.id}/deactivate`)
            }
            style={{ marginTop: "28px", width: "190px", height: "44px" }}
          >
            {account.kind === "invitation" ? "Revoke Invite…" : "Deactivate…"}
          </button>
        )}
      </div>
    </SuperAdminLayout>
  );
}

export function ConfiguredSuperAdminConfirmDeactivationPage() {
  const navigate = useNavigate();
  const { adminId } = useParams<{ adminId?: string }>();
  const accountId = adminId ?? "";
  const [account, setAccount] = useState<
    PersistedSuperAdminAccount | null | undefined
  >(undefined);
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let active = true;
    void getPersistedAdminAccount(accountId)
      .then((value) => {
        if (active) setAccount(value);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setAccount(null);
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load Admin account.",
        );
      });

    return () => {
      active = false;
    };
  }, [accountId]);

  if (!accountId) {
    return <Navigate to={portalRoutePaths.superAdmin.adminAccounts} replace />;
  }
  if (account === undefined) {
    return (
      <SuperAdminLayout
        ariaLabel="Confirm Admin Deactivation"
        topbarTitle="Deactivate Admin"
      >
        <LoadingCard text="Loading persisted Admin lifecycle…" />
      </SuperAdminLayout>
    );
  }
  if (account === null) {
    return <Navigate to={portalRoutePaths.superAdmin.adminAccounts} replace />;
  }
  if (account.isRoot) {
    return (
      <Navigate to={portalRoutePaths.superAdmin.protectedRootAccount} replace />
    );
  }

  async function handleConfirm() {
    const currentAccount = account;
    if (!currentAccount || working) return;
    setWorking(true);
    setError("");
    try {
      await deactivatePersistedAdminAccount(currentAccount);
      navigate(portalRoutePaths.superAdmin.adminAccounts);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to change Admin lifecycle.",
      );
    } finally {
      setWorking(false);
    }
  }

  return (
    <SuperAdminLayout
      ariaLabel="Confirm Admin Deactivation"
      topbarTitle="Deactivate Admin"
    >
      <h2
        className="auratio-admin-page-title"
        style={{
          top: "34px",
          fontSize: "32px",
          lineHeight: "40px",
          fontWeight: 700,
        }}
      >
        {account.kind === "invitation"
          ? "Confirm invitation revocation"
          : "Confirm Admin deactivation"}
      </h2>
      <div
        className="auratio-admin-panel"
        style={{
          position: "absolute",
          left: "190px",
          top: "118px",
          width: "720px",
          minHeight: "330px",
          padding: "30px",
        }}
      >
        <div style={{ fontSize: "22px", fontWeight: 700 }}>
          {account.displayName}
        </div>
        <div style={{ marginTop: "8px" }}>{account.email}</div>
        <div style={{ marginTop: "24px", lineHeight: "1.6" }}>
          {account.kind === "invitation"
            ? "This revokes the persisted pending Admin invitation. No Admin role will be activated from that invitation."
            : "This disables persisted Admin portal access while keeping attributable historical records."}
        </div>

        {error && (
          <div role="alert" style={{ marginTop: "18px", color: "#B42318" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "16px", marginTop: "28px" }}>
          <button
            type="button"
            className="auratio-admin-btn auratio-admin-btn--primary"
            disabled={working}
            onClick={() => void handleConfirm()}
            style={{ width: "220px", height: "44px" }}
          >
            {working
              ? "Working…"
              : account.kind === "invitation"
                ? "Revoke Invitation"
                : "Confirm Deactivation"}
          </button>
          <button
            type="button"
            className="auratio-admin-btn auratio-admin-btn--secondary"
            onClick={() =>
              navigate(`/super-admin/admin-accounts/${account.id}`)
            }
            style={{ width: "130px", height: "44px" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

export function ConfiguredSuperAdminProtectedRootPage() {
  const navigate = useNavigate();
  const [account, setAccount] = useState<
    PersistedSuperAdminAccount | null | undefined
  >(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getPersistedAdminAccount("root")
      .then((value) => {
        if (active) setAccount(value);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setAccount(null);
        setError(
          reason instanceof Error
            ? reason.message
            : "Unable to load protected root account.",
        );
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <SuperAdminLayout
      ariaLabel="Protected Super Admin Account"
      topbarTitle="Super Admin Account"
    >
      <h2
        className="auratio-admin-page-title"
        style={{
          top: "34px",
          fontSize: "32px",
          lineHeight: "40px",
          fontWeight: 700,
        }}
      >
        Protected Super Admin Account
      </h2>

      {error ? (
        <ErrorCard message={error} />
      ) : account === undefined ? (
        <LoadingCard text="Loading protected root account…" />
      ) : account === null ? (
        <div
          className="auratio-admin-panel"
          data-testid="persisted-root-account-missing"
          style={{
            position: "absolute",
            left: "30px",
            top: "124px",
            width: "720px",
            minHeight: "180px",
            padding: "24px",
          }}
        >
          <div style={{ fontWeight: 700 }}>
            No protected root account is provisioned in this environment.
          </div>
          <button
            type="button"
            className="auratio-admin-btn auratio-admin-btn--secondary"
            onClick={() => navigate(portalRoutePaths.superAdmin.adminAccounts)}
            style={{ marginTop: "24px", width: "170px", height: "44px" }}
          >
            Back to Accounts
          </button>
        </div>
      ) : (
        <div
          className="auratio-admin-panel"
          style={{
            position: "absolute",
            left: "30px",
            top: "124px",
            width: "720px",
            minHeight: "260px",
            padding: "24px",
          }}
        >
          <div style={{ fontSize: "24px", fontWeight: 700 }}>
            {account.displayName}
          </div>
          <div style={{ marginTop: "12px" }}>{account.email}</div>
          <div style={{ marginTop: "12px" }}>
            Super Admin • {account.status} • Protected
          </div>
          <div style={{ marginTop: "28px", lineHeight: "1.6" }}>
            Root account lifecycle mutation is not exposed through this portal.
          </div>
          <button
            type="button"
            className="auratio-admin-btn auratio-admin-btn--secondary"
            onClick={() => navigate(portalRoutePaths.superAdmin.adminAccounts)}
            style={{ marginTop: "24px", width: "170px", height: "44px" }}
          >
            Back to Accounts
          </button>
        </div>
      )}
    </SuperAdminLayout>
  );
}
