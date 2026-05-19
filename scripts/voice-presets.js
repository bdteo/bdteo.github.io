const VOICE_PRESETS = {
  alistair: {
    engine: "elevenlabs",
    voiceId: "UzI1NsMEV3ni5JRkRSls",
    label: "Alistair (ElevenLabs cultured British)",
    description:
      "Older, cultured British narrator. Literary, Shakespeare-actor cadence. Default for poetry and reflective essays.",
  },
  george: {
    engine: "elevenlabs",
    voiceId: "JBFqnCBsd6RMkjVDRZzb",
    label: "George (ElevenLabs mature British)",
    description:
      "Stock mature British narrator. Weighty, deliberate, news-anchor gravitas.",
  },
  ak: {
    engine: "elevenlabs",
    voiceId: "y0SYydk17lMbUIUvSf3N",
    label: "AK (ElevenLabs posh old man)",
    description:
      "Posh British older man. Aged study, smoking-jacket gravitas. Even more weight than George.",
  },
  bartholomew: {
    engine: "elevenlabs",
    voiceId: "omWvcHeMcJkn0HBRjJYE",
    label: "Bartholomew (ElevenLabs wise narrator)",
    description:
      "Warm wise narrator, hugely popular for long-form audiobooks. Rounder than George.",
  },
  "gravel-midnight": {
    engine: "elevenlabs",
    voiceId: "M5E055lOUxMi0kJpGyE9",
    label: "Gravel Midnight (ElevenLabs raspy)",
    description:
      "Raspy, gritty character voice. For poems with edge or weariness.",
  },
  bill: {
    engine: "elevenlabs",
    voiceId: "pqHfZKP75CvOlQylNhV4",
    label: "Bill (ElevenLabs American narrator)",
    description:
      "Stock older American documentary narrator. Warm gravitas, closest to am_santa's lane.",
  },
  brian: {
    engine: "elevenlabs",
    voiceId: "nPczCjzI2devNBz1zQrb",
    label: "Brian (ElevenLabs deep narrator)",
    description:
      "Stock deep American narrator. Gravelly bottom-end, trailer-voice energy.",
  },
  daniel: {
    engine: "elevenlabs",
    voiceId: "onwK4e9ZLuTAKqWW03F9",
    label: "Daniel (ElevenLabs British anchor)",
    description:
      "Stock authoritative British, news-anchor polish. Clean, neutral.",
  },
  "carmelo-bg": {
    engine: "elevenlabs",
    voiceId: "5egO01tkUjEzu7xSSE8M",
    label: "Carmelo (ElevenLabs Bulgarian)",
    description:
      "Bulgarian article-audio default chosen by Boris on 2026-05-19. Mature, mysterious, clear, and high quality in Bulgarian.",
  },
  santa: {
    engine: "kokoro",
    kokoroVoice: "am_santa",
    label: "Santa (Kokoro am_santa)",
    description:
      "Local Kokoro fallback. Free, runs at 127.0.0.1:8880. Used pre-ElevenLabs.",
  },
}

const DEFAULT_PRESET = "alistair"
const DEFAULT_PRESET_BY_LANGUAGE = {
  bg: "carmelo-bg",
}

const resolveVoice = nameOrId => {
  if (!nameOrId) {
    return { preset: DEFAULT_PRESET, ...VOICE_PRESETS[DEFAULT_PRESET] }
  }

  const key = nameOrId.toLowerCase()
  if (VOICE_PRESETS[key]) {
    return { preset: key, ...VOICE_PRESETS[key] }
  }

  // Kokoro voice naming convention: am_*, af_*, bm_*, bf_*.
  if (/^[abef][mf]_/.test(nameOrId)) {
    return {
      preset: null,
      engine: "kokoro",
      kokoroVoice: nameOrId,
      label: `Kokoro ${nameOrId}`,
      description: "Raw Kokoro voice name (not a registered preset).",
    }
  }

  // ElevenLabs voice IDs are 20-char alphanumerics.
  if (/^[A-Za-z0-9]{20}$/.test(nameOrId)) {
    return {
      preset: null,
      engine: "elevenlabs",
      voiceId: nameOrId,
      label: `ElevenLabs ${nameOrId}`,
      description: "Raw ElevenLabs voice ID (not a registered preset).",
    }
  }

  return null
}

const listPresets = () =>
  Object.entries(VOICE_PRESETS).map(([name, preset]) => ({ name, ...preset }))

module.exports = {
  VOICE_PRESETS,
  DEFAULT_PRESET,
  DEFAULT_PRESET_BY_LANGUAGE,
  resolveVoice,
  listPresets,
}
