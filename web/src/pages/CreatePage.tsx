import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, FolderOpen, Check, Loader2, FileText, X } from 'lucide-react'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { usePageTitle } from '../hooks/usePageTitle'

interface Pattern {
  id: string
  name: string
  category: 'COR' | 'STR' | 'BHV' | 'QUA'
  necessity: 'Required' | 'Recommended' | 'Optional'
  description: string
}

interface ReferenceFile {
  path: string
  description: string
}

interface UserInput {
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

const getDefaultUserInput = (t: (key: string) => string): UserInput => ({
  blueprintLanguage: 'English',
  reportLanguage: 'English',
  projectId: '',
  researchTopic: '',
  initialIdeas: '',
  dataSources: t('create.dataSourcesDefault'),
  references: [],
  analysisMethods: t('create.analysisMethodsDefault'),
  reportFormat: t('create.reportFormatDefault'),
  reportStructure: t('create.analysisMethodsDefault'),
  qualityLevel: 'standard',
  patternOverrides: '',
  otherRequirements: ''
})

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  COR: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  STR: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  BHV: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  QUA: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' }
}

const necessityColors: Record<string, { bg: string; text: string }> = {
  Required: { bg: 'bg-red-100', text: 'text-red-700' },
  Recommended: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Optional: { bg: 'bg-gray-100', text: 'text-gray-600' }
}

