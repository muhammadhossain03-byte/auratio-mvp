import { useEffect, useState } from 'react'

import { createPersistedVolunteerVideoSource } from '../integration/persistedVolunteerScoring'

interface PersistedVolunteerVideoPlayerProps {
  submissionId: string
}

export function PersistedVolunteerVideoPlayer({
  submissionId,
}: PersistedVolunteerVideoPlayerProps) {
  const [source, setSource] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setSource(null)
    setError(null)

    void createPersistedVolunteerVideoSource(submissionId)
      .then((video) => {
        if (!active) return
        setSource(video?.url ?? null)
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Unable to authorize video access.')
      })

    return () => {
      active = false
    }
  }, [submissionId])

  return (
    <div
      className="auratio-volunteer-panel"
      style={{
        left: '30px',
        top: '124px',
        width: '1076px',
        height: '330px',
        borderRadius: '14px',
        boxSizing: 'border-box',
      }}
    >
      <h3 className="auratio-volunteer-panel-title">Submitted video</h3>

      {error ? (
        <p role="alert" style={{ position: 'absolute', left: '18px', top: '74px' }}>
          {error}
        </p>
      ) : source ? (
        <video
          src={source}
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
      ) : (
        <p style={{ position: 'absolute', left: '18px', top: '74px' }}>
          Loading authorized video…
        </p>
      )}
    </div>
  )
}
