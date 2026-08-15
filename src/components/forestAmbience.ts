type ForestAmbience = {
  setEnabled: (enabled: boolean) => Promise<void>
  dispose: () => void
}

const AUDIO_URL = '/audio/main-birds.mp3'
const MASTER_GAIN = 0.36
const FADE_IN = 1.2
const FADE_OUT = 0.8
const LOOP_OVERLAP = 0.6

function fadeGain(gain: GainNode, value: number, time: number, duration: number) {
  gain.gain.cancelScheduledValues(time)
  gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), time)
  gain.gain.exponentialRampToValueAtTime(Math.max(value, 0.0001), time + duration)
}

type Voice = {
  source: AudioBufferSourceNode
  gain: GainNode
}

export function createForestAmbience(): ForestAmbience {
  let context: AudioContext | null = null
  let master: GainNode | null = null
  let buffer: AudioBuffer | null = null
  let load: Promise<void> | null = null
  let nextStart = 0
  let scheduleTimer = 0
  let voices: Voice[] = []
  let disposed = false
  let enabled = false

  function clearTimer() {
    window.clearTimeout(scheduleTimer)
    scheduleTimer = 0
  }

  function stopLoop() {
    clearTimer()
    for (const voice of voices) {
      voice.source.onended = null
      try {
        voice.source.stop()
      } catch (error) {
        if (!(error instanceof DOMException)) {
          throw error
        }
      }
      voice.source.disconnect()
      voice.gain.disconnect()
    }
    voices = []
  }

  function scheduleVoice() {
    if (!enabled || !context || !master || !buffer || context.state !== 'running') {
      return
    }

    const overlap = Math.min(LOOP_OVERLAP, buffer.duration / 4)
    const now = context.currentTime
    if (nextStart < now) {
      nextStart = now
    }

    const source = context.createBufferSource()
    const gain = context.createGain()
    source.buffer = buffer
    source.connect(gain)
    gain.connect(master)

    const start = nextStart
    const end = start + buffer.duration
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(1, start + overlap)
    gain.gain.setValueAtTime(1, Math.max(start + overlap, end - overlap))
    gain.gain.exponentialRampToValueAtTime(0.0001, end)

    source.start(start)
    source.stop(end + 0.05)

    const voice: Voice = { source, gain }
    voices.push(voice)
    source.onended = () => {
      voices = voices.filter((item) => item.source !== source)
      source.disconnect()
      gain.disconnect()
    }

    nextStart = start + buffer.duration - overlap
    const waitMs = Math.max(50, (nextStart - context.currentTime - 1) * 1000)
    scheduleTimer = window.setTimeout(scheduleVoice, waitMs)
  }

  async function ensure() {
    if (buffer && context && master) {
      return
    }

    if (!load) {
      load = (async () => {
        const next = new AudioContext()
        const output = next.createGain()
        output.gain.value = 0.0001
        output.connect(next.destination)

        try {
          const response = await fetch(AUDIO_URL)
          if (!response.ok) {
            throw new Error('Ambience audio is unavailable.')
          }

          const data = await response.arrayBuffer()
          const decoded = await next.decodeAudioData(data)
          context = next
          master = output
          buffer = decoded
        } catch (error) {
          load = null
          await next.close()
          throw error
        }
      })()
    }

    await load
  }

  return {
    async setEnabled(nextEnabled) {
      if (disposed) {
        return
      }

      enabled = nextEnabled

      if (!nextEnabled) {
        stopLoop()
        if (context && master) {
          fadeGain(master, 0.0001, context.currentTime, FADE_OUT)
          await context.suspend()
        }
        return
      }

      await ensure()
      if (!context || !master || !buffer) {
        return
      }

      await context.resume()
      fadeGain(master, MASTER_GAIN, context.currentTime, FADE_IN)

      if (voices.length === 0) {
        nextStart = context.currentTime
        scheduleVoice()
      }
    },
    dispose() {
      disposed = true
      enabled = false
      stopLoop()
      load = null
      buffer = null
      master?.disconnect()
      master = null
      if (context) {
        void context.close()
        context = null
      }
    },
  }
}
