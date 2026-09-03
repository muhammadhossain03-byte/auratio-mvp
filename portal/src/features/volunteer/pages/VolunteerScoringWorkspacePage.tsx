import { VolunteerLayout } from '../components/VolunteerLayout'

export function VolunteerScoringWorkspacePage() {
  return (
    <VolunteerLayout
      ariaLabel="Evaluator Scoring Workspace"
      topbarTitle="Human Evaluation Workspace"
      topbarRightVariant="scoring"
      activeNav="assignments"
    >
      <h2 className="auratio-volunteer-page-title" style={{ top: '32px' }}>
        SUB-8821
      </h2>
      <p className="auratio-volunteer-page-subtitle" style={{ top: '74px' }}>
        Business Pitch / Sales Pitch • active Human Evaluation scoring
      </p>

      {/* Header Status Pill */}
      <div
        className="auratio-volunteer-pill auratio-volunteer-pill--in-evaluation-header"
        style={{
          position: 'absolute',
          left: '920px',
          top: '34px',
          width: '150px',
          height: '36px',
        }}
      >
        In Evaluation
      </div>

      {/* Evaluation Progress Card */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '120px',
          width: '1076px',
          height: '128px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Evaluation progress</h3>

        {/* Step 1 */}
        <span
          style={{
            position: 'absolute',
            left: '22px',
            top: '56px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          1. Context
        </span>
        <span
          style={{
            position: 'absolute',
            left: '22px',
            top: '82px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Complete
        </span>

        {/* Step 2 */}
        <span
          style={{
            position: 'absolute',
            left: '272px',
            top: '56px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          2. Anchor-first scoring
        </span>
        <span
          style={{
            position: 'absolute',
            left: '272px',
            top: '82px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          In progress
        </span>

        {/* Step 3 */}
        <span
          style={{
            position: 'absolute',
            left: '522px',
            top: '56px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          3. Evidence + feedback
        </span>
        <span
          style={{
            position: 'absolute',
            left: '522px',
            top: '82px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Required
        </span>

        {/* Step 4 */}
        <span
          style={{
            position: 'absolute',
            left: '772px',
            top: '56px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 400,
            lineHeight: '18px',
            color: 'var(--auratio-neutral-500)',
          }}
        >
          4. Review
        </span>
        <span
          style={{
            position: 'absolute',
            left: '772px',
            top: '82px',
            width: '220px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Ready when complete
        </span>
      </div>

      {/* Left Column: Calculated score */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '276px',
          width: '360px',
          height: '286px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Calculated score</h3>

        {/* Row 1 */}
        <span
          style={{
            position: 'absolute',
            left: '20px',
            top: '58px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Universal Delivery
        </span>
        <span
          style={{
            position: 'absolute',
            left: '238px',
            top: '56px',
            width: '96px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          34 / 40
        </span>

        {/* Row 2 */}
        <span
          style={{
            position: 'absolute',
            left: '20px',
            top: '106px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Structural Flow
        </span>
        <span
          style={{
            position: 'absolute',
            left: '238px',
            top: '104px',
            width: '96px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          17 / 20
        </span>

        {/* Row 3 */}
        <span
          style={{
            position: 'absolute',
            left: '20px',
            top: '154px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Track Specialisation
        </span>
        <span
          style={{
            position: 'absolute',
            left: '238px',
            top: '152px',
            width: '96px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          34 / 40
        </span>

        {/* Row 4 */}
        <span
          style={{
            position: 'absolute',
            left: '20px',
            top: '214px',
            width: '180px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Submission Score
        </span>
        <span
          style={{
            position: 'absolute',
            left: '230px',
            top: '208px',
            width: '110px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            lineHeight: '32px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          85 / 100
        </span>
      </div>

      {/* Right Column: Completeness */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '420px',
          top: '276px',
          width: '686px',
          height: '286px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Completeness</h3>

        {/* Row 1 */}
        <span
          style={{
            position: 'absolute',
            left: '24px',
            top: '58px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Criterion scores
        </span>
        <span
          style={{
            position: 'absolute',
            left: '250px',
            top: '56px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          16 / 16
        </span>

        {/* Row 2 */}
        <span
          style={{
            position: 'absolute',
            left: '24px',
            top: '106px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Structured criterion feedback
        </span>
        <span
          style={{
            position: 'absolute',
            left: '250px',
            top: '104px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          16 / 16 criteria complete
        </span>

        {/* Row 3 */}
        <span
          style={{
            position: 'absolute',
            left: '24px',
            top: '154px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Anchor selections
        </span>
        <span
          style={{
            position: 'absolute',
            left: '250px',
            top: '152px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          16 / 16 assessed
        </span>

        {/* Row 4 */}
        <span
          style={{
            position: 'absolute',
            left: '24px',
            top: '202px',
            width: '210px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          Review readiness
        </span>
        <span
          style={{
            position: 'absolute',
            left: '250px',
            top: '200px',
            width: '310px',
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '18px',
            fontWeight: 600,
            lineHeight: '26px',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          Ready for review
        </span>

        {/* Presentation-only Batch 3 boundary buttons */}
        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-volunteer-btn auratio-volunteer-btn--secondary auratio-volunteer-btn--presentation"
          style={{
            position: 'absolute',
            left: '24px',
            top: '232px',
            width: '210px',
            height: '40px',
            borderRadius: '8px',
          }}
        >
          Open Universal Delivery
        </div>

        <div
          role="presentation"
          aria-hidden="true"
          className="auratio-volunteer-btn auratio-volunteer-btn--primary auratio-volunteer-btn--presentation"
          style={{
            position: 'absolute',
            left: '250px',
            top: '232px',
            width: '188px',
            height: '44px',
          }}
        >
          Review & Submit
        </div>
      </div>

      {/* Bottom Panel: Integrity boundary */}
      <div
        className="auratio-volunteer-panel"
        style={{
          left: '30px',
          top: '592px',
          width: '1076px',
          height: '156px',
          borderRadius: '14px',
        }}
      >
        <h3 className="auratio-volunteer-panel-title">Integrity boundary</h3>
        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '56px',
            width: '1000px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',
            color: 'var(--auratio-neutral-600)',
          }}
        >
          The total shown here is derived from criterion inputs. Publication Status remains Processing; scoring completion does not publish the result.
        </p>

        <p
          style={{
            position: 'absolute',
            left: '18px',
            top: '104px',
            width: '1000px',
            margin: 0,
            fontFamily: 'var(--auratio-font-family-inter), sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            lineHeight: '20px',
            letterSpacing: '0.0143em',
            color: 'var(--auratio-neutral-900)',
          }}
        >
          No leaderboard position, prior score, Track Mastery, prior feedback, or unnecessary user profile context is exposed.
        </p>
      </div>
    </VolunteerLayout>
  )
}
