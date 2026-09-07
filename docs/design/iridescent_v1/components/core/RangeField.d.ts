/**
 * @startingPoint section="Components" subtitle="Ideal min/max with two mono inputs and a dual slider" viewport="400x120"
 */
export interface RangeFieldProps {
  label?: string;
  /** quiet mono unit after the label, e.g. "ppm" */
  unit?: string;
  /** slider bounds — the plausible span for this parameter, not the ideal range */
  min?: number;
  max?: number;
  step?: number;
  /** null on either side means "no bound set" */
  value?: { min: number | null; max: number | null };
  onChange?: (v: { min: number | null; max: number | null }) => void;
  /** right-aligned mono hint, e.g. "typical 0–40" */
  hint?: string;
  style?: React.CSSProperties;
}
export function RangeField(props: RangeFieldProps): JSX.Element;