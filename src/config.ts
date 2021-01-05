export const debug = process.env.NODE_ENV !== 'production'

export const botToken = process.env.BOT_TOKEN

// Used for creating slash commands
export const clientId = process.env.BOT_CLIENT_ID

// Used in app.ts when creating slash commands if debug is true.
// It allows you to test slash commands faster since global slash commands are cached for 1 hour.
export const testingGuildId = process.env.TESTING_GUILD_ID

export const prefix = '>'

// User ids of users who have admin permissions (can run commands with the 'admin' category)
export const adminUsers = ['168958344361541633']
