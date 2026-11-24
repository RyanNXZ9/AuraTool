/**
 * Type definitions for CustomBadgesPlus plugin
 */

export interface CustomBadge {
  id: string;
  native?: boolean;
  nativeTier?: number;
  nativeIcon?: string;
  nativeDetail?: string;
  label: string;
  icon: string; // URL, emoji, or icon identifier
  color?: string; // Hex color for text/badge background
  backgroundColor?: string;
  textColor?: string;
  tooltip?: string;
  position: 'before' | 'after' | 'replace';
  enabled: boolean;
}

export interface CustomDecoration {
  id: string;
  type: 'text' | 'icon' | 'gradient' | 'animated';
  content: string; // Text, emoji, or CSS gradient/animation class
  position: 'username_prefix' | 'username_suffix' | 'status_prefix' | 'status_suffix' | 'avatar_frame' | 'profile_banner';
  style?: Record<string, string>; // Custom CSS properties
  condition?: string; // Optional condition (e.g., "user.id === '123'")
  enabled: boolean;
}

export interface CustomUsername {
  id: string;
  targetUserId: string; // User ID to apply to, or 'self' for current user
  displayName: string; // Custom display name
  color?: string; // Hex color for the name
  fontWeight?: 'normal' | 'bold' | 'light';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textShadow?: string; // CSS text-shadow value
  gradient?: string; // CSS gradient string
  animated?: boolean;
  animationType?: 'rainbow' | 'pulse' | 'glow' | 'shake' | 'custom';
  customAnimation?: string; // Custom CSS animation keyframes
  enabled: boolean;
}

export interface CustomConnection {
  id: string;
  name: string; // Display name (e.g., "Steam", "GitHub", "Custom")
  icon: string; // Icon URL or identifier
  url: string; // Profile URL
  color?: string; // Brand color
  verified?: boolean; // Show verified checkmark
  position: number; // Order in connections list
  showInProfile: boolean;
  showInUserPopout: boolean;
  enabled: boolean;
}

export interface ProfileAppearance {
  avatar: string;
  decoration: string;
  banner: string;
  effect: string;
  primaryColor: string;
  accentColor: string;
}

export const DEFAULT_APPEARANCE: ProfileAppearance = {
  avatar: '', decoration: '', banner: '', effect: '', primaryColor: '', accentColor: '',
};

export interface PluginSettings {
  appearance?: ProfileAppearance;
  badges: CustomBadge[];
  decorations: CustomDecoration[];
  usernames: CustomUsername[];
  connections: CustomConnection[];
  globalEnabled: boolean;
  showInSettings: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  badges: [],
  decorations: [],
  usernames: [],
  connections: [],
  globalEnabled: true,
  showInSettings: true,
};

// Icon presets for common badges/connections
export const ICON_PRESETS = {
  // Common platforms
  steam: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/steam.svg',
  github: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/github.svg',
  twitter: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/twitter.svg',
  youtube: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/youtube.svg',
  twitch: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/twitch.svg',
  reddit: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/reddit.svg',
  spotify: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/spotify.svg',
  discord: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/discord.svg',
  battle_net: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/battle-net.svg',
  epic_games: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/epic-games.svg',
  origin: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/origin.svg',
  uplay: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/uplay.svg',
  gog: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/gog.svg',
  itch_io: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/svgs/brands/itch-io.svg',

  // Emoji fallbacks
  crown: '👑',
  star: '⭐',
  heart: '❤️',
  sparkles: '✨',
  fire: '🔥',
  gem: '💎',
  medal: '🏅',
  trophy: '🏆',
  lightning: '⚡',
  shield: '🛡️',
  sword: '⚔️',
  magic_wand: '🪄',
  robot: '🤖',
  alien: '👽',
  ghost: '👻',
  skull: '💀',
  demon: '😈',
  angel: '😇',
  clover: '🍀',
  diamond: '💠',
  crystal: '🔮',
} as const;

export type IconPresetKey = keyof typeof ICON_PRESETS;