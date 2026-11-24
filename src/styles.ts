/**
 * CSS injection and style utilities for CustomBadgesPlus
 */

const STYLE_ID = 'custom-badges-plus-styles';
const ANIMATION_STYLE_ID = 'custom-badges-plus-animations';

export function injectStyles(css: string): void {
  if (typeof document === 'undefined') return;

  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

export function injectAnimations(css: string): void {
  if (typeof document === 'undefined') return;

  let styleEl = document.getElementById(ANIMATION_STYLE_ID) as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = ANIMATION_STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

export function removeStyles(): void {
  if (typeof document === 'undefined') return;

  const styleEl = document.getElementById(STYLE_ID);
  if (styleEl) styleEl.remove();

  const animEl = document.getElementById(ANIMATION_STYLE_ID);
  if (animEl) animEl.remove();
}

// Base styles for badges and decorations
export const BASE_STYLES = `
/* Custom Badges */
.cbp-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
  margin: 0 2px;
  position: relative;
  flex-shrink: 0;
}

.cbp-badge img,
.cbp-badge svg {
  width: 14px;
  height: 14px;
  margin-right: 4px;
  flex-shrink: 0;
}

.cbp-badge-icon-only {
  padding: 0;
  min-width: 20px;
  width: 20px;
}

.cbp-badge-icon-only img,
.cbp-badge-icon-only svg {
  margin: 0;
}

/* Position variants */
.cbp-badge-before {
  margin-right: 4px;
}

.cbp-badge-after {
  margin-left: 4px;
}

.cbp-badge-replace {
  /* Replaces original badge - no extra margin */
}

/* Decorations */
.cbp-decoration {
  display: inline-flex;
  align-items: center;
  position: relative;
}

.cbp-decoration-text {
  font-size: inherit;
  line-height: inherit;
}

.cbp-decoration-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.cbp-decoration-icon svg,
.cbp-decoration-icon img {
  width: 1em;
  height: 1em;
}

/* Username customizations */
.cbp-username {
  display: inline;
  position: relative;
}

.cbp-username-gradient {
  background: var(--cbp-gradient, linear-gradient(90deg, #ff6b6b, #4ecdc4));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}

.cbp-username-animated {
  animation: var(--cbp-animation, cbp-pulse 2s ease-in-out infinite);
}

.cbp-username-shadow {
  text-shadow: var(--cbp-shadow, 0 0 10px currentColor);
}

/* Animations */
@keyframes cbp-rainbow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

@keyframes cbp-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.02); }
}

@keyframes cbp-glow {
  0%, 100% { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
  50% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
}

@keyframes cbp-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes cbp-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes cbp-bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}

@keyframes cbp-wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}

/* Connection items */
.cbp-connection {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.cbp-connection:hover {
  background-color: var(--background-modifier-hover, rgba(255,255,255,0.05));
}

.cbp-connection-icon {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cbp-connection-icon img,
.cbp-connection-icon svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cbp-connection-info {
  flex: 1;
  min-width: 0;
}

.cbp-connection-name {
  font-weight: 500;
  font-size: 14px;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cbp-connection-url {
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cbp-connection-verified {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-left: 4px;
}

/* Settings panel */
.cbp-settings-panel {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.cbp-section {
  margin-bottom: 24px;
}

.cbp-section-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  color: var(--header-primary, #fff);
}

.cbp-item {
  background: var(--background-secondary, #2f3136);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.cbp-item-preview {
  flex-shrink: 0;
}

.cbp-item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.cbp-btn {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
}

.cbp-btn-primary {
  background: var(--brand-experiment, #5865f2);
  color: white;
}

.cbp-btn-primary:hover {
  background: var(--brand-experiment-hover, #4752c4);
}

.cbp-btn-danger {
  background: var(--danger, #ed4245);
  color: white;
}

.cbp-btn-danger:hover {
  background: var(--danger-hover, #c03537);
}

.cbp-btn-ghost {
  background: transparent;
  color: var(--interactive-normal, #b9bbbe);
}

.cbp-btn-ghost:hover {
  background: var(--background-modifier-hover, rgba(255,255,255,0.05));
  color: var(--interactive-hover, #dcddde);
}

.cbp-input {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-accent, #4f545c);
  background: var(--background-primary, #1e1f22);
  color: var(--text-normal, #dcddde);
  font-size: 13px;
  min-width: 200px;
  transition: border-color 0.15s ease;
}

.cbp-input:focus {
  outline: none;
  border-color: var(--brand-experiment, #5865f2);
}

.cbp-select {
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid var(--background-modifier-accent, #4f545c);
  background: var(--background-primary, #1e1f22);
  color: var(--text-normal, #dcddde);
  font-size: 13px;
  cursor: pointer;
}

.cbp-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-normal, #dcddde);
  cursor: pointer;
}

.cbp-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--brand-experiment, #5865f2);
  cursor: pointer;
}

.cbp-color-input {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.cbp-divider {
  height: 1px;
  background: var(--background-modifier-accent, #4f545c);
  margin: 16px 0;
}

.cbp-empty-state {
  text-align: center;
  padding: 32px;
  color: var(--text-muted, #72767d);
  font-size: 14px;
}

.cbp-add-btn {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  background: var(--background-secondary, #2f3136);
  border: 2px dashed var(--background-modifier-accent, #4f545c);
  color: var(--text-muted, #72767d);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cbp-add-btn:hover {
  border-color: var(--brand-experiment, #5865f2);
  color: var(--brand-experiment, #5865f2);
  background: var(--background-secondary-alt, #36393f);
}

/* Tooltip */
.cbp-tooltip {
  position: relative;
}

.cbp-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background: var(--background-floating, #18191c);
  border: 1px solid var(--background-modifier-accent, #4f545c);
  border-radius: 4px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s ease;
  pointer-events: none;
  z-index: 1000;
  margin-bottom: 4px;
}

.cbp-tooltip:hover::after {
  opacity: 1;
  visibility: visible;
}

/* Avatar frame decoration */
.cbp-avatar-frame {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.cbp-profile-banner-decoration {
  position: absolute;
  inset: 0;
  border-radius: 8px;
  pointer-events: none;
  z-index: 1;
}
`;

export function generateBadgeStyles(badges: any[]): string {
  return badges
    .filter(b => b.enabled && !b.native)
    .map(badge => {
      const bgColor = badge.backgroundColor || badge.color || '#5865f2';
      const textColor = badge.textColor || '#ffffff';
      const icon = badge.icon;

      let iconCss = '';
      if (icon.startsWith('http') || icon.startsWith('data:')) {
        iconCss = `background-image: url("${icon}"); background-size: cover; background-position: center;`;
      }

      return `
.cbp-badge-${badge.id} {
  background: ${bgColor};
  color: ${textColor};
}
.cbp-badge-${badge.id}::before {
  content: "${badge.label.replace(/"/g, '\\"')}";
}
${icon ? `
.cbp-badge-${badge.id}::after {
  content: "";
  width: 14px;
  height: 14px;
  ${iconCss}
  margin-left: 4px;
}
` : ''}
`;
    })
    .join('\n');
}

export function generateDecorationStyles(decorations: any[]): string {
  return decorations
    .filter(d => d.enabled)
    .map(dec => {
      const style = dec.style || {};
      const styleStr = Object.entries(style)
        .map(([k, v]) => `${k}: ${v};`)
        .join(' ');

      return `
.cbp-decoration-${dec.id} {
  ${styleStr}
}
`;
    })
    .join('\n');
}

export function generateUsernameStyles(usernames: any[]): string {
  return usernames
    .filter(u => u.enabled)
    .map(un => {
      const styles: string[] = [];

      if (un.color) {
        styles.push(`color: ${un.color};`);
      }
      if (un.fontWeight) {
        styles.push(`font-weight: ${un.fontWeight};`);
      }
      if (un.fontStyle) {
        styles.push(`font-style: ${un.fontStyle};`);
      }
      if (un.textDecoration) {
        styles.push(`text-decoration: ${un.textDecoration};`);
      }
      if (un.textShadow) {
        styles.push(`text-shadow: ${un.textShadow};`);
      }
      if (un.gradient) {
        styles.push(`
          background: ${un.gradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        `);
      }
      if (un.animated && un.animationType) {
        const animMap: Record<string, string> = {
          rainbow: 'cbp-rainbow 3s linear infinite',
          pulse: 'cbp-pulse 2s ease-in-out infinite',
          glow: 'cbp-glow 2s ease-in-out infinite',
          shake: 'cbp-shake 0.5s ease-in-out infinite',
          spin: 'cbp-spin 1s linear infinite',
          bounce: 'cbp-bounce 2s ease-in-out infinite',
          wave: 'cbp-wave 2s ease-in-out infinite',
        };
        const anim = animMap[un.animationType] || un.customAnimation || 'cbp-pulse 2s ease-in-out infinite';
        styles.push(`animation: ${anim};`);
      }

      return `
.cbp-username-${un.id} {
  ${styles.join(' ')}
}
`;
    })
    .join('\n');
}

export function generateAllStyles(settings: any): string {
  return `
${BASE_STYLES}
${generateBadgeStyles(settings.badges)}
${generateDecorationStyles(settings.decorations)}
${generateUsernameStyles(settings.usernames)}
`;
}