import { useNavigate } from 'react-router-dom'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { AdminLayout } from '../components/AdminLayout'
import { adminCandidates, getSUB8834LifecycleState, stageSUB8834Reassignment } from '../data/mockAdminData'

export function AdminEvaluationReassignmentPickerPage() {
  const navigate = useNavigate()
  const lifecycle = getSUB8834LifecycleState()

  if (lifecycle.status === 'Cancelled') {
    navigate(portalRoutePaths.admin.evaluationProcessingHuman, { replace: true })
    return null
  }

  function select(name: string) {
    if (name === lifecycle.activeOwner) return
    stageSUB8834Reassignment(name)
    navigate(portalRoutePaths.admin.confirmEvaluationReassignment)
  }

  return (
    <AdminLayout ariaLabel="Reassign Human Evaluation SUB-8834" topbarTitle="Reassign Human Evaluation" activeNav="evaluations" topbarRightVariant="pill">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>Choose replacement evaluator</h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px' }}>SUB-8834 • current owner: {lifecycle.activeOwner} • evaluator version v{lifecycle.version}</p>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '122px', width: '1076px', height: '420px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Eligible and Available candidates</div>
        {adminCandidates.map((c, index) => {
          const current = c.name === lifecycle.activeOwner
          return (
            <div key={c.name} style={{ display: 'flex', alignItems: 'center', height: '76px', borderBottom: index < adminCandidates.length - 1 ? '1px solid #DCE3ED' : 'none' }}>
              <div style={{ width: '300px', fontSize: '14px', fontWeight: current ? 700 : 500 }}>{c.name}{current ? ' • current owner' : ''}</div>
              <div style={{ width: '220px', fontSize: '14px' }}>Track eligible: Yes</div>
              <div style={{ width: '220px', fontSize: '14px' }}>{c.effectiveAvailability}</div>
              <div style={{ width: '150px', fontSize: '14px' }}>{c.activeAssignments} active</div>
              <button type="button" data-sub8834-candidate={c.name} disabled={current} onClick={() => select(c.name)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '150px', height: '40px' }}>{current ? 'Current owner' : 'Review Reassignment'}</button>
            </div>
          )
        })}
      </div>
      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '574px', width: '1076px', height: '120px', padding: '16px 18px', boxSizing: 'border-box', backgroundColor: '#F3F8FE' }}>
        <div style={{ fontSize: '14px', lineHeight: '20px' }}>Candidate selection only stages the replacement. It does not mutate the active owner until the next confirmation screen.</div>
        <button type="button" onClick={() => navigate(portalRoutePaths.admin.evaluationProcessingHuman)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ marginTop: '14px', width: '130px', height: '34px' }}>Back</button>
      </div>
    </AdminLayout>
  )
}
