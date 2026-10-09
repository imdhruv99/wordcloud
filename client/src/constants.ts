export type Option = { value: string; label: string }

// ---- Color palettes -------------------------------------------------------

export const PALETTE_COLORS: Record<string, string[]> = {
    multiple: [
        '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c',
        '#0891b2', '#ca8a04', '#db2777', '#4f46e5', '#059669',
        '#e11d48', '#7c3aed', '#0d9488', '#d97706', '#be123c',
        '#1d4ed8', '#15803d', '#c026d3', '#b45309', '#0369a1',
        '#4d7c0f', '#a21caf', '#b91c1c', '#0e7490', '#6d28d9',
        '#047857', '#c2410c', '#7e22ce', '#065f46', '#9f1239',
    ],
    'mono-blue': ['#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
    'mono-green': ['#14532d', '#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'],
    'mono-purple': ['#4c1d95', '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd'],
    'mono-red': ['#7f1d1d', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fca5a5'],
    'mono-teal': ['#134e4a', '#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'],
    sunset: ['#f59e0b', '#f97316', '#ef4444', '#db2777', '#9333ea', '#fb7185'],
    ocean: ['#0369a1', '#0891b2', '#06b6d4', '#0ea5e9', '#38bdf8', '#22d3ee'],
    forest: ['#166534', '#15803d', '#4d7c0f', '#65a30d', '#84cc16', '#a3e635'],
    candy: ['#f472b6', '#f9a8d4', '#c084fc', '#a78bfa', '#60a5fa', '#34d399'],
    neon: ['#22d3ee', '#a3e635', '#f472b6', '#facc15', '#fb923c', '#38bdf8'],
    pastel: ['#bfdbfe', '#bbf7d0', '#fde68a', '#fbcfe8', '#ddd6fe', '#c7d2fe'],
    fire: ['#7c2d12', '#b91c1c', '#dc2626', '#ea580c', '#f97316', '#facc15'],
    earth: ['#44403c', '#78350f', '#92400e', '#a16207', '#4d7c0f', '#166534'],
    grayscale: ['#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'],
}

export const PALETTES: Option[] = [
    { value: 'multiple', label: 'Multiple' },
    { value: 'mono-blue', label: 'Mono Blue' },
    { value: 'mono-green', label: 'Mono Green' },
    { value: 'mono-purple', label: 'Mono Purple' },
    { value: 'mono-red', label: 'Mono Red' },
    { value: 'mono-teal', label: 'Mono Teal' },
    { value: 'sunset', label: 'Sunset' },
    { value: 'ocean', label: 'Ocean' },
    { value: 'forest', label: 'Forest' },
    { value: 'candy', label: 'Candy' },
    { value: 'neon', label: 'Neon' },
    { value: 'pastel', label: 'Pastel' },
    { value: 'fire', label: 'Fire' },
    { value: 'earth', label: 'Earth' },
    { value: 'grayscale', label: 'Grayscale' },
]

// ---- Fonts ----------------------------------------------------------------

export const FONT_STACKS: Record<string, string> = {
    Inter: 'Inter, system-ui, sans-serif',
    'Times New Roman': "'Times New Roman', Times, serif",
    Georgia: 'Georgia, serif',
    Arial: 'Arial, Helvetica, sans-serif',
    'Courier New': "'Courier New', Courier, monospace",
    Verdana: 'Verdana, Geneva, sans-serif',
    'Trebuchet MS': "'Trebuchet MS', Helvetica, sans-serif",
    'Palatino Linotype': "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    Garamond: 'Garamond, Georgia, serif',
    'Comic Sans MS': "'Comic Sans MS', 'Comic Sans', cursive",
    Impact: 'Impact, Haettenschweiler, sans-serif',
    'Lucida Console': "'Lucida Console', Monaco, monospace",
    Tahoma: 'Tahoma, Geneva, sans-serif',
    'Brush Script MT': "'Brush Script MT', cursive",
    'Franklin Gothic': "'Franklin Gothic Medium', Arial, sans-serif",
}

export const FONTS: Option[] = Object.keys(FONT_STACKS).map((f) => ({ value: f, label: f }))
