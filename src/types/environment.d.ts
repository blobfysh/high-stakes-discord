declare namespace NodeJS {
	export interface ProcessEnv {
		NODE_ENV?: string
		DATABASE_URL: string
		PREFIX: string
		BOT_TOKEN: string
	}
}
