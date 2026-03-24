/**
 * Telegram Notification Helper
 *
 * Sends notifications directly to the user's Telegram via the Bot API.
 * This is a simple HTTP call — independent of Claude Code Channels.
 * Use this for scheduler completion/failure alerts.
 *
 * Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env
 */

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function notify(message) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
    return
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!response.ok) {
      console.error('[notify] Telegram API error:', await response.text())
    }
  } catch (err) {
    console.error('[notify] Failed to send notification:', err.message)
  }
}

module.exports = { notify }
