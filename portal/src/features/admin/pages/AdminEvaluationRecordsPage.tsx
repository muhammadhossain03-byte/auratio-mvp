import { useNavigate } from 'react-router-dom'
import { adminEvaluationRecords, getSUB8834LifecycleState } from '../data/mockAdminData'
import { AdminLayout } from '../components/AdminLayout'

export function AdminEvaluationRecordsPage() {
  const navigate = useNavigate()
  const sub8834 = getSUB8834LifecycleState()
  const cancelled = sub8834.status === 'Cancelled'

  const rows = [
    { id: 'SUB-8821', method: 'Human', assignment: 'Submitted', publication: 'Pending Moderation', score: '85 / 100', path: adminEvaluationRecords[0].destinationPath! },
    { id: 'SUB-8834', method: 'Human', assignment: cancelled ? 'Cancelled' : 'In Evaluation', publication: cancelled ? 'Cancelled' : 'Processing', score: '—', path: adminEvaluationRecords[1].destinationPath! },
    { id: 'SUB-8798', method: 'AI', assignment: 'Not applicable — AI', publication: 'Approved', score: '91 / 100', path: adminEvaluationRecords[2].destinationPath! },
  ]

  return (
    <AdminLayout ariaLabel="Evaluation Records" topbarTitle="Evaluations" activeNav="evaluations" topbarRightVariant="pill">
      <h2 className="auratio-admin-page-title" style={{ top: '34px', fontSize: '32px', lineHeight: '40px', fontWeight: 700 }}>Evaluation Records</h2>
      <p className="auratio-admin-page-subtitle" style={{ top: '78px', fontSize: '16px', lineHeight: '24px' }}>Operational index across active and terminal evaluation records.</p>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '122px', width: '1076px', height: '60px', display: 'flex', alignItems: 'center', padding: '0 18px', boxSizing: 'border-box', backgroundColor: '#F3F8FE' }}>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>Method, Human assignment state, and Publication Status remain explicitly separate.</div>
      </div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '214px', width: '1076px', height: '322px', padding: '18px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', height: '24px', fontSize: '12px', fontWeight: 600, color: '#6B788A' }}>
          <div style={{ width: '146px' }}>Submission</div><div style={{ width: '170px' }}>Final Method</div><div style={{ width: '210px' }}>Human Assignment Status</div><div style={{ width: '200px' }}>Publication Status</div><div style={{ width: '140px' }}>Score</div><div style={{ width: '92px' }}>Action</div>
        </div>
        {rows.map((row, index) => (
          <div key={row.id} data-evaluation-id={row.id} style={{ display: 'flex', alignItems: 'center', height: '76px', borderBottom: index < rows.length - 1 ? '1px solid #DCE3ED' : 'none' }}>
            <div style={{ width: '146px', fontSize: '14px', fontWeight: 600 }}>{row.id}</div>
            <div style={{ width: '170px', fontSize: '14px' }}>{row.method}</div>
            <div style={{ width: '210px', fontSize: '14px' }}>{row.assignment}</div>
            <div style={{ width: '200px' }}>
              <div className="auratio-admin-status-pill" style={{ width: '170px', height: '34px', backgroundColor: row.publication === 'Cancelled' ? '#FEE2E2' : row.publication === 'Approved' ? '#DCFCE7' : row.publication === 'Pending Moderation' ? '#FFF7E8' : '#EDF4FC', color: row.publication === 'Cancelled' ? '#991B1B' : '#111827' }}>{row.publication}</div>
            </div>
            <div style={{ width: '140px', fontSize: '14px' }}>{row.score}</div>
            <button type="button" onClick={() => navigate(row.path)} className="auratio-admin-btn auratio-admin-btn--secondary" style={{ width: '92px', height: '44px' }}>Open</button>
          </div>
        ))}
      </div>

      <div className="auratio-admin-panel" style={{ position: 'absolute', left: '30px', top: '578px', width: '1076px', height: '112px', padding: '16px 18px', boxSizing: 'border-box', backgroundColor: '#FFF7E8' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#925F12' }}>History boundary</div>
        <div style={{ marginTop: '12px', fontSize: '14px', lineHeight: '20px', color: '#925F12' }}>Cancelled and Rejected records remain available to Admin/Super Admin as terminal history, but expose no score or DOCX output.</div>
      </div>
    </AdminLayout>
  )
}
