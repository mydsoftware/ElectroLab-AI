import categoriesData from '../data/categories.json'
import platformsData from '../data/platforms.json'
import componentsData from '../data/components.json'

export interface CatalogCategory {
  id: string
  name_fa: string
  name_en: string
  parent_id: string | null
  icon: string
}

export interface CatalogPlatform {
  id: string
  name_fa: string
  name_en: string
  family: string
  package?: string | null
  mcu?: string | null
}

export interface CatalogComponent {
  id: string
  name_fa: string
  name_en: string
  category_id: string
  component_kind: string
  compatible_platforms: string[]
  defaults?: Record<string, unknown>
  spice?: Record<string, unknown> | null
  pins?: { id: string; name: string }[]
  tags?: string[]
  description_fa?: string
}

const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  'http://localhost:8000'

export function getLocalCategories(): CatalogCategory[] {
  return categoriesData as CatalogCategory[]
}
export function getLocalPlatforms(): CatalogPlatform[] {
  return platformsData as CatalogPlatform[]
}
export function getLocalComponents(): CatalogComponent[] {
  return componentsData as CatalogComponent[]
}

export function filterComponents(
  components: CatalogComponent[],
  opts: { q?: string; categoryId?: string | null; platformId?: string | null; kind?: string | null }
): CatalogComponent[] {
  const q = (opts.q || '').trim().toLowerCase()
  return components.filter((c) => {
    if (opts.categoryId) {
      if (c.category_id !== opts.categoryId && !c.category_id.startsWith(opts.categoryId)) return false
    }
    if (opts.platformId && !c.compatible_platforms.includes(opts.platformId)) return false
    if (opts.kind && c.component_kind !== opts.kind) return false
    if (q) {
      const blob = [c.id, c.name_fa, c.name_en, ...(c.tags || []), c.description_fa || ''].join(' ').toLowerCase()
      if (!blob.includes(q)) return false
    }
    return true
  })
}

export async function fetchCatalogFromApi() {
  try {
    const [cRes, pRes, mRes] = await Promise.all([
      fetch(`${API_BASE}/api/v1/catalog/categories`, { signal: AbortSignal.timeout(2500) }),
      fetch(`${API_BASE}/api/v1/catalog/platforms`, { signal: AbortSignal.timeout(2500) }),
      fetch(`${API_BASE}/api/v1/catalog/components`, { signal: AbortSignal.timeout(2500) }),
    ])
    if (cRes.ok && pRes.ok && mRes.ok) {
      return {
        categories: await cRes.json(),
        platforms: await pRes.json(),
        components: await mRes.json(),
        source: 'api' as const,
      }
    }
  } catch {
    /* local */
  }
  return {
    categories: getLocalCategories(),
    platforms: getLocalPlatforms(),
    components: getLocalComponents(),
    source: 'local' as const,
  }
}

export function catalogToEditorType(c: CatalogComponent): 'resistor' | 'led' | 'capacitor' | 'power' | null {
  if (c.category_id.includes('resistor') || c.spice?.type === 'R') return 'resistor'
  if (c.category_id.includes('capacitor') || c.spice?.type === 'C') return 'capacitor'
  if (c.id.includes('led') || c.category_id.includes('diode')) return 'led'
  if (c.component_kind === 'power' || c.category_id.includes('power-supply')) return 'power'
  return null
}
