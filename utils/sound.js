export function playNotificationSound() {
  try {
    const audio = new Audio('/liquid.wav')
    // best-effort play; ignore returned promise errors (autoplay policies)
    audio.play().catch(() => {})
  } catch (e) {
    // ignore
  }
}
