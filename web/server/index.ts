import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { query } from '@anthropic-ai/claude-agent-sdk'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// POMASA framework data directory
const DATA_DIR = path.resolve(__dirname, '../data')

app.use(cors())
app.use(express.json({ limit: '10mb' }))

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

interface Pattern {
  id: string
  name: string
  category: 'COR' | 'STR' | 'BHV' | 'QUA'
  necessity: 'Required' | 'Recommended' | 'Optional'
  description: string
  filePath: string
}

async function buildFileTree(dirPath: string): Promise<FileNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  const nodes: FileNode[] = []

  const sortedEntries = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })

  for (const entry of sortedEntries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue
    }

    const fullPath = path.join(dirPath, entry.name)
    const node: FileNode = {
      name: entry.name,
      path: fullPath,
      type: entry.isDirectory() ? 'directory' : 'file'
    }

    if (entry.isDirectory()) {
      node.children = await buildFileTree(fullPath)
    }

    nodes.push(node)
  }

  return nodes
}

// Parse patterns from README.md
async function parsePatterns(): Promise<Pattern[]> {
  const readmePath = path.join(DATA_DIR, 'patterns', 'README.md')
  const content = await fs.readFile(readmePath, 'utf-8')

  const patterns: Pattern[] = []
  const categoryMap: Record<string, 'COR' | 'STR' | 'BHV' | 'QUA'> = {
    'COR': 'COR',
    'STR': 'STR',
    'BHV': 'BHV',
    'QUA': 'QUA'
  }

  // Parse pattern tables from README
  const tableRegex = /\|\s*(COR|STR|BHV|QUA)-(\d+)\s*\|\s*\[([^\]]+)\]\([^)]+\)\s*\|\s*(Required|Recommended|Optional)\s*\|\s*([^|]+)\|/g
  let match

  while ((match = tableRegex.exec(content)) !== null) {
    const [, prefix, num, name, necessity, description] = match
    const id = `${prefix}-${num.padStart(2, '0')}`
    patterns.push({
      id,
      name: name.trim(),
      category: categoryMap[prefix],
      necessity: necessity as Pattern['necessity'],
      description: description.trim(),
      filePath: path.join(DATA_DIR, 'patterns', `${id}-${name.toLowerCase().replace(/\s+/g, '-')}.md`)
    })
  }

  return patterns
}

// Open folder selection dialog
app.post('/api/dialog/select-folder', async (req, res) => {
  const prompt = req.body.prompt || 'Select folder'
  try {
    const { stdout } = await execAsync(`osascript -e 'POSIX path of (choose folder with prompt "${prompt}")'`)
    const selectedPath = stdout.trim().replace(/\/$/, '')
    res.json({ path: selectedPath })
  } catch {
    res.json({ path: null })
  }
})

// Open file selection dialog (multiple files)
app.post('/api/dialog/select-files', async (req, res) => {
  const prompt = req.body.prompt || 'Select files'
  try {
    const script = `
      set fileList to choose file with prompt "${prompt}" with multiple selections allowed
      set posixPaths to {}
      repeat with f in fileList
        set end of posixPaths to POSIX path of f
      end repeat
      set AppleScript's text item delimiters to "\\n"
      return posixPaths as text
    `
    const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\\''")}'`)
    const paths = stdout.trim().split('\n').filter(p => p.length > 0)
    res.json({ paths })
  } catch {
    res.json({ paths: [] })
  }
})

// Get MAS info
app.get('/api/mas/info', async (req, res) => {
  const masPath = req.query.path as string
  if (!masPath) {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  try {
    const stat = await fs.stat(masPath)
    if (!stat.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' })
    }

    const tree = await buildFileTree(masPath)
    const name = path.basename(masPath)

    res.json({ name, path: masPath, tree })
  } catch {
    res.status(500).json({ error: 'Failed to read directory' })
  }
})

// Read file content
app.get('/api/mas/file', async (req, res) => {
  const filePath = req.query.path as string
  if (!filePath) {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8')
    res.json({ content })
  } catch {
    res.status(500).json({ error: 'Failed to read file' })
  }
})

// ========== Framework APIs ==========

// Get patterns list
app.get('/api/framework/patterns', async (_req, res) => {
  try {
    const patterns = await parsePatterns()
    res.json({ patterns })
  } catch (error) {
    console.error('Failed to parse patterns:', error)
    res.status(500).json({ error: 'Failed to load patterns' })
  }
})

// Get user input template
app.get('/api/framework/template', async (_req, res) => {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, 'user_input_template.md'), 'utf-8')
    res.json({ content })
  } catch {
    res.status(500).json({ error: 'Failed to load template' })
  }
})

