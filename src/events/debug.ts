import { debug } from '../config'

export async function run(message: string): Promise<void> {
	if (debug) console.error(message)
}
