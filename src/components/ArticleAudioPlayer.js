import * as React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons"

import { getChrome } from "../../i18n.config"

const DEFAULT_PLAYBACK_RATE = 1
const SPEEDS = [DEFAULT_PLAYBACK_RATE, 1.25, 1.5]
const PLAYBACK_RATE_STORAGE_KEY = "bdteo.articleAudio.playbackRate"

const isSupportedSpeed = speed => SPEEDS.includes(speed)

const getLocalStorage = () => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    return window.localStorage
  } catch (error) {
    return null
  }
}

const getStoredPlaybackRate = () => {
  const storage = getLocalStorage()

  if (!storage) {
    return DEFAULT_PLAYBACK_RATE
  }

  let storedPlaybackRate = DEFAULT_PLAYBACK_RATE

  try {
    storedPlaybackRate = Number(storage.getItem(PLAYBACK_RATE_STORAGE_KEY))
  } catch (error) {
    return DEFAULT_PLAYBACK_RATE
  }

  return isSupportedSpeed(storedPlaybackRate)
    ? storedPlaybackRate
    : DEFAULT_PLAYBACK_RATE
}

const storePlaybackRate = playbackRate => {
  if (!isSupportedSpeed(playbackRate)) {
    return
  }

  const storage = getLocalStorage()

  if (!storage) {
    return
  }

  try {
    storage.setItem(PLAYBACK_RATE_STORAGE_KEY, String(playbackRate))
  } catch (error) {
    // Browser privacy modes can reject storage writes; playback still works.
  }
}

const applyPlaybackRate = (audio, playbackRate) => {
  if (audio && isSupportedSpeed(playbackRate)) {
    audio.playbackRate = playbackRate
  }
}

const formatTime = seconds => {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00"
  }

  const rounded = Math.round(seconds)
  const minutes = Math.floor(rounded / 60)
  const remainder = String(rounded % 60).padStart(2, "0")

  return `${minutes}:${remainder}`
}

const parseDuration = duration => {
  if (!duration) {
    return 0
  }

  const parts = String(duration)
    .split(":")
    .map(part => Number.parseInt(part, 10))

  if (parts.some(Number.isNaN)) {
    return 0
  }

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  return 0
}

const audioIsPlaying = audio => !audio.paused && !audio.ended

