import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { confirmHE0142Reassignment } from '../data/mockAdminData'
import { AdminLayout } from '../components/AdminLayout'

export function AdminConfirmReassignmentPage() {
  const navigate = useNavigate()

  function handleConfirm() {
    confirmHE0142Reassignment()
    navigate(portalRoutePaths.admin.requestDetailsRouting)
  }

  function handleCancel() {
    navigate(portalRoutePaths.admin.assignmentPicker)
  }

  return (
    <AdminLayout
      ariaLabel="Confirm Reassignment"
      topbarTitle="Reassign Human Evaluation"
      activeNav="requests"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}
      >
        Confirm Reassignment
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '16px', lineHeight: '24px', fontWeight: 400 }}
      >
        HE-0142 • this confirmation performs supersession and ownership transfer
      </p>

      {/* Previous Assignment Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '122px',
          width: '510px',
          height: '260px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          Previous assignment
        </div>
        <div style={{ fontSize: '20px', fontWeight: 600, lineHeight: '28px', color: '#111827', marginTop: '18px' }}>
          Farhana Islam
        </div>
        <div style={{ fontSize: '14px', fontWeight: 400, lineHeight: '20px', color: '#4E5968', marginTop: '16px' }}>
          Assignment Status: In Evaluation
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#111827', marginTop: '24px' }}>
          Will become: Reassigned / Superseded
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#111827', marginTop: '24px' }}>
          Active ownership/access will be revoked.
        </div>
      </div>

      {/* New Assignment Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '570px',
          top: '122px',
          width: '536px',
          height: '260px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#111827' }}>
          New assignment
        </div>
        <div style={{ fontSize: '20px', fontWeight: 600, lineHeight: '28px', color: '#111827', marginTop: '18px' }}>
          Nadia Rahman
        </div>
        <div style={{ fontSize: '14px', fontWeight: 400, lineHeight: '20px', color: '#4E5968', marginTop: '16px' }}>
          Track eligible: Yes
        </div>
        <div style={{ fontSize: '14px', fontWeight: 400, lineHeight: '20px', color: '#4E5968', marginTop: '24px' }}>
          Effective availability: Available
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: '20px', color: '#111827', marginTop: '24px' }}>
          Will become sole active assignee.
        </div>
      </div>

      {/* Reassignment Consequence Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '412px',
          width: '1076px',
          height: '170px',
          backgroundColor: '#FFF7E8',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '18px',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 600, lineHeight: '26px', color: '#925F12' }}>
          Reassignment consequence
        </div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: '#925F12',
            marginTop: '14px',
            width: '1010px',
          }}
        >
          Confirming does not create two assignments. It closes the prior active assignment as Reassigned / Superseded, revokes Farhana’s access, and creates Nadia as the one active assignee.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '22px' }}>
          <div style={{ width: '222px', fontSize: '12px', fontWeight: 600, color: '#925F12' }}>
            Reason where applicable
          </div>
          <div
            style={{
              width: '690px',
              height: '42px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #C8D2E0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              boxSizing: 'border-box',
              fontSize: '12px',
              color: '#6B788A',
            }}
          >
            Scheduling / operational reassignment
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ position: 'absolute', left: '30px', top: '618px', display: 'flex', gap: '16px' }}>
        <button
          type="button"
          onClick={handleConfirm}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{
            width: '230px',
            height: '44px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Confirm Reassignment
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="auratio-admin-btn auratio-admin-btn--secondary"
          style={{
            width: '150px',
            height: '44px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '676px',
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: '18px',
          color: '#6B788A',
        }}
      >
        Cancel preserves the current Farhana assignment unchanged.
      </div>
    </AdminLayout>
  )
}
