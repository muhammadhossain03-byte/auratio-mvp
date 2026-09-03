import { AdminLayout } from '../components/AdminLayout'

export function AdminVolunteerTrackEligibilityPage() {
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
        Manage Farhana Islam’s track eligibility
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
        3 selected • minimum 1 required
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

        {/* Informative (checked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#041B3B',
              border: '1px solid #041B3B',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Informative
          </span>
        </div>

        {/* Extempore (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Extempore
          </span>
        </div>

        {/* Persuasive (checked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#041B3B',
              border: '1px solid #041B3B',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Persuasive
          </span>
        </div>

        {/* Argumentative / Debate (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Argumentative / Debate
          </span>
        </div>

        {/* Explanatory (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Explanatory
          </span>
        </div>
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

        {/* News Delivery (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            News Delivery
          </span>
        </div>

        {/* Business Pitch / Sales Pitch (checked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#041B3B',
              border: '1px solid #041B3B',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            ✓
          </div>
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Business Pitch / Sales Pitch
          </span>
        </div>

        {/* General Presentation / Multimedia (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            General Presentation / Multimedia
          </span>
        </div>

        {/* Academic — Poster / Project / Thesis (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Academic — Poster / Project / Thesis
          </span>
        </div>

        {/* Corporate Report (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Corporate Report
          </span>
        </div>
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

        {/* Infotainment-Oriented (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Infotainment-Oriented
          </span>
        </div>

        {/* Academic — Lecture / Course (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '38px' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Academic — Lecture / Course
          </span>
        </div>

        {/* Marketing / Promotional (unchecked) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '22px',
              height: '22px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #D1DBEB',
              borderRadius: '4px',
            }}
          />
          <span style={{ fontSize: '14px', color: '#111827', marginLeft: '16px' }}>
            Marketing / Promotional
          </span>
        </div>
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
        {/* Presentation-only buttons per live Figma findings */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-admin-btn auratio-admin-btn--primary auratio-admin-btn--presentation"
          style={{ width: '190px', height: '44px', fontSize: '14px', fontWeight: 600, borderRadius: '6px' }}
        >
          Save Eligibility
        </div>

        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-admin-btn auratio-admin-btn--secondary auratio-admin-btn--presentation"
          style={{ width: '120px', height: '44px', fontSize: '14px', fontWeight: 600, borderRadius: '6px', marginLeft: '16px', borderColor: '#D1DBEB' }}
        >
          Cancel
        </div>

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
