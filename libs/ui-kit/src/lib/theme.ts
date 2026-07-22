/**
 * Shared Leva theme for configurator control panels — warm editorial light.
 * Every configurator app passes this to `<Leva theme={levaTheme} />` so the
 * parameter panels look identical across the ecosystem.
 */
export const levaTheme = {
  colors: {
    elevation1: '#ffffff',
    elevation2: '#ffffff',
    elevation3: '#f6f5f1',
    accent1: '#b2542b',
    accent2: '#c66a3e',
    accent3: '#d97e51',
    highlight1: '#9a968e',
    highlight2: '#2a2a28',
    highlight3: '#0e0e0c',
    vivid1: '#b2542b',
    folderWidgetColor: '#6b6862',
    folderTextColor: '#0e0e0c',
    toolTipBackground: '#0e0e0c',
    toolTipText: '#ffffff',
  },
  fonts: {
    mono: "'JetBrains Mono', ui-monospace, monospace",
    sans: "'IBM Plex Sans', system-ui, sans-serif",
  },
  fontSizes: { root: '11.5px', toolTip: '11px' },
  sizes: {
    titleBarHeight: '0px',
    rootWidth: '340px',
    controlWidth: '180px',
    rowHeight: '26px',
    folderTitleHeight: '30px',
    numberInputMinWidth: '38px',
  },
  space: { sm: '6px', md: '10px', rowGap: '6px', colGap: '8px' },
  radii: { xs: '2px', sm: '2px', lg: '3px' },
  borderWidths: { root: '0px', input: '1px', focus: '1px', hover: '1px', active: '1px', folder: '1px' },
  shadows: { level1: 'none', level2: 'none' },
} as const;
