/**
 * @startingPoint section="Components" subtitle="Pill button; primary carries the gradient" viewport="400x120"
 */
export interface ButtonProps {
  /** primary = the gradient CTA (one per screen). ink = selected/strong. secondary = mist. outline = bordered. danger = magenta. */
  variant?: "primary" | "ink" | "secondary" | "outline" | "danger";
  /** lg 56px (bottom bar), md 44px, sm 36px */
  size?: "lg" | "md" | "sm";
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export function Button(props: ButtonProps): JSX.Element;