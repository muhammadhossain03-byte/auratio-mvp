import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import {
  getFarhanaTrackEligibility,
  getInviteVolunteerTrackDraft,
  saveFarhanaTrackEligibility,
  saveInviteVolunteerTrackDraft,
} from '../data/mockAdminData'

const PUBLIC_SPEAKING_TRACKS = [
  'Informative',
  'Extempore',
  'Persuasive',
  'Argumentative / Debate',
  'Explanatory',
]

const PROFESSIONAL_PRESENTING_TRACKS = [
  'News Delivery',
  'Business Pitch / Sales Pitch',
  'General Presentation / Multimedia',
  'Academic — Poster / Project / Thesis',
  'Corporate Report',
]

const CONTENT_CREATION_TRACKS = [
  'Infotainment-Oriented',
  'Academic — Lecture / Course',
  'Marketing / Promotional',
]

export function AdminVolunteerTrackEligibilityPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isInviteMode = (location.state as { mode?: string } | null)?.mode === 'invite'

  const [selectedTracks, setSelectedTracks] = useState<string[]>(() =>
    isInviteMode ? getInviteVolunteerTrackDraft() : getFarhanaTrackEligibility(),
  )

  const handleToggleTrack = (track: string) => {
    setSelectedTracks((prev) => {
      if (prev.includes(track)) {
        // Minimum-one guard: attempting to deselect final remaining track must not reduce count to 0
        if (prev.length <= 1) {
          return prev
        }
        return prev.filter((t) => t !== track)
      } else {
        return [...prev, track]
      }
    })
  }

  const handleSave = () => {
    if (isInviteMode) {
      saveInviteVolunteerTrackDraft(selectedTracks)
    } else {
      saveFarhanaTrackEligibility(selectedTracks)
    }
    navigate(-1)
  }

  const handleCancel = () => {
    navigate(-1)
  }

  const renderTrackItem = (track: string, isLast: boolean) => {
    const isChecked = selectedTracks.includes(track)
    return (
      <button
        key={track}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        onClick={() => handleToggleTrack(track)}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          marginBottom: isLast ? 0 : '38px',
          fontFamily: 'inherit',
        }}
      >
        <div
          style={{
            width: '22px',
            height: '22px',
            backgroundColor: isChecked ? '#041B3B' : '#FFFFFF',
            border: isChecked ? '1px solid #041B3B' : '1px solid #D1DBEB',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 700,
            flexShrink: 0,
            boxSizing: 'border-box',
          }}
        >
          {isChecked ? '✓' : ''}
        </div>
        <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
          {track}
        </span>
      </button>
    )
  }

  return (
    <AdminLayout
      ariaLabel="Volunteer Track Eligibility"
      topbarTitle="Track Eligibility"
      activeNav="volunteers"
      topbarRightVariant="pill"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '36px', fontSize: '30px', lineHeight: '38px', fontWeight: 700 }}
      >
        {isInviteMode
          ? 'Choose Volunteer Evaluator track eligibility'
          : 'Manage Farhana Islam’s track eligibility'}
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '78px', fontSize: '14px', lineHeight: '20px', fontWeight: 400, color: '#6B788A' }}
      >
        Select one or more tracks this volunteer is authorized to evaluate.
      </p>

      {/* Right note */}
      <div
        style={{
          position: 'absolute',
          left: '830px',
          top: '48px',
          width: '250px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#6B788A',
          textAlign: 'right',
        }}
      >
        {`${selectedTracks.length} selected • minimum 1 required`}
      </div>

      {/* Column 1: Public Speaking */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '124px',
          width: '330px',
          height: '470px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D1DBEB',
          borderRadius: '8px',
          boxSizing: 'border-box',
          padding: '20px 18px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '24px' }}>
          PUBLIC SPEAKING
        </div>
        {PUBLIC_SPEAKING_TRACKS.map((track, idx) =>
          renderTrackItem(track, idx === PUBLIC_SPEAKING_TRACKS.length - 1),
        )}
      </div>

      {/* Column 2: Professional Presenting */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '390px',
          top: '124px',
          width: '330px',
          height: '470px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D1DBEB',
          borderRadius: '8px',
          boxSizing: 'border-box',
          padding: '20px 18px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '24px' }}>
          PROFESSIONAL PRESENTING
        </div>
        {PROFESSIONAL_PRESENTING_TRACKS.map((track, idx) =>
          renderTrackItem(track, idx === PROFESSIONAL_PRESENTING_TRACKS.length - 1),
        )}
      </div>

      {/* Column 3: Content Creation */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '750px',
          top: '124px',
          width: '330px',
          height: '470px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D1DBEB',
          borderRadius: '8px',
          boxSizing: 'border-box',
          padding: '20px 18px',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '24px' }}>
          CONTENT CREATION
        </div>
        {CONTENT_CREATION_TRACKS.map((track, idx) =>
          renderTrackItem(track, idx === CONTENT_CREATION_TRACKS.length - 1),
        )}
      </div>

      {/* Bottom Panel */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '622px',
          width: '1050px',
          height: '116px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #D1DBEB',
          borderRadius: '8px',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
        }}
      >
        <button
          type="button"
          onClick={handleSave}
          className="auratio-admin-btn auratio-admin-btn--primary"
          style={{ width: '190px', height: '44px', fontSize: '14px', fontWeight: 600, borderRadius: '6px' }}
        >
          Save Eligibility
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="auratio-admin-btn auratio-admin-btn--secondary"
          style={{ width: '120px', height: '44px', fontSize: '14px', fontWeight: 600, borderRadius: '6px', marginLeft: '16px', borderColor: '#D1DBEB' }}
        >
          Cancel
        </button>

        <div
          style={{
            marginLeft: '26px',
            width: '630px',
            fontSize: '13px',
            lineHeight: '18px',
            fontWeight: 400,
            color: '#6B788A',
          }}
        >
          Saving creates an auditable eligibility-change event. At least one authorized track must remain selected.
        </div>
      </div>
    </AdminLayout>
  )
}