// Get generator prompt
app.get('/api/framework/generator', async (_req, res) => {
  try {
    const content = await fs.readFile(path.join(DATA_DIR, 'generator.md'), 'utf-8')
    res.json({ content })
  } catch {
    res.status(500).json({ error: 'Failed to load generator' })
  }
})

// ========== Create MAS API ==========

interface ReferenceFile {
  path: string
  description: string
}

interface CreateMasRequest {
  targetDir: string
  masName: string
  userInput: {
    blueprintLanguage: string
    reportLanguage: string
    projectId: string
    researchTopic: string
    initialIdeas: string
    dataSources: string
    references: ReferenceFile[]
    analysisMethods: string
    reportFormat: string
    reportStructure: string
    qualityLevel: 'simple' | 'standard' | 'strict'
    patternOverrides: string
    otherRequirements: string
  }
  selectedPatterns: string[]
}

app.post('/api/mas/create', async (req, res) => {
  const { targetDir, masName, userInput, selectedPatterns } = req.body as CreateMasRequest

  if (!targetDir || !masName) {
    return res.status(400).json({ error: 'Missing targetDir or masName' })
  }

  const masPath = path.join(targetDir, masName)

  // Check if directory already exists
  try {
    await fs.access(masPath)
    return res.status(400).json({ error: 'Directory already exists' })
  } catch {
    // Directory doesn't exist, good to proceed
  }

  // Create the directory
  await fs.mkdir(masPath, { recursive: true })

  // Read generator prompt
  const generatorContent = await fs.readFile(path.join(DATA_DIR, 'generator.md'), 'utf-8')

  // Build user input content
  const userInputContent = `# User Input

## Language Settings

**Agent Blueprint Language**: ${userInput.blueprintLanguage}

**Report Output Language**: ${userInput.reportLanguage}

---

## Research Project Basic Information

**Project Identifier**: ${userInput.projectId}

**Research Topic and Core Questions**:

${userInput.researchTopic}

**Initial Ideas and Insights**:

${userInput.initialIdeas}

---

## Data Collection

**Data Sources**:

${userInput.dataSources}

**Existing Reference Materials**:

${userInput.references.length > 0
    ? userInput.references.map(ref =>
        ref.description
          ? `- ${ref.path} - ${ref.description}`
          : `- ${ref.path}`
      ).join('\n')
    : 'None'}

---

## Analysis Methods

**Analysis Methods**:

${userInput.analysisMethods}

---

## Output Format

**Report Format**:

${userInput.reportFormat}

**Report Structure**:

${userInput.reportStructure}

---

## Pattern Selection

**Quality Assurance Level**: ${userInput.qualityLevel}

**Selected Patterns**: ${selectedPatterns.join(', ')}

**Other Patterns to Enable or Disable**:

${userInput.patternOverrides || 'None'}

---

## Other Requirements

${userInput.otherRequirements || 'None'}
`

  // Write user_input.md to the MAS directory
  await fs.writeFile(path.join(masPath, 'user_input.md'), userInputContent)

  // Build the prompt for Claude
  const prompt = `Please read the generator instructions and create a MAS (Multi-Agent System).

## Generator Instructions

${generatorContent}

## POMASA Framework Location

The POMASA pattern catalog is located at: ${path.join(DATA_DIR, 'patterns')}

## User Input

${userInputContent}

## Target Directory

Create the MAS in: ${masPath}

Please create all necessary files (agents/, references/, data/ directories and their contents) according to the generator instructions and user input.`

  // Set response headers for streaming
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Use Claude Agent SDK for streaming output
  try {
    const result = await query({
      prompt,
      options: {
        cwd: masPath,
        permissionMode: 'acceptEdits'
      }
    })

    for await (const message of result) {
      // Handle different message types from the SDK
      if (message.type === 'assistant') {
        // Text output from Claude
        if (message.message?.content) {
          for (const block of message.message.content) {
            if (block.type === 'text') {
              res.write(`data: ${JSON.stringify({ type: 'output', content: block.text })}\n\n`)
            } else if (block.type === 'tool_use') {
              res.write(`data: ${JSON.stringify({ type: 'output', content: `[Tool: ${block.name}]\n` })}\n\n`)
            }
          }
        }
      } else if (message.type === 'result') {
        // Final result
        res.write(`data: ${JSON.stringify({ type: 'output', content: '\n--- Completed ---\n' })}\n\n`)
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done', code: 0, masPath })}\n\n`)
    res.end()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    res.write(`data: ${JSON.stringify({ type: 'error', content: errorMessage })}\n\n`)
    res.write(`data: ${JSON.stringify({ type: 'done', code: 1, masPath })}\n\n`)
    res.end()
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(`POMASA data directory: ${DATA_DIR}`)
})
