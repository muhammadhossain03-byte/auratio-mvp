import type { CSSProperties } from 'react'
import { getVolunteerEvaluationVideoSource } from '../data/volunteerEvaluationMedia'

interface VolunteerEvaluationVideoPlayerProps {
  submissionId: string
  style?: CSSProperties
  title?: string
}

export function VolunteerEvaluationVideoPlayer({
  submissionId,
  style,
  title = 'Submitted video',
}: VolunteerEvaluationVideoPlayerProps) {
  const source = getVolunteerEvaluationVideoSource(submissionId)

  if (!source) return null

  return (
    <div
      className="auratio-volunteer-panel"
      data-testid="volunteer-evaluation-video-panel"
      style={{
        left: '30px',
        width: '1076px',
        height: '330px',
        borderRadius: '14px',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <h3 className="auratio-volunteer-panel-title">{title}</h3>
      <span
        style={{
          position: 'absolute',
          right: '18px',
          top: '20px',
          fontFamily: 'var(--auratio-font-family-inter), sans-serif',
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '18px',
          color: 'var(--auratio-neutral-500)',
        }}
      >
        Play • seek • volume • fullscreen
      </span>

      <video
        data-testid="volunteer-evaluation-video"
        data-submission-id={submissionId}
        data-media-kind={source.sourceKind}
        src={source.src}
        controls
        playsInline
        preload="metadata"
        style={{
          position: 'absolute',
          left: '18px',
          top: '58px',
          width: '1040px',
          height: '248px',
          borderRadius: '10px',
          backgroundColor: '#020617',
          objectFit: 'contain',
        }}
      >
        Your browser does not support HTML video.
      </video>
    </div>
  )
}
