/** The app's three glyphs. Do not add icons elsewhere. */
export interface IconProps { name?: "chevronLeft" | "trash" | "kebab"; size?: number; color?: string; style?: React.CSSProperties }
export function Icon(props: IconProps): JSX.Element;