import { execFileSync } from 'node:child_process'
import { createInterface } from 'node:readline/promises'
import { createClient } from '@supabase/supabase-js'

const status = JSON.parse(execFileSync('supabase', ['status', '-o', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
const prompt = createInterface({ input: process.stdin, output: process.stdout })
const email = await prompt.question('Presenter email: ')
const password = await prompt.question('Presenter password: ')
prompt.close()

const { error } = await createClient(status.API_URL, status.SERVICE_ROLE_KEY).auth.admin.createUser({ email, password, email_confirm: true })
if (error) {
  console.error(error.message)
  process.exit(1)
}
console.log(`${email} can now sign in on /presenter.html`)
