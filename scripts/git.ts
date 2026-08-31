import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/**
 * Execute a git command in the specified directory.
 */
export async function git(cwd: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync('git', args, { cwd })
    return stdout.trim()
  } catch (error: any) {
    throw new Error(`Git command failed: git ${args.join(' ')}\n${error.message}`)
  }
}
