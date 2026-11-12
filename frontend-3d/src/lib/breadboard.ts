/**
 * Breadboard geometry helpers
 * Standard half-size breadboard: 30 columns × 10 rows (a-j) + power rails
 */

export const HOLE_SPACING = 0.254 // 0.1 inch in cm units for Three.js scale
export const BOARD_COLS = 30
export const BOARD_ROWS = 10 // a to j

/** Convert column + row to world position (centered board) */
export function holePosition(col: number, row: number): [number, number, number] {
  const x = (col - (BOARD_COLS - 1) / 2) * HOLE_SPACING
  const z = (row - (BOARD_ROWS - 1) / 2) * HOLE_SPACING
  return [x, 0.12, z] // slightly above board surface
}

/** Get the net ID for a hole (same net = electrically connected) */
export function getHoleNetId(col: number, row: number): string {
  // Terminal strips: each row group of 5 is connected horizontally
  // Rows 0-4 (a-e) are one set, 5-9 (f-j) another
  if (row < 5) {
    return `term-top-${col}`
  }
  return `term-bottom-${col}`
}

/** Power rail net IDs */
export function getPowerRailNet(side: 'left' | 'right', isPositive: boolean): string {
  return `rail-${side}-${isPositive ? 'pos' : 'neg'}`
}

/** Generate all hole data for the main terminal area */
export function generateHoles() {
  const holes = []
  for (let col = 0; col < BOARD_COLS; col++) {
    for (let row = 0; row < BOARD_ROWS; row++) {
      holes.push({
        id: `h-${col}-${row}`,
        col,
        row,
        position: holePosition(col, row),
        netId: getHoleNetId(col, row),
      })
    }
  }
  return holes
}

/** Snap a world position to the nearest hole */
export function snapToNearestHole(
  x: number,
  z: number
): { col: number; row: number; position: [number, number, number] } | null {
  let best: { col: number; row: number; dist: number } | null = null

  for (let col = 0; col < BOARD_COLS; col++) {
    for (let row = 0; row < BOARD_ROWS; row++) {
      const [hx, , hz] = holePosition(col, row)
      const dist = Math.hypot(x - hx, z - hz)
      if (dist < HOLE_SPACING * 0.7) {
        if (!best || dist < best.dist) {
          best = { col, row, dist }
        }
      }
    }
  }

  if (!best) return null
  return {
    col: best.col,
    row: best.row,
    position: holePosition(best.col, best.row),
  }
}
