import type { Angle, Camera as ChessfieldCamera, Theme as ChessfieldTheme, ThemeColors } from 'chessfield';

/** Key of the ChessPop theme registered as a `chessfield` plugin theme. */
export const CHESSPOP_THEME_NAME = 'chesspop';

/** ChessPop board colors, registered in the chessfield config as `plugins.themes`. */
export const CHESSPOP_THEME: ThemeColors = {
  light: '#e3dbc9',
  dark: '#cb4444',
  highlight: '#c99a39',
  statusCheck: '#ffff00',
  selected: 'orange',
};

/**
 * Themes the palette button cycles through, in display order.
 * Mirrors what `chessfield` cycles: the built-in themes (minus light/dark/default)
 * plus the ChessPop theme the app appends through the plugin config.
 */
export const THEME_CYCLE = [
  CHESSPOP_THEME_NAME,
  'blue',
  'brown',
  'green',
  'bw',
] as const satisfies readonly ChessfieldTheme[];

/** Camera positions the camera button cycles through, in display order. */
export const CAMERA_CYCLE = [
  'white',
  'right',
  'black',
  'left',
  'top',
] as const satisfies readonly ChessfieldCamera[];

export type Theme = (typeof THEME_CYCLE)[number];
export type Camera = (typeof CAMERA_CYCLE)[number];

export const DEFAULT_THEME: Theme = CHESSPOP_THEME_NAME;
export const DEFAULT_CAMERA: Camera = 'white';

/**
 * Framing of the initial view, before the visitor ever picks a camera.
 * A camera switch always goes through `angleForCamera`, so this angle only
 * applies while nothing has been stored yet.
 */
export const DEFAULT_ANGLE: Angle = 'right';

/**
 * Framing `chessfield` applies when a camera is switched by name
 * (`CameraController.switchCamera`): face-on for white/black, unrotated otherwise.
 * Kept here so a restored camera keeps the framing the switch produced.
 */
export function angleForCamera(camera: Camera): Angle | undefined {
  return camera === 'white' || camera === 'black' ? 'center' : undefined;
}

export function isTheme(value: string): value is Theme {
  return (THEME_CYCLE as readonly string[]).includes(value);
}

export function isCamera(value: string): value is Camera {
  return (CAMERA_CYCLE as readonly string[]).includes(value);
}

export function isAngle(value: string): value is Angle {
  return value === 'left' || value === 'center' || value === 'right';
}
