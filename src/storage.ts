import { definePluginSettings } from '@api/Settings';

import { PluginSettings, DEFAULT_SETTINGS, CustomBadge, CustomDecoration, CustomUsername, CustomConnection } from './types';

export const auraSettings = definePluginSettings({}).withPrivateSettings<{
  customization?: PluginSettings;
}>();

export function loadSettings(): PluginSettings {
  const saved = auraSettings.plain.customization;
  if (saved) return structuredClone(saved);

  const defaults = structuredClone(DEFAULT_SETTINGS);
  try {
    const legacy = globalThis.localStorage?.getItem('custom-badges-plus-settings');
    if (!legacy) return defaults;
    const stored: Partial<PluginSettings> | null = JSON.parse(legacy);
    return {
      badges: Array.isArray(stored?.badges) ? stored.badges : defaults.badges,
      decorations: Array.isArray(stored?.decorations) ? stored.decorations : defaults.decorations,
      usernames: Array.isArray(stored?.usernames) ? stored.usernames : defaults.usernames,
      connections: Array.isArray(stored?.connections) ? stored.connections : defaults.connections,
      globalEnabled: typeof stored?.globalEnabled === 'boolean' ? stored.globalEnabled : defaults.globalEnabled,
      showInSettings: typeof stored?.showInSettings === 'boolean' ? stored.showInSettings : defaults.showInSettings,
    };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: PluginSettings): void {
  auraSettings.store.customization = structuredClone(settings);
}

export function addBadge(badge: CustomBadge): PluginSettings {
  const settings = loadSettings();
  settings.badges.push(badge);
  saveSettings(settings);
  return settings;
}

export function updateBadge(id: string, updates: Partial<CustomBadge>): PluginSettings {
  const settings = loadSettings();
  const index = settings.badges.findIndex(b => b.id === id);
  if (index !== -1) {
    settings.badges[index] = { ...settings.badges[index], ...updates };
    saveSettings(settings);
  }
  return settings;
}

export function removeBadge(id: string): PluginSettings {
  const settings = loadSettings();
  settings.badges = settings.badges.filter(b => b.id !== id);
  saveSettings(settings);
  return settings;
}

export function addDecoration(decoration: CustomDecoration): PluginSettings {
  const settings = loadSettings();
  settings.decorations.push(decoration);
  saveSettings(settings);
  return settings;
}

export function updateDecoration(id: string, updates: Partial<CustomDecoration>): PluginSettings {
  const settings = loadSettings();
  const index = settings.decorations.findIndex(d => d.id === id);
  if (index !== -1) {
    settings.decorations[index] = { ...settings.decorations[index], ...updates };
    saveSettings(settings);
  }
  return settings;
}

export function removeDecoration(id: string): PluginSettings {
  const settings = loadSettings();
  settings.decorations = settings.decorations.filter(d => d.id !== id);
  saveSettings(settings);
  return settings;
}

export function addUsername(username: CustomUsername): PluginSettings {
  const settings = loadSettings();
  settings.usernames.push(username);
  saveSettings(settings);
  return settings;
}

export function updateUsername(id: string, updates: Partial<CustomUsername>): PluginSettings {
  const settings = loadSettings();
  const index = settings.usernames.findIndex(u => u.id === id);
  if (index !== -1) {
    settings.usernames[index] = { ...settings.usernames[index], ...updates };
    saveSettings(settings);
  }
  return settings;
}

export function removeUsername(id: string): PluginSettings {
  const settings = loadSettings();
  settings.usernames = settings.usernames.filter(u => u.id !== id);
  saveSettings(settings);
  return settings;
}

export function addConnection(connection: CustomConnection): PluginSettings {
  const settings = loadSettings();
  settings.connections.push(connection);
  saveSettings(settings);
  return settings;
}

export function updateConnection(id: string, updates: Partial<CustomConnection>): PluginSettings {
  const settings = loadSettings();
  const index = settings.connections.findIndex(c => c.id === id);
  if (index !== -1) {
    settings.connections[index] = { ...settings.connections[index], ...updates };
    saveSettings(settings);
  }
  return settings;
}

export function removeConnection(id: string): PluginSettings {
  const settings = loadSettings();
  settings.connections = settings.connections.filter(c => c.id !== id);
  saveSettings(settings);
  return settings;
}

export function toggleGlobalEnabled(): PluginSettings {
  const settings = loadSettings();
  settings.globalEnabled = !settings.globalEnabled;
  saveSettings(settings);
  return settings;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
