import type { PlacedComponent, Wire } from '../types/circuit'

export type ElectroLabProject = {
  version: 1
  name: string
  savedAt: string
  components: PlacedComponent[]
  wires: Wire[]
  scopeCh1?: string | null
  scopeCh2?: string | null
}

export function exportProject(
  components: PlacedComponent[],
  wires: Wire[],
  opts?: { name?: string; scopeCh1?: string | null; scopeCh2?: string | null }
): ElectroLabProject {
  return {
    version: 1,
    name: opts?.name || 'electro-lab-project',
    savedAt: new Date().toISOString(),
    components,
    wires,
    scopeCh1: opts?.scopeCh1 ?? null,
    scopeCh2: opts?.scopeCh2 ?? null,
  }
}

export function downloadProject(project: ElectroLabProject) {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${project.name.replace(/\s+/g, '-')}.electrolab.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function parseProject(json: string): ElectroLabProject {
  const data = JSON.parse(json)
  if (!data || data.version !== 1 || !Array.isArray(data.components)) {
    throw new Error('فرمت پروژه نامعتبر است')
  }
  return data as ElectroLabProject
}

export async function loadProjectFile(file: File): Promise<ElectroLabProject> {
  const text = await file.text()
  return parseProject(text)
}
