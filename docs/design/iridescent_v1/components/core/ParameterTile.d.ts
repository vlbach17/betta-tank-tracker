/**
 * @startingPoint section="Components" subtitle="Dashboard tile; hero variant spans both columns" viewport="400x160"
 */
export interface ParameterTileProps { name: string; unit?: string; value?: string | number | null; /** e.g. "6.5–7.5" */ rangeText?: string; /** terse relative time: "2h", "6d", "3w" */ ago?: string; status?: "in-range" | "watch" | "out-of-range" | "overdue" | "unknown"; /** full-width tile for the most urgent parameter */ hero?: boolean; onClick?: () => void; style?: React.CSSProperties }
export function ParameterTile(props: ParameterTileProps): JSX.Element;