import { useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import { getAdminEventById, saveAdminEvent } from '../data/mockAdminData'

export function AdminEventEditorPage() {
  const navigate = useNavigate()
  const { eventId: paramEventId } = useParams<{ eventId?: string }>()
  const [searchParams] = useSearchParams()
  const eventId = paramEventId || searchParams.get('id') || undefined
  const existing = eventId ? getAdminEventById(eventId) : undefined

  const [title, setTitle] = useState(() => existing?.title || '')
  const [dateTime, setDateTime] = useState(() => existing?.date || '')
  const [division, setDivision] = useState(() => existing?.location || '')
  const [organizer, setOrganizer] = useState(() => existing?.organizer || '')
  const [description, setDescription] = useState(() => existing?.description || '')
  const [paths, setPaths] = useState<{
    publicSpeaking: boolean
    professionalPresenting: boolean
    contentCreation: boolean
  }>(() => ({
    publicSpeaking: Boolean(existing?.paths?.publicSpeaking),
    professionalPresenting: Boolean(existing?.paths?.professionalPresenting),
    contentCreation: Boolean(existing?.paths?.contentCreation),
  }))

  if (eventId && !existing) {
    return <Navigate to={portalRoutePaths.admin.events} replace />
  }

  const togglePath = (key: 'publicSpeaking' | 'professionalPresenting' | 'contentCreation') => {
    setPaths((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSaveDraft() {
    saveAdminEvent({
      id: eventId,
      title: title.trim(),
      dateTime: dateTime.trim(),
      division: division.trim(),
      organizer: organizer.trim(),
      description: description.trim(),
      paths,
    })
    navigate(portalRoutePaths.admin.events)
  }

  return (
    <AdminLayout
      ariaLabel="Admin Event Editor"
      topbarTitle="Create / Edit Event"
      activeNav="events"
      topbarRightVariant="avatar"
    >
      <h2
        className="auratio-admin-page-title"
        style={{ top: '32px', fontSize: '26px', lineHeight: '34px', fontWeight: 700 }}
      >
        Event information
      </h2>
      <p
        className="auratio-admin-page-subtitle"
        style={{ top: '72px', fontSize: '12px', lineHeight: '18px', fontWeight: 400, color: '#4E5968' }}
      >
        Create or edit admin-curated information exposed read-only to eligible end users.
      </p>

      {/* Main Form Card */}
      <div
        className="auratio-admin-panel"
        style={{
          position: 'absolute',
          left: '30px',
          top: '116px',
          width: '1080px',
          height: '514px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #DCE3ED',
          borderRadius: '16px',
          boxSizing: 'border-box',
          padding: '20px',
        }}
      >
        {/* Row 1: Title & Date */}
        <div style={{ display: 'flex' }}>
          <div style={{ width: '500px' }}>
            <label
              htmlFor="event-title"
              style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '6px' }}
            >
              EVENT TITLE
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="auratio-admin-input"
              style={{ width: '500px', height: '44px', fontSize: '11px' }}
            />
          </div>

          <div style={{ width: '500px', marginLeft: '20px' }}>
            <label
              htmlFor="event-date"
              style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '6px' }}
            >
              DATE / TIME
            </label>
            <input
              id="event-date"
              type="text"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              placeholder="Upcoming date"
              className="auratio-admin-input"
              style={{ width: '500px', height: '44px', fontSize: '11px' }}
            />
          </div>
        </div>

        {/* Row 2: Division & Source */}
        <div style={{ display: 'flex', marginTop: '16px' }}>
          <div style={{ width: '500px' }}>
            <label
              htmlFor="event-division"
              style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '6px' }}
            >
              DIVISION (BANGLADESH)
            </label>
            <input
              id="event-division"
              type="text"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="Select division"
              className="auratio-admin-input"
              style={{ width: '500px', height: '44px', fontSize: '11px' }}
            />
          </div>

          <div style={{ width: '500px', marginLeft: '20px' }}>
            <label
              htmlFor="event-organizer"
              style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '6px' }}
            >
              SOURCE / ORGANIZER
            </label>
            <input
              id="event-organizer"
              type="text"
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Organizer or source details"
              className="auratio-admin-input"
              style={{ width: '500px', height: '44px', fontSize: '11px' }}
            />
          </div>
        </div>

        {/* Row 3: Auratio Path(s) */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '8px' }}>
            RELEVANT AURATIO PATH(S)
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => togglePath('publicSpeaking')}
              style={{
                width: '260px',
                height: '42px',
                backgroundColor: '#F3F8FE',
                border: '1px solid #DCE3ED',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '14px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#041B3B',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {paths.publicSpeaking ? '☑' : '□'} Public Speaking
            </button>

            <button
              type="button"
              onClick={() => togglePath('professionalPresenting')}
              style={{
                width: '260px',
                height: '42px',
                backgroundColor: '#F3F8FE',
                border: '1px solid #DCE3ED',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '14px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#041B3B',
                marginLeft: '18px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {paths.professionalPresenting ? '☑' : '□'} Professional Presenting
            </button>

            <button
              type="button"
              onClick={() => togglePath('contentCreation')}
              style={{
                width: '260px',
                height: '42px',
                backgroundColor: '#F3F8FE',
                border: '1px solid #DCE3ED',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '14px',
                fontSize: '11px',
                fontWeight: 500,
                color: '#041B3B',
                marginLeft: '18px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {paths.contentCreation ? '☑' : '□'} Content Creation
            </button>
          </div>
        </div>

        {/* Row 4: Event Description */}
        <div style={{ marginTop: '16px' }}>
          <label
            htmlFor="event-description"
            style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#6B788A', letterSpacing: '0.02em', marginBottom: '6px' }}
          >
            EVENT DESCRIPTION
          </label>
          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Read-only event information shown in the mobile app"
            className="auratio-admin-textarea"
            style={{
              width: '1020px',
              height: '96px',
              fontSize: '11px',
            }}
          />
        </div>

        {/* Warning callout */}
        <div
          style={{
            marginTop: '16px',
            width: '1020px',
            height: '56px',
            backgroundColor: '#FFF7E8',
            border: '1px solid #DCE3ED',
            borderRadius: '16px',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            fontSize: '11px',
            fontWeight: 500,
            color: '#925F12',
          }}
        >
          MVP geography is Bangladesh only. Division is required. End-user discovery filters: Division • Auratio Path • Date.
        </div>
      </div>

      {/* Action buttons */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '664px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={handleSaveDraft}
          className="auratio-admin-btn auratio-admin-btn--secondary"
          style={{ width: '140px', height: '42px', fontSize: '13px', fontWeight: 600 }}
        >
          Save Draft
        </button>

        {/* Presentation-only controls per live Figma finding */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-admin-btn auratio-admin-btn--primary auratio-admin-btn--presentation"
          style={{ width: '160px', height: '42px', fontSize: '13px', fontWeight: 600, marginLeft: '12px' }}
        >
          Publish Event
        </div>

        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-admin-btn auratio-admin-btn--secondary auratio-admin-btn--presentation"
          style={{ width: '150px', height: '42px', fontSize: '13px', fontWeight: 600, marginLeft: '12px' }}
        >
          Delete Event
        </div>
      </div>
    </AdminLayout>
  )
}
