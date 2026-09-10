import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AdminLayout } from '../components/AdminLayout'
import { portalRoutePaths } from '../../../app/routes/routePaths'
import {
  BANGLADESH_DIVISIONS,
  createPersistedAdminEvent,
  deletePersistedAdminEvent,
  formatDateTimeLocal,
  getPersistedAdminEvent,
  updatePersistedAdminEvent,
  type BangladeshDivision,
  type PersistedAdminEventPaths,
  type PersistedEventInput,
} from '../integration/persistedAdminEvents'

export function AdminEventEditorPage() {
  const navigate = useNavigate()
  const { eventId: paramEventId } = useParams<{ eventId?: string }>()
  const [searchParams] = useSearchParams()
  const eventId = paramEventId || searchParams.get('id') || undefined

  const [isLoadingExisting, setIsLoadingExisting] = useState(Boolean(eventId))
  const [notFound, setNotFound] = useState(false)
  const [isExisting, setIsExisting] = useState(false)

  const [title, setTitle] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [division, setDivision] = useState<BangladeshDivision | ''>('')
  const [organizer, setOrganizer] = useState('')
  const [description, setDescription] = useState('')

  const [paths, setPaths] = useState<PersistedAdminEventPaths>({
    publicSpeaking: false,
    professionalPresenting: false,
    contentCreation: false,
  })

  const [titleError, setTitleError] = useState('')
  const [divisionError, setDivisionError] = useState('')
  const [dateError, setDateError] = useState('')
  const [pathsError, setPathsError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!eventId) {
      setIsLoadingExisting(false)
      setIsExisting(false)
      return
    }

    let active = true
    setIsLoadingExisting(true)
    getPersistedAdminEvent(eventId)
      .then((event) => {
        if (!active) return
        if (!event) {
          setNotFound(true)
          return
        }
        setTitle(event.title)
        setDateTime(formatDateTimeLocal(event.startsAt))
        setDivision(event.division)
        setOrganizer(event.organizer || '')
        setDescription(event.description || '')
        setPaths({
          publicSpeaking: Boolean(event.paths.publicSpeaking),
          professionalPresenting: Boolean(event.paths.professionalPresenting),
          contentCreation: Boolean(event.paths.contentCreation),
        })
        setIsExisting(true)
        setIsLoadingExisting(false)
      })
      .catch(() => {
        if (!active) return
        setNotFound(true)
      })

    return () => {
      active = false
    }
  }, [eventId])

  if (notFound) {
    return <Navigate to={portalRoutePaths.admin.events} replace />
  }

  const togglePath = (key: keyof PersistedAdminEventPaths) => {
    setPaths((prev) => ({ ...prev, [key]: !prev[key] }))
    if (pathsError) setPathsError('')
  }

  function validateForm(): boolean {
    let hasError = false

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setTitleError('Event title is required.')
      hasError = true
    } else {
      setTitleError('')
    }

    if (!division || !BANGLADESH_DIVISIONS.includes(division as BangladeshDivision)) {
      setDivisionError('Bangladesh Division is required.')
      hasError = true
    } else {
      setDivisionError('')
    }

    const parsedDate = new Date(dateTime)
    if (!dateTime.trim() || isNaN(parsedDate.getTime())) {
      setDateError('Valid date/time is required.')
      hasError = true
    } else {
      setDateError('')
    }

    if (!paths.publicSpeaking && !paths.professionalPresenting && !paths.contentCreation) {
      setPathsError('At least one Auratio Path is required.')
      hasError = true
    } else {
      setPathsError('')
    }

    return !hasError
  }

  async function handleSaveDraft() {
    if (isSubmitting) return
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError('')

    const input: PersistedEventInput = {
      title: title.trim(),
      division: division as BangladeshDivision,
      startsAt: dateTime,
      organizer: organizer.trim() || null,
      description: description.trim() || null,
      paths,
    }

    try {
      if (eventId && isExisting) {
        await updatePersistedAdminEvent(eventId, input, 'draft')
      } else {
        await createPersistedAdminEvent(input, 'draft')
      }
      navigate(portalRoutePaths.admin.events)
    } catch {
      setSubmitError('Unable to save this event. Please try again.')
      setIsSubmitting(false)
    }
  }

  async function handlePublish() {
    if (isSubmitting) return
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError('')

    const input: PersistedEventInput = {
      title: title.trim(),
      division: division as BangladeshDivision,
      startsAt: dateTime,
      organizer: organizer.trim() || null,
      description: description.trim() || null,
      paths,
    }

    try {
      if (eventId && isExisting) {
        await updatePersistedAdminEvent(eventId, input, 'published')
      } else {
        await createPersistedAdminEvent(input, 'published')
      }
      navigate(portalRoutePaths.admin.events)
    } catch {
      setSubmitError('Unable to save this event. Please try again.')
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!eventId || !isExisting || isSubmitting) return
    setIsSubmitting(true)
    setSubmitError('')

    try {
      await deletePersistedAdminEvent(eventId)
      navigate(portalRoutePaths.admin.events)
    } catch {
      setSubmitError('Unable to save this event. Please try again.')
      setIsSubmitting(false)
    }
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
        {isLoadingExisting ? (
          <div
            data-testid="event-editor-loading"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              fontSize: '12px',
              color: '#6B788A',
            }}
          >
            Loading event details…
          </div>
        ) : (
          <>
            {/* Row 1: Title & Date */}
            <div style={{ display: 'flex' }}>
              <div style={{ width: '500px' }}>
                <label
                  htmlFor="event-title"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#6B788A',
                    letterSpacing: '0.02em',
                    marginBottom: '6px',
                  }}
                >
                  EVENT TITLE
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (titleError) setTitleError('')
                  }}
                  placeholder="Event title"
                  className="auratio-admin-input"
                  style={{ width: '500px', height: '44px', fontSize: '11px' }}
                />
                {titleError && (
                  <div
                    data-testid="event-title-error"
                    style={{ color: '#B42318', fontSize: '11px', marginTop: '4px' }}
                  >
                    {titleError}
                  </div>
                )}
              </div>

              <div style={{ width: '500px', marginLeft: '20px' }}>
                <label
                  htmlFor="event-date"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#6B788A',
                    letterSpacing: '0.02em',
                    marginBottom: '6px',
                  }}
                >
                  DATE / TIME
                </label>
                <input
                  id="event-date"
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => {
                    setDateTime(e.target.value)
                    if (dateError) setDateError('')
                  }}
                  className="auratio-admin-input"
                  style={{ width: '500px', height: '44px', fontSize: '11px' }}
                />
                {dateError && (
                  <div
                    data-testid="event-date-error"
                    style={{ color: '#B42318', fontSize: '11px', marginTop: '4px' }}
                  >
                    {dateError}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Division & Source */}
            <div style={{ display: 'flex', marginTop: '16px' }}>
              <div style={{ width: '500px' }}>
                <label
                  htmlFor="event-division"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#6B788A',
                    letterSpacing: '0.02em',
                    marginBottom: '6px',
                  }}
                >
                  DIVISION (BANGLADESH)
                </label>
                <select
                  id="event-division"
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value as BangladeshDivision)
                    if (divisionError) setDivisionError('')
                  }}
                  className="auratio-admin-input"
                  style={{
                    width: '500px',
                    height: '44px',
                    fontSize: '11px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="">Select division</option>
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
                {divisionError && (
                  <div
                    data-testid="event-division-error"
                    style={{ color: '#B42318', fontSize: '11px', marginTop: '4px' }}
                  >
                    {divisionError}
                  </div>
                )}
              </div>

              <div style={{ width: '500px', marginLeft: '20px' }}>
                <label
                  htmlFor="event-organizer"
                  style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#6B788A',
                    letterSpacing: '0.02em',
                    marginBottom: '6px',
                  }}
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
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#6B788A',
                  letterSpacing: '0.02em',
                  marginBottom: '8px',
                }}
              >
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
              {pathsError && (
                <div
                  data-testid="event-paths-error"
                  style={{ color: '#B42318', fontSize: '11px', marginTop: '6px' }}
                >
                  {pathsError}
                </div>
              )}
            </div>

            {/* Row 4: Event Description */}
            <div style={{ marginTop: '16px' }}>
              <label
                htmlFor="event-description"
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#6B788A',
                  letterSpacing: '0.02em',
                  marginBottom: '6px',
                }}
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
          </>
        )}
      </div>

      {/* Action buttons & Persistence Error banner */}
      <div
        style={{
          position: 'absolute',
          left: '30px',
          top: '646px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {submitError && (
          <div
            data-testid="event-submit-error"
            style={{
              color: '#B42318',
              fontSize: '12px',
              fontWeight: 500,
              marginBottom: '10px',
            }}
          >
            {submitError}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting || isLoadingExisting}
            className={`auratio-admin-btn auratio-admin-btn--secondary ${
              isSubmitting || isLoadingExisting ? 'auratio-admin-btn--disabled' : ''
            }`}
            style={{
              width: '140px',
              height: '42px',
              fontSize: '13px',
              fontWeight: 600,
              ...(isSubmitting || isLoadingExisting ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
            }}
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting || isLoadingExisting}
            className={`auratio-admin-btn auratio-admin-btn--primary ${
              isSubmitting || isLoadingExisting ? 'auratio-admin-btn--disabled' : ''
            }`}
            style={{
              width: '160px',
              height: '42px',
              fontSize: '13px',
              fontWeight: 600,
              marginLeft: '12px',
              ...(isSubmitting || isLoadingExisting ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
            }}
          >
            Publish Event
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={!isExisting || isSubmitting || isLoadingExisting}
            aria-disabled={!isExisting || isSubmitting || isLoadingExisting}
            className={`auratio-admin-btn auratio-admin-btn--secondary ${
              !isExisting || isSubmitting || isLoadingExisting ? 'auratio-admin-btn--disabled' : ''
            }`}
            style={{
              width: '150px',
              height: '42px',
              fontSize: '13px',
              fontWeight: 600,
              marginLeft: '12px',
              ...(!isExisting || isSubmitting || isLoadingExisting
                ? { opacity: 0.5, cursor: 'not-allowed' }
                : {}),
            }}
          >
            Delete Event
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
