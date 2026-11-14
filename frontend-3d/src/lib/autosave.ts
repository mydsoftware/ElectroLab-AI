import type { PlacedComponent, Wire } from '../types/circuit'
import { exportProject, type ElectroLabProject } from './projectIO'

const KEY = 'electrolab-autosave-v1'

export function autosave(
  components: PlacedComponent[],
  wires: Wire[],
  extra?: { scopeCh1?: string | null; scopeCh2?: string | null }
) {
  try {
    const proj = exportProject(components, wires, {
      name: 'autosave',
      scopeCh1: extra?.scopeCh1,
      scopeCh2: extra?.scopeCh2,
    })
    localStorage.setItem(KEY, JSON.stringify(proj))
  } catch {
    /* ignore quota */
  }
}

export function loadAutosave(): ElectroLabProject | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (data?.version === 1 && Array.isArray(data.components)) return data
  } catch {
    /* ignore */
  }
  return null
}

export function clearAutosave() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* */
  }
}