const ArticleAudioPlayer = ({
  title,
  src,
  duration,
  lang,
  isFallback = false,
}) => {
  const audioRef = React.useRef(null)
  const playbackRateRef = React.useRef(DEFAULT_PLAYBACK_RATE)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [measuredDuration, setMeasuredDuration] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [playbackRate, setPlaybackRate] = React.useState(DEFAULT_PLAYBACK_RATE)
  const [hasError, setHasError] = React.useState(false)
  const labels = getChrome(lang).articleAudio

  const fallbackDuration = React.useMemo(
    () => parseDuration(duration),
    [duration],
  )
  const totalDuration = measuredDuration || fallbackDuration
  const progress =
    totalDuration > 0 ? Math.min((currentTime / totalDuration) * 100, 100) : 0

  React.useEffect(() => {
    playbackRateRef.current = playbackRate
    applyPlaybackRate(audioRef.current, playbackRate)
  }, [playbackRate])

  React.useEffect(() => {
    const storedPlaybackRate = getStoredPlaybackRate()

    if (storedPlaybackRate !== playbackRateRef.current) {
      playbackRateRef.current = storedPlaybackRate
      setPlaybackRate(storedPlaybackRate)
      applyPlaybackRate(audioRef.current, storedPlaybackRate)
    }
  }, [])

  React.useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return undefined
    }

    const syncTime = () => setCurrentTime(audio.currentTime || 0)
    const syncPlaybackState = () => {
      setIsPlaying(audioIsPlaying(audio))
    }
    const syncMetadata = () => {
      applyPlaybackRate(audio, playbackRateRef.current)
      setMeasuredDuration(audio.duration || 0)
      syncPlaybackState()
    }
    const finish = () => {
      syncTime()
      setIsPlaying(false)
    }
    const fail = () => {
      setHasError(true)
      setIsPlaying(false)
    }

    audio.addEventListener("loadedmetadata", syncMetadata)
    audio.addEventListener("durationchange", syncMetadata)
    audio.addEventListener("play", syncPlaybackState)
    audio.addEventListener("playing", syncPlaybackState)
    audio.addEventListener("pause", syncPlaybackState)
    audio.addEventListener("timeupdate", syncTime)
    audio.addEventListener("ended", finish)
    audio.addEventListener("error", fail)

    syncMetadata()
    syncTime()
    syncPlaybackState()

    return () => {
      audio.removeEventListener("loadedmetadata", syncMetadata)
      audio.removeEventListener("durationchange", syncMetadata)
      audio.removeEventListener("play", syncPlaybackState)
      audio.removeEventListener("playing", syncPlaybackState)
      audio.removeEventListener("pause", syncPlaybackState)
      audio.removeEventListener("timeupdate", syncTime)
      audio.removeEventListener("ended", finish)
      audio.removeEventListener("error", fail)
    }
  }, [src])

  if (!src) {
    return null
  }

  const label =
    isFallback && labels.fallbackLabel ? labels.fallbackLabel : labels.label
  const playerTitle =
    isFallback && labels.fallbackTitle ? labels.fallbackTitle : labels.title

  const togglePlayback = async () => {
    const audio = audioRef.current

    if (!audio || hasError) {
      return
    }

    if (audio.paused) {
      try {
        applyPlaybackRate(audio, playbackRateRef.current)
        await audio.play()
        setIsPlaying(audioIsPlaying(audio))
      } catch (error) {
        setIsPlaying(false)
      }
    } else {
      audio.pause()
      setIsPlaying(audioIsPlaying(audio))
    }
  }

  const changeProgress = event => {
    const audio = audioRef.current
    const nextProgress = Number(event.target.value)

    if (!audio || !Number.isFinite(nextProgress) || totalDuration <= 0) {
      return
    }

    const nextTime = (nextProgress / 100) * totalDuration
    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const changeSpeed = event => {
    const nextSpeed = Number(event.target.value)

    if (Number.isFinite(nextSpeed) && isSupportedSpeed(nextSpeed)) {
      playbackRateRef.current = nextSpeed
      setPlaybackRate(nextSpeed)
      applyPlaybackRate(audioRef.current, nextSpeed)
      storePlaybackRate(nextSpeed)
    }
  }

  return (
    <section
      className={`bt--article-audio${isPlaying ? " bt--article-audio--playing" : ""}`}
      aria-label={`${label} ${title}`}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="metadata" src={src} />

      <div className="bt--article-audio__controls">
        <fieldset className="bt--article-audio__secondary">
          <legend className="sr-only">{labels.speedLegend}</legend>
          <div className="bt--article-audio__speed-options">
            {SPEEDS.map(speed => (
              <label className="bt--article-audio__speed-option" key={speed}>
                <input
                  type="radio"
                  name={`article-speed-${title}`}
                  value={speed}
                  checked={playbackRate === speed}
                  onChange={changeSpeed}
                  disabled={hasError}
                />
                <span>{speed}x</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="bt--article-audio__play-column">
          <button
            className="bt--article-audio__play"
            type="button"
            onClick={togglePlayback}
            disabled={hasError}
            aria-label={isPlaying ? labels.pause : labels.play}
            title={isPlaying ? labels.pause : labels.play}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
        </div>
      </div>

      <div className="bt--article-audio__body">
        <div className="bt--article-audio__header">
          <div className="bt--article-audio__copy">
            <p className="bt--article-audio__title">{playerTitle}</p>
            <p className="bt--article-audio__meta">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </p>
          </div>
        </div>

        <label className="bt--article-audio__scrubber-label">
          <span className="sr-only">{labels.progress}</span>
          <input
            className="bt--article-audio__scrubber"
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={Number.isFinite(progress) ? progress : 0}
            onChange={changeProgress}
            style={{ "--progress": `${progress}%` }}
            disabled={hasError || totalDuration <= 0}
          />
        </label>
      </div>

      {hasError && <p className="bt--article-audio__error">{labels.error}</p>}
    </section>
  )
}

export default ArticleAudioPlayer
