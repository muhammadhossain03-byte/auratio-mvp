import { useNavigate, useSearchParams } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import {
  adminCandidates,
  assignHE0142Candidate,
  getREQ1042RoutingState,
  stageHE0142Reassignment,
} from '../data/mockAdminData'
import { AdminLayout } from '../components/AdminLayout'

export function AdminAssignmentPickerPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const routingState = getREQ1042RoutingState()
  const activeOwner = routingState.activeOwner
  const isReassignment = Boolean(activeOwner)
  const source = searchParams.get('source') === 'moderation' ? 'moderation' : 'request'

  function handleSelectCandidate(name: string) {
    if (isReassignment) {
      if (name === activeOwner) return
      stageHE0142Reassignment(name, source)
      navigate(portalRoutePaths.admin.confirmReassignment)
      return
    }
    assignHE0142Candidate(name)
    navigate(portalRoutePaths.admin.requests)
  }

  const backPath =
    source === 'moderation' ? portalRoutePaths.admin.moderationReview : portalRoutePaths.admin.requestDetailsRouting

  return (
    <AdminLayout
      ariaLabel={isReassignment ? 'Reassign Human Evaluation' : 'Assign Human Evaluation'}
      topbarTitle={isReassignment ? 'Reassign Human Evaluation' : 'Assign Human Evaluation'}
      activeNav={source === 'moderation' ? 'moderation' : 'requests'}
      topbarRightVariant="pill"
    >
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>
        {isReassignment ? 'Choose new evaluator for HE-0142' : 'Choose evaluator for HE-0142'}
      </h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px', lineHeight: '24px' }}>
        Request track: Business Pitch / Sales Pitch • Assignment state: {isReassignment ? 'Assigned' : 'Unassigned'} • Active evaluator owner: {activeOwner || 'None'}
      </p>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '122px', width: '1076px', height: '62px', padding: '0 18px', display: 'flex', alignItems: 'center', boxSizing: 'border-box', backgroundColor: '#F3F8FE' }}>
        <div style={{ width: '260px', fontSize: '14px', fontWeight: 600 }}>Candidate filter</div>
        <div style={{ width: '350px', fontSize: '14px' }}>Track eligible: Business Pitch / Sales Pitch</div>
        <div style={{ width: '300px', fontSize: '14px' }}>Effective availability: Available</div>
        <div style={{ fontSize: '12px', color: '#6B788A' }}>One active owner only</div>
      </div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '208px', width: '1076px', height: '380px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', height: '24px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
          <div style={{ width: '242px' }}>Evaluator</div><div style={{ width: '190px' }}>Track eligible</div>
          <div style={{ width: '235px' }}>Availability</div><div style={{ width: '230px' }}>Active assignments</div><div style={{ width: '120px' }}>Action</div>
        </div>
        {adminCandidates.map((c, index) => {
          const isCurrent = c.name === activeOwner
          return (
            <div key={c.name} data-candidate-row={c.name} style={{ display: 'flex', alignItems: 'center', height: '72px', borderBottom: index < adminCandidates.length - 1 ? '1px solid #DCE3ED' : 'none' }}>
              <div style={{ width: '242px', fontSize: '14px', fontWeight: isCurrent ? 700 : 400 }}>{c.name}{isCurrent ? ' • current' : ''}</div>
              <div style={{ width: '190px', fontSize: '14px' }}>Yes</div>
              <div style={{ width: '235px', fontSize: '14px' }}>{c.effectiveAvailability}</div>
              <div style={{ width: '230px', fontSize: '14px', fontWeight: 600 }}>{c.activeAssignments}</div>
              <button
                type="button"
                data-candidate={c.name}
                aria-label={`${isReassignment ? 'Select replacement' : 'Assign'} ${c.name}`}
                disabled={isCurrent}
                onClick={() => handleSelectCandidate(c.name)}
                className="auratio-admin-btn auratio-admin-btn--secondary"
                style={{ width: '140px', height: '40px', fontSize: '12px', fontWeight: 600 }}
              >
                {isCurrent ? 'Current owner' : isReassignment ? 'Review Reassignment' : 'Assign'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '618px', width: '1076px', height: '130px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Ownership boundary</div>
        <div style={{ marginTop: '12px', fontSize: '14px', lineHeight: '20px', color: '#4E5968' }}>
          {isReassignment
            ? 'Selecting a replacement does not change ownership. It stages the candidate and opens a separate confirmation screen. The current owner keeps access until confirmation.'
            : 'Initial assignment creates one active Human owner. Ineligible or effectively unavailable volunteers are not shown as assignable candidates.'}
        </div>
        <button type="button" onClick={() => navigate(backPath)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ marginTop: '14px', width: '130px', height: '34px' }}>
          Back
        </button>
      </div>
    </AdminLayout>
  )
}