export default function CreatePage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  usePageTitle('create.pageTitle')

  const [step, setStep] = useState<'form' | 'patterns' | 'creating'>('form')
  const [targetDir, setTargetDir] = useState('')
  const [userInput, setUserInput] = useState<UserInput>(() => getDefaultUserInput(t))
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(new Set())
  const [output, setOutput] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [createdMasPath, setCreatedMasPath] = useState<string | null>(null)

  useEffect(() => {
    // Load patterns
    fetch('/api/framework/patterns')
      .then(res => res.json())
      .then(data => {
        setPatterns(data.patterns)
        // Select required and recommended patterns by default
        const defaults = new Set<string>(
          data.patterns
            .filter((p: Pattern) => p.necessity === 'Required' || p.necessity === 'Recommended')
            .map((p: Pattern) => p.id)
        )
        setSelectedPatterns(defaults)
      })
      .catch(console.error)
  }, [])

  const handleSelectFolder = async () => {
    try {
      const response = await fetch('/api/dialog/select-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: t('create.selectParentFolder') })
      })
      const data = await response.json()
      if (data.path) {
        setTargetDir(data.path)
      }
    } catch (error) {
      console.error('Failed to select folder:', error)
    }
  }

  const handleSelectReferences = async () => {
    try {
      const response = await fetch('/api/dialog/select-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: t('create.references') })
      })
      const data = await response.json()
      if (data.paths && data.paths.length > 0) {
        // Append to existing references, avoiding duplicates
        const existingPaths = userInput.references.map(r => r.path)
        const newFiles = data.paths
          .filter((p: string) => !existingPaths.includes(p))
          .map((p: string) => ({ path: p, description: '' }))
        setUserInput({ ...userInput, references: [...userInput.references, ...newFiles] })
      }
    } catch (error) {
      console.error('Failed to select files:', error)
    }
  }

  const handleRemoveReference = (path: string) => {
    setUserInput({
      ...userInput,
      references: userInput.references.filter(r => r.path !== path)
    })
  }

  const handleUpdateReferenceDescription = (path: string, description: string) => {
    setUserInput({
      ...userInput,
      references: userInput.references.map(r =>
        r.path === path ? { ...r, description } : r
      )
    })
  }

  const handlePatternToggle = (patternId: string, pattern: Pattern) => {
    // Don't allow unchecking required patterns
    if (pattern.necessity === 'Required') return

    setSelectedPatterns(prev => {
      const next = new Set(prev)
      if (next.has(patternId)) {
        next.delete(patternId)
      } else {
        next.add(patternId)
      }
      return next
    })
  }

  const handleCreate = async () => {
    if (!targetDir || !userInput.projectId) {
      alert(t('create.missingFields'))
      return
    }

    setStep('creating')
    setIsCreating(true)
    setOutput([])

    try {
      const response = await fetch('/api/mas/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetDir,
          masName: userInput.projectId,
          userInput,
          selectedPatterns: Array.from(selectedPatterns)
        })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split('\n').filter(line => line.startsWith('data: '))

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'output' || data.type === 'error') {
                setOutput(prev => [...prev, data.content])
              } else if (data.type === 'done') {
                setIsCreating(false)
                if (data.code === 0) {
                  setCreatedMasPath(data.masPath)
                }
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      setOutput(prev => [...prev, `Error: ${error}`])
      setIsCreating(false)
    }
  }

  const groupedPatterns = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = []
    }
    acc[pattern.category].push(pattern)
    return acc
  }, {} as Record<string, Pattern[]>)

  const categoryOrder = ['COR', 'STR', 'BHV', 'QUA']
  const categoryNames: Record<string, string> = {
    COR: 'Core',
    STR: 'Structure',
    BHV: 'Behavior',
    QUA: 'Quality'
  }

  if (step === 'creating') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
          <h1 className="text-lg font-semibold">{t('create.creating')}</h1>
          <span className="flex-1" />
          <LanguageSwitcher />
        </header>

        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 h-96 overflow-y-auto">
              {output.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">{line}</div>
              ))}
              {isCreating && (
                <div className="flex items-center gap-2 text-blue-400 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('create.running')}
                </div>
              )}
            </div>

            {!isCreating && createdMasPath && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => navigate(`/view?path=${encodeURIComponent(createdMasPath)}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {t('create.viewCreatedMas')}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('view.backToHome')}
                </button>
              </div>
            )}

            {!isCreating && !createdMasPath && (
              <div className="mt-6">
                <button
                  onClick={() => setStep('patterns')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common.back')}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  if (step === 'patterns') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setStep('form')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">{t('create.selectPatterns')}</h1>
          <span className="flex-1" />
          <LanguageSwitcher />
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {categoryOrder.map(category => (
              groupedPatterns[category] && (
                <div key={category}>
                  <h2 className={`text-lg font-semibold mb-3 ${categoryColors[category].text}`}>
                    {categoryNames[category]} Patterns
                  </h2>
                  <div className="space-y-2">
                    {groupedPatterns[category].map(pattern => (
                      <div
                        key={pattern.id}
                        onClick={() => handlePatternToggle(pattern.id, pattern)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedPatterns.has(pattern.id)
                            ? `${categoryColors[category].bg} ${categoryColors[category].border}`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        } ${pattern.necessity === 'Required' ? 'cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                            selectedPatterns.has(pattern.id)
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300'
                          }`}>
                            {selectedPatterns.has(pattern.id) && <Check className="w-3 h-3" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{pattern.id}</span>
                              <span className="text-gray-600">{pattern.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${necessityColors[pattern.necessity].bg} ${necessityColors[pattern.necessity].text}`}>
                                {pattern.necessity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{pattern.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                {t('create.createMas')}
              </button>
              <button
                onClick={() => setStep('form')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common.back')}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg"
          title={t('view.backToHome')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">{t('create.title')}</h1>
        <span className="flex-1" />
        <LanguageSwitcher />
      </header>

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Target Directory */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t('create.location')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.parentFolder')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetDir}
                    readOnly
                    placeholder={t('create.selectFolderPlaceholder')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <button
                    onClick={handleSelectFolder}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    {t('create.browse')}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.projectId')}
                </label>
                <input
                  type="text"
                  value={userInput.projectId}
                  onChange={e => setUserInput({ ...userInput, projectId: e.target.value })}
                  placeholder={t('create.projectIdPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t('create.languageSettings')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.blueprintLanguage')}
                </label>
                <select
                  value={userInput.blueprintLanguage}
                  onChange={e => setUserInput({ ...userInput, blueprintLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="English">{t('create.langEnglish')}</option>
                  <option value="Chinese">{t('create.langChinese')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.reportLanguage')}
                </label>
                <select
                  value={userInput.reportLanguage}
                  onChange={e => setUserInput({ ...userInput, reportLanguage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="English">{t('create.langEnglish')}</option>
                  <option value="Chinese">{t('create.langChinese')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Research Project */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t('create.projectInfo')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.researchTopic')}
                </label>
                <textarea
                  value={userInput.researchTopic}
                  onChange={e => setUserInput({ ...userInput, researchTopic: e.target.value })}
                  placeholder={t('create.researchTopicPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.initialIdeas')}
                </label>
                <textarea
                  value={userInput.initialIdeas}
                  onChange={e => setUserInput({ ...userInput, initialIdeas: e.target.value })}
                  placeholder={t('create.initialIdeasPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Data Collection */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t('create.dataCollection')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.dataSources')}
                </label>
                <textarea
                  value={userInput.dataSources}
                  onChange={e => setUserInput({ ...userInput, dataSources: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.references')}
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectReferences}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      {t('create.selectReferences')}
                    </button>
                    {userInput.references.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUserInput({ ...userInput, references: [] })}
                        className="px-3 py-2 text-gray-500 hover:text-red-500 flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        {t('create.clearFiles')}
                      </button>
                    )}
                  </div>
                  {userInput.references.length > 0 ? (
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="text-gray-600 mb-2">
                        {t('create.selectedFiles', { count: userInput.references.length })}
                      </div>
                      <ul className="space-y-2">
                        {userInput.references.map((ref) => (
                          <li key={ref.path} className="flex items-start gap-2">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700 text-xs font-medium">
                                  {ref.path.split('/').pop()}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveReference(ref.path)}
                                  className="text-gray-400 hover:text-red-500"
                                  title={t('create.removeFile')}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={ref.description}
                                onChange={(e) => handleUpdateReferenceDescription(ref.path, e.target.value)}
                                placeholder={t('create.fileDescriptionPlaceholder')}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded"
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">
                      {t('create.noFilesSelected')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis & Output */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t('create.analysisOutput')}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.analysisMethods')}
                </label>
                <textarea
                  value={userInput.analysisMethods}
                  onChange={e => setUserInput({ ...userInput, analysisMethods: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.reportFormat')}
                </label>
                <textarea
                  value={userInput.reportFormat}
                  onChange={e => setUserInput({ ...userInput, reportFormat: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('create.qualityLevel')}
                </label>
                <select
                  value={userInput.qualityLevel}
                  onChange={e => setUserInput({ ...userInput, qualityLevel: e.target.value as UserInput['qualityLevel'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="simple">{t('create.qualitySimple')}</option>
                  <option value="standard">{t('create.qualityStandard')}</option>
                  <option value="strict">{t('create.qualityStrict')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Other Requirements */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t('create.otherRequirements')}</h2>
            <textarea
              value={userInput.otherRequirements}
              onChange={e => setUserInput({ ...userInput, otherRequirements: e.target.value })}
              placeholder={t('create.otherRequirementsPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => setStep('patterns')}
              disabled={!targetDir || !userInput.projectId || !userInput.researchTopic}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('create.nextSelectPatterns')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
