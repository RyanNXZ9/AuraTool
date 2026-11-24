/**
 * Settings panel component for CustomBadgesPlus
 * No styled-jsx - uses regular CSS classes
 */

import { React, useState, useCallback } from '@webpack/common';
import { PluginSettings, CustomBadge, CustomDecoration, CustomUsername, CustomConnection, ICON_PRESETS, IconPresetKey } from '../types';
import {
  loadSettings,
  saveSettings,
  addBadge,
  updateBadge,
  removeBadge,
  addDecoration,
  updateDecoration,
  removeDecoration,
  addUsername,
  updateUsername,
  removeUsername,
  addConnection,
  updateConnection,
  removeConnection,
  toggleGlobalEnabled,
  generateId,
} from '../storage';
import { imageSource } from '../profileAppearance';
import { BADGE_TIERS, DISCORD_BADGES, discordBadgeIcon } from '../nativeBadges';
import AppearancePanel from './AppearancePanel';
import { refreshPatches } from '../patcher';

const CONNECTION_TEMPLATES = [
  { name: 'GitHub', icon: 'github', color: '#333333', url: 'https://github.com/' },
  { name: 'Steam', icon: 'steam', color: '#1b2838', url: 'https://steamcommunity.com/id/' },
  { name: 'YouTube', icon: 'youtube', color: '#ff0033', url: 'https://www.youtube.com/@' },
  { name: 'Twitch', icon: 'twitch', color: '#9146ff', url: 'https://www.twitch.tv/' },
  { name: 'Spotify', icon: 'spotify', color: '#1db954', url: 'https://open.spotify.com/user/' },
  { name: 'Reddit', icon: 'reddit', color: '#ff4500', url: 'https://www.reddit.com/user/' },
];

type TabType = 'profile' | 'badges' | 'decorations' | 'usernames' | 'connections' | 'general';

interface EditableItem {
  id: string;
  type: 'badge' | 'decoration' | 'username' | 'connection';
  data: any;
  isNew: boolean;
}

const styles = `
.aura-badge-card { min-width: 0; }
.aura-badge-card > button { width: 100%; }
.aura-badge-options { display: grid; gap: 6px; padding: 8px 0; }
.aura-badge-options :is(input, select) { box-sizing: border-box; width: 100%; min-width: 0; }
.aura-preview { position: relative; height: 115px; border-radius: 12px; margin: 12px 0 28px; overflow: hidden; }
.aura-preview-banner, .aura-preview-effect { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; }
.aura-preview-effect { object-fit: contain; }
.aura-preview-avatar { position: absolute; width: 64px; height: 64px; left: 18px; bottom: 12px; border-radius: 50%; background: var(--background-secondary, #222); }
.aura-preview-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.aura-preview-avatar .aura-preview-decoration { position: absolute; inset: -12%; width: 124%; height: 124%; border-radius: 0; object-fit: contain; }
.aura-appearance-actions { position: sticky; top: 0; z-index: 5; background: var(--background-primary, #25262b); margin: 0 0 12px; padding: 6px 0; border-top: 0; }
.aura-media-input { display: flex; gap: 8px; align-items: center; margin-bottom: 6px; }
.aura-media-input input { flex: 1; min-width: 0; }

.cbp-root { display: flex; flex-direction: column; height: 100%; font-family: inherit; }
.cbp-tabs { display: flex; gap: 4px; padding: 8px; background: var(--background-secondary, #2f3136); border-bottom: 1px solid var(--background-modifier-accent, #4f545c); overflow-x: auto; }
.cbp-tab { padding: 8px 16px; border: none; background: transparent; color: var(--interactive-normal, #b9bbbe); font-size: 13px; font-weight: 500; border-radius: 4px; cursor: pointer; white-space: nowrap; transition: all 0.15s ease; }
.cbp-tab:hover { color: var(--interactive-hover, #dcddde); background: var(--background-modifier-hover, rgba(255,255,255,0.05)); }
.cbp-tab.active { color: var(--text-normal, #dcddde); background: var(--background-modifier-selected, rgba(255,255,255,0.1)); }
.cbp-tab-content { flex: 1; overflow-y: auto; padding: 16px; }

.cbp-panel { max-height: 60vh; overflow-y: auto; }
.cbp-section { margin-bottom: 24px; }
.cbp-section-title { font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; color: var(--header-primary, #fff); }
.cbp-section-desc { color: var(--text-muted, #72767d); margin-bottom: 16px; font-size: 13px; }

.cbp-item { background: var(--background-secondary, #2f3136); border-radius: 8px; padding: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.cbp-item-preview { flex-shrink: 0; }
.cbp-item-controls { display: flex; align-items: center; gap: 8px; margin-left: auto; }

.cbp-badge-preview { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; font-size: 11px; font-weight: 600; line-height: 1; white-space: nowrap; vertical-align: middle; margin: 0 2px; position: relative; flex-shrink: 0; }
.cbp-badge-preview img, .cbp-badge-preview svg { width: 14px; height: 14px; margin-right: 4px; flex-shrink: 0; }

.cbp-decoration-preview { display: inline-flex; align-items: center; position: relative; }
.cbp-username-preview { display: inline; position: relative; }

.cbp-connection-preview { display: flex; align-items: center; gap: 8px; }
.cbp-connection-icon { width: 32px; height: 32px; border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.cbp-connection-icon img, .cbp-connection-icon svg { width: 100%; height: 100%; object-fit: cover; }

.cbp-btn { padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s ease; }
.cbp-btn-primary { background: var(--brand-experiment, #5865f2); color: white; }
.cbp-btn-primary:hover { background: var(--brand-experiment-hover, #4752c4); }
.cbp-btn-danger { background: var(--danger, #ed4245); color: white; }
.cbp-btn-danger:hover { background: var(--danger-hover, #c03537); }
.cbp-btn-ghost { background: transparent; color: var(--interactive-normal, #b9bbbe); }
.cbp-btn-ghost:hover { background: var(--background-modifier-hover, rgba(255,255,255,0.05)); color: var(--interactive-hover, #dcddde); }

.cbp-input { padding: 8px 12px; border-radius: 4px; border: 1px solid var(--background-modifier-accent, #4f545c); background: var(--background-primary, #1e1f22); color: var(--text-normal, #dcddde); font-size: 13px; min-width: 200px; transition: border-color 0.15s ease; }
.cbp-input:focus { outline: none; border-color: var(--brand-experiment, #5865f2); }
.cbp-input-small { min-width: 80px; width: 80px; }
.cbp-textarea { min-height: 60px; resize: vertical; font-family: monospace; font-size: 12px; }

.cbp-select { padding: 8px 12px; border-radius: 4px; border: 1px solid var(--background-modifier-accent, #4f545c); background: var(--background-primary, #1e1f22); color: var(--text-normal, #dcddde); font-size: 13px; cursor: pointer; min-width: 200px; }
.cbp-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-normal, #dcddde); cursor: pointer; }
.cbp-checkbox { width: 16px; height: 16px; accent-color: var(--brand-experiment, #5865f2); cursor: pointer; }
.cbp-color-input { width: 36px; height: 36px; border: none; border-radius: 4px; cursor: pointer; padding: 0; }

.cbp-divider { height: 1px; background: var(--background-modifier-accent, #4f545c); margin: 16px 0; }
.cbp-empty-state { text-align: center; padding: 32px; color: var(--text-muted, #72767d); font-size: 14px; }
.cbp-add-btn { width: 100%; padding: 12px; border-radius: 8px; background: var(--background-secondary, #2f3136); border: 2px dashed var(--background-modifier-accent, #4f545c); color: var(--text-muted, #72767d); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; }
.cbp-add-btn:hover { border-color: var(--brand-experiment, #5865f2); color: var(--brand-experiment, #5865f2); background: var(--background-secondary-alt, #36393f); }

.cbp-form-group { margin-bottom: 16px; }
.cbp-form-group label { display: block; margin-bottom: 6px; font-size: 13px; color: var(--text-normal, #dcddde); }
.cbp-form-row { display: flex; gap: 12px; flex-wrap: wrap; }
.cbp-form-row > * { flex: 1; min-width: 200px; }

.cbp-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; animation: cbp-fade-in 0.15s ease; }
.cbp-modal { background: var(--background-floating, #18191c); border: 1px solid var(--background-modifier-accent, #4f545c); border-radius: 8px; width: 90%; max-width: 560px; max-height: 90vh; overflow-y: auto; animation: cbp-slide-up 0.15s ease; }
.cbp-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--background-modifier-accent, #4f545c); }
.cbp-modal-header h3 { margin: 0; font-size: 16px; }
.cbp-modal-close { background: none; border: none; color: var(--interactive-normal, #b9bbbe); font-size: 24px; cursor: pointer; line-height: 1; padding: 0 4px; }
.cbp-modal-close:hover { color: var(--interactive-hover, #dcddde); }
.cbp-modal-form { padding: 20px; }
.cbp-modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--background-modifier-accent, #4f545c); }

.cbp-preset-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.cbp-preset-item { padding: 8px 12px; background: var(--background-secondary); border-radius: 6px; font-size: 12px; display: flex; align-items: center; gap: 8px; }
.cbp-discord-badges { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 8px; margin-bottom: 24px; }
.cbp-discord-badge { display: flex; align-items: center; gap: 8px; min-height: 46px; padding: 8px 10px; border: 1px solid var(--background-modifier-accent); border-radius: 8px; text-align: left; font: inherit; font-size: 13px; color: var(--text-normal); cursor: pointer; background: var(--background-secondary); }
.cbp-discord-badge:hover { background: var(--background-modifier-hover); }
.cbp-discord-badge[aria-pressed="true"] { border-color: var(--brand-500, #5865f2); background: var(--background-modifier-selected); }
.cbp-discord-badge:focus-visible { outline: 2px solid var(--brand-500, #5865f2); outline-offset: 2px; }
.cbp-discord-badge img { width: 22px; height: 22px; flex: 0 0 auto; object-fit: contain; }
.cbp-discord-badge-check { margin-left: auto; color: var(--text-positive, #43b581); }
.cbp-preset-item img { width: 16px; height: 16px; }
.cbp-preset-item code { font-size: 11px; background: var(--background-primary); padding: 2px 6px; border-radius: 3px; }

@keyframes cbp-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes cbp-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
`;

export const SettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<PluginSettings>(() => loadSettings());
  const [connectionTemplate, setConnectionTemplate] = useState({ name: '', icon: '', color: '', url: '' });
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<{ type: EditableItem['type'] } | null>(null);

  const handleSettingsChange = useCallback((newSettings: PluginSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
    refreshPatches();
  }, []);

  // Badge handlers
  const handleAddBadge = (badge: Omit<CustomBadge, 'id'>) => {
    const newBadge: CustomBadge = { ...badge, id: generateId() };
    handleSettingsChange({ ...settings, badges: [...settings.badges, newBadge] });
    setShowAddModal(null);
  };

  const handleUpdateBadge = (id: string, updates: Partial<CustomBadge>) => {
    const newBadges = settings.badges.map(b => b.id === id ? { ...b, ...updates } : b);
    handleSettingsChange({ ...settings, badges: newBadges });
    setEditingItem(null);
  };

  const handleRemoveBadge = (id: string) => {
    const newBadges = settings.badges.filter(b => b.id !== id);
    handleSettingsChange({ ...settings, badges: newBadges });
  };

  const handleToggleBadge = (id: string) => {
    const badge = settings.badges.find(b => b.id === id);
    if (badge) handleUpdateBadge(id, { enabled: !badge.enabled });
  };

  // Decoration handlers
  const handleAddDecoration = (decoration: Omit<CustomDecoration, 'id'>) => {
    const newDec: CustomDecoration = { ...decoration, id: generateId() };
    handleSettingsChange({ ...settings, decorations: [...settings.decorations, newDec] });
    setShowAddModal(null);
  };

  const handleUpdateDecoration = (id: string, updates: Partial<CustomDecoration>) => {
    const newDecs = settings.decorations.map(d => d.id === id ? { ...d, ...updates } : d);
    handleSettingsChange({ ...settings, decorations: newDecs });
    setEditingItem(null);
  };

  const handleRemoveDecoration = (id: string) => {
    const newDecs = settings.decorations.filter(d => d.id !== id);
    handleSettingsChange({ ...settings, decorations: newDecs });
  };

  const handleToggleDecoration = (id: string) => {
    const dec = settings.decorations.find(d => d.id === id);
    if (dec) handleUpdateDecoration(id, { enabled: !dec.enabled });
  };

  // Username handlers
  const handleAddUsername = (username: Omit<CustomUsername, 'id'>) => {
    const newUn: CustomUsername = { ...username, id: generateId() };
    handleSettingsChange({ ...settings, usernames: [...settings.usernames, newUn] });
    setShowAddModal(null);
  };

  const handleUpdateUsername = (id: string, updates: Partial<CustomUsername>) => {
    const newUns = settings.usernames.map(u => u.id === id ? { ...u, ...updates } : u);
    handleSettingsChange({ ...settings, usernames: newUns });
    setEditingItem(null);
  };

  const handleRemoveUsername = (id: string) => {
    const newUns = settings.usernames.filter(u => u.id !== id);
    handleSettingsChange({ ...settings, usernames: newUns });
  };

  const handleToggleUsername = (id: string) => {
    const un = settings.usernames.find(u => u.id === id);
    if (un) handleUpdateUsername(id, { enabled: !un.enabled });
  };

  // Connection handlers
  const handleAddConnection = (connection: Omit<CustomConnection, 'id'>) => {
    const newConn: CustomConnection = { ...connection, id: generateId() };
    handleSettingsChange({ ...settings, connections: [...settings.connections, newConn] });
    setShowAddModal(null);
  };

  const handleUpdateConnection = (id: string, updates: Partial<CustomConnection>) => {
    const newConns = settings.connections.map(c => c.id === id ? { ...c, ...updates } : c);
    handleSettingsChange({ ...settings, connections: newConns });
    setEditingItem(null);
  };

  const handleRemoveConnection = (id: string) => {
    const newConns = settings.connections.filter(c => c.id !== id);
    handleSettingsChange({ ...settings, connections: newConns });
  };

  const handleToggleConnection = (id: string) => {
    const conn = settings.connections.find(c => c.id === id);
    if (conn) handleUpdateConnection(id, { enabled: !conn.enabled });
  };

  // General handlers
  const handleToggleGlobal = () => {
    const newSettings = toggleGlobalEnabled();
    setSettings(newSettings);
    refreshPatches();
  };

  const startEdit = (item: EditableItem) => {
    setEditingItem(item);
  };

  const startAdd = (type: EditableItem['type']) => {
    setShowAddModal({ type });
  };

  const renderBadgesTab = () => (
    <div className="cbp-panel">
      <div className="cbp-section">
        <h3 className="cbp-section-title">Insígnias do Discord</h3>
        <p className="cbp-section-desc">Clique para adicionar ou remover do seu perfil. As mudanças são visíveis neste cliente.</p>
        <div className="cbp-discord-badges">
          {DISCORD_BADGES.map(([key, label, asset]) => {
            const id = `discord-${key}`;
            const badge = settings.badges.find(entry => entry.id === id && entry.native);
            const checked = !!badge?.enabled;
            const tiers = BADGE_TIERS[key];
            const tierAsset = tiers?.[badge?.nativeTier ?? -1]?.[1];
            const icon = imageSource(badge?.nativeIcon ?? '') || discordBadgeIcon(tierAsset ?? asset);
            const update = (changes: Partial<CustomBadge>) => {
              const next: CustomBadge = {
                id, label, icon: discordBadgeIcon(asset), native: true, enabled: true, position: 'after',
                ...badge, ...changes,
              };
              handleSettingsChange({ ...settings, badges: [...settings.badges.filter(entry => entry.id !== id), next] });
            };
            const configurable = !!tiers || !asset || key === 'legacy-username' || key === 'last-meadow';
            return (
              <div className="aura-badge-card" key={id}>
                <button type="button" className="cbp-discord-badge" aria-pressed={checked && !!icon} onClick={() => update({ enabled: !checked })}>
                  {icon && <img src={icon} alt="" />}
                  <span>{label}</span>
                  {checked && icon && <span aria-hidden="true" className="cbp-discord-badge-check">✓</span>}
                </button>
                {checked && configurable && (
                  <div className="aura-badge-options">
                    {tiers && <select aria-label={`Nível de ${label}`} className="cbp-select" value={badge?.nativeTier ?? -1}
                      onChange={e => update({ nativeTier: Number(e.target.value) })}>
                      <option value={-1}>Ícone padrão</option>
                      {tiers.map(([name], index) => <option key={name} value={index}>{name}</option>)}
                    </select>}
                    <input type="url" aria-label={`URL do ícone de ${label}`} className="cbp-input" maxLength={2048}
                      placeholder={asset ? 'Ícone alternativo (HTTPS)' : 'URL HTTPS do ícone necessária'}
                      defaultValue={badge?.nativeIcon ?? ''}
                      onBlur={e => update({ nativeIcon: imageSource(e.currentTarget.value) })} />
                    <input aria-label={`Detalhe de ${label}`} className="cbp-input" maxLength={80}
                      placeholder={key === 'account-age' ? 'Ex.: 8 anos · nível 5' : 'Detalhe no tooltip'}
                      defaultValue={badge?.nativeDetail ?? ''}
                      onBlur={e => update({ nativeDetail: e.currentTarget.value.trim() })} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <h3 className="cbp-section-title">Custom Badges</h3>
        <p className="cbp-section-desc">Add custom badges that appear next to usernames. Supports icons, colors, and tooltips.</p>

        {!settings.badges.some(badge => !badge.native) ? (
          <div className="cbp-empty-state">No custom badges yet. Click "Add Badge" to create one.</div>
        ) : (
          settings.badges.filter(badge => !badge.native).map(badge => (
            <div key={badge.id} className="cbp-item">
              <div className="cbp-item-preview">
                <span className="cbp-badge-preview" style={{ background: badge.backgroundColor || badge.color || '#5865f2', color: badge.textColor || '#ffffff' }}>
                  {badge.icon && (badge.icon.startsWith('http') || badge.icon.startsWith('data:')) ? (
                    <img src={badge.icon} alt="" style={{ width: 14, height: 14, marginRight: 4 }} />
                  ) : badge.icon ? (
                    <span>{badge.icon} </span>
                  ) : null}
                  {badge.label}
                </span>
              </div>
              <div className="cbp-item-controls">
                <label className="cbp-label">
                  <input type="checkbox" className="cbp-checkbox" checked={badge.enabled} onChange={() => handleToggleBadge(badge.id)} />
                  Enabled
                </label>
                <button className="cbp-btn cbp-btn-ghost" onClick={() => startEdit({ id: badge.id, type: 'badge', data: badge, isNew: false })}>Edit</button>
                <button className="cbp-btn cbp-btn-danger" onClick={() => handleRemoveBadge(badge.id)}>Remove</button>
              </div>
            </div>
          ))
        )}

        <button className="cbp-add-btn" onClick={() => startAdd('badge')}>+ Add Badge</button>
      </div>
    </div>
  );

  const renderDecorationsTab = () => (
    <div className="cbp-panel">
      <div className="cbp-section">
        <h3 className="cbp-section-title">Decorations</h3>
        <p className="cbp-section-desc">Add text, icons, or gradients before/after usernames, on avatars, or profile banners.</p>

        {settings.decorations.length === 0 ? (
          <div className="cbp-empty-state">No decorations yet. Click "Add Decoration" to create one.</div>
        ) : (
          settings.decorations.map(dec => (
            <div key={dec.id} className="cbp-item">
              <div className="cbp-item-preview">
                <span className="cbp-decoration-preview">{dec.content}</span>
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>({dec.position})</span>
              </div>
              <div className="cbp-item-controls">
                <label className="cbp-label">
                  <input type="checkbox" className="cbp-checkbox" checked={dec.enabled} onChange={() => handleToggleDecoration(dec.id)} />
                  Enabled
                </label>
                <button className="cbp-btn cbp-btn-ghost" onClick={() => startEdit({ id: dec.id, type: 'decoration', data: dec, isNew: false })}>Edit</button>
                <button className="cbp-btn cbp-btn-danger" onClick={() => handleRemoveDecoration(dec.id)}>Remove</button>
              </div>
            </div>
          ))
        )}

        <button className="cbp-add-btn" onClick={() => startAdd('decoration')}>+ Add Decoration</button>
      </div>
    </div>
  );

  const renderUsernamesTab = () => (
    <div className="cbp-panel">
      <div className="cbp-section">
        <h3 className="cbp-section-title">Custom Usernames</h3>
        <p className="cbp-section-desc">Override display names for specific users with custom colors, gradients, and animations.</p>

        {settings.usernames.length === 0 ? (
          <div className="cbp-empty-state">No custom usernames yet. Click "Add Username" to create one.</div>
        ) : (
          settings.usernames.map(un => (
            <div key={un.id} className="cbp-item">
              <div className="cbp-item-preview">
                <span className="cbp-username-preview" style={{ color: un.color, fontWeight: un.fontWeight, background: un.gradient, WebkitBackgroundClip: un.gradient ? 'text' : undefined, WebkitTextFillColor: un.gradient ? 'transparent' : undefined }}>
                  {un.displayName}
                </span>
                <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>(for {un.targetUserId === 'self' ? 'current user' : un.targetUserId})</span>
              </div>
              <div className="cbp-item-controls">
                <label className="cbp-label">
                  <input type="checkbox" className="cbp-checkbox" checked={un.enabled} onChange={() => handleToggleUsername(un.id)} />
                  Enabled
                </label>
                <button className="cbp-btn cbp-btn-ghost" onClick={() => startEdit({ id: un.id, type: 'username', data: un, isNew: false })}>Edit</button>
                <button className="cbp-btn cbp-btn-danger" onClick={() => handleRemoveUsername(un.id)}>Remove</button>
              </div>
            </div>
          ))
        )}

        <button className="cbp-add-btn" onClick={() => startAdd('username')}>+ Add Username</button>
      </div>
    </div>
  );

  const renderConnectionsTab = () => (
    <div className="cbp-panel">
      <div className="cbp-section">
        <h3 className="cbp-section-title">Custom Connections</h3>
        <p className="cbp-section-desc">Add custom connections that appear in your profile and user popouts.</p>

        {settings.connections.length === 0 ? (
          <div className="cbp-empty-state">No custom connections yet. Click "Add Connection" to create one.</div>
        ) : (
          settings.connections.map(conn => (
            <div key={conn.id} className="cbp-item">
              <div className="cbp-item-preview" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="cbp-connection-icon" style={{ background: conn.color, width: 32, height: 32 }}>
                  {conn.icon.startsWith('http') || conn.icon.startsWith('data:') ? (
                    <img src={conn.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 16 }}>{conn.icon}</span>
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{conn.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>{conn.url}</div>
                </div>
              </div>
              <div className="cbp-item-controls">
                <label className="cbp-label">
                  <input type="checkbox" className="cbp-checkbox" checked={conn.enabled} onChange={() => handleToggleConnection(conn.id)} />
                  Enabled
                </label>
                <button className="cbp-btn cbp-btn-ghost" onClick={() => startEdit({ id: conn.id, type: 'connection', data: conn, isNew: false })}>Edit</button>
                <button className="cbp-btn cbp-btn-danger" onClick={() => handleRemoveConnection(conn.id)}>Remove</button>
              </div>
            </div>
          ))
        )}

        <div className="cbp-form-row">
          <select aria-label="Modelo de conexão" className="cbp-select" value={connectionTemplate.name} onChange={event => {
            const name = event.currentTarget.value;
            const model = CONNECTION_TEMPLATES.find(template => template.name === name);
            setConnectionTemplate(model ?? { name: '', icon: '', color: '', url: '' });
          }}>
            <option value="">Modelo personalizado</option>
            {CONNECTION_TEMPLATES.map(model => <option key={model.name}>{model.name}</option>)}
          </select>
          <button className="cbp-add-btn" onClick={() => startAdd('connection')}>Adicionar conexão</button>
        </div>
      </div>
    </div>
  );

  const renderGeneralTab = () => (
    <div className="cbp-panel">
      <div className="cbp-section">
        <h3 className="cbp-section-title">Configurações gerais</h3>

        <div className="cbp-item" style={{ justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Ativar personalizações</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ativa os ajustes de aparência, insígnias, nomes e conexões neste cliente.</div>
          </div>
          <label className="cbp-label">
            <input type="checkbox" className="cbp-checkbox" aria-label="Ativar personalizações" checked={settings.globalEnabled} onChange={handleToggleGlobal} />
          </label>
        </div>

        <div className="cbp-divider" />

        <div style={{ marginTop: 16 }}>
          <h4 style={{ marginBottom: 12, color: 'var(--header-secondary)' }}>Biblioteca de ícones</h4>
          <p className="cbp-section-desc">Use o nome de um ícone ao configurar uma insígnia ou conexão.</p>
          <div className="cbp-preset-grid">
            {Object.entries(ICON_PRESETS).map(([key, value]) => (
              <div key={key} className="cbp-preset-item" title={key}>
                {value.startsWith('http') ? <img src={value} alt={key} /> : <span>{value}</span>}
                <code>{key}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Modal for adding/editing items
  if (editingItem || showAddModal) {
    const item = editingItem;
    const type = item?.type || showAddModal?.type;
    const isNew = item?.isNew ?? true;
    const data = item?.data || (type === 'connection' ? connectionTemplate : {});

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = new FormData(e.currentTarget);
      const field = (name: string) => String(form.get(name) ?? '').trim();
      const enabled = item?.data.enabled ?? true;

      switch (type) {
        case 'badge': {
          const icon = field('icon');
          const badge: Omit<CustomBadge, 'id'> = {
            label: field('label'), icon: ICON_PRESETS[icon as IconPresetKey] ?? icon,
            backgroundColor: field('backgroundColor'), textColor: field('textColor'),
            tooltip: field('tooltip'), position: field('position') as CustomBadge['position'], enabled,
          };
          if (item) handleUpdateBadge(item.id, badge);
          else handleAddBadge(badge);
          break;
        }
        case 'decoration': {
          let style: Record<string, string> = {};
          try {
            const parsed: unknown = JSON.parse(field('style') || '{}');
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
              style = Object.fromEntries(Object.entries(parsed).filter(([, value]) => typeof value === 'string'));
            }
          } catch {
            return;
          }
          const decoration: Omit<CustomDecoration, 'id'> = {
            type: field('type') as CustomDecoration['type'], content: field('content'),
            position: field('position') as CustomDecoration['position'],
            condition: field('condition'), style, enabled,
          };
          if (item) handleUpdateDecoration(item.id, decoration);
          else handleAddDecoration(decoration);
          break;
        }
        case 'username': {
          const username: Omit<CustomUsername, 'id'> = {
            targetUserId: field('targetUserId'), displayName: field('displayName'),
            color: field('color'), gradient: field('gradient'), textShadow: field('textShadow'),
            fontWeight: field('fontWeight') as CustomUsername['fontWeight'],
            animationType: field('animationType') as CustomUsername['animationType'],
            animated: form.has('animated'), enabled,
          };
          if (item) handleUpdateUsername(item.id, username);
          else handleAddUsername(username);
          break;
        }
        case 'connection': {
          const icon = field('icon');
          const connection: Omit<CustomConnection, 'id'> = {
            name: field('name'), icon: ICON_PRESETS[icon as IconPresetKey] ?? icon,
            url: field('url'), color: field('color'), position: Number(field('position')),
            verified: form.has('verified'), showInProfile: form.has('showInProfile'),
            showInUserPopout: form.has('showInUserPopout'), enabled,
          };
          if (item) handleUpdateConnection(item.id, connection);
          else handleAddConnection(connection);
          break;
        }
      }
    };

    const handleClose = () => { setEditingItem(null); setShowAddModal(null); };

    return (
      <div className="cbp-modal-overlay cbp-root" onClick={handleClose}>
        <style>{styles}</style>
        <div className="cbp-modal" onClick={e => e.stopPropagation()}>
          <div className="cbp-modal-header">
            <h3>{isNew ? 'Add' : 'Edit'} {type && type.charAt(0).toUpperCase() + type.slice(1)}</h3>
            <button className="cbp-modal-close" onClick={handleClose}>×</button>
          </div>
          <form className="cbp-modal-form" onSubmit={handleSubmit}>
            {type === 'badge' && (
              <>
                <div className="cbp-form-group">
                  <label>Label</label>
                  <input className="cbp-input" name="label" defaultValue={data.label || ''} required />
                </div>
                <div className="cbp-form-group">
                  <label>Icon (URL, emoji, or preset key)</label>
                  <input className="cbp-input" name="icon" defaultValue={data.icon || ''} placeholder="crown, 👑, or https://..." />
                </div>
                <div className="cbp-form-row">
                  <div>
                    <label>Background Color</label>
                    <input className="cbp-color-input" type="color" name="backgroundColor" defaultValue={data.backgroundColor || '#5865f2'} />
                  </div>
                  <div>
                    <label>Text Color</label>
                    <input className="cbp-color-input" type="color" name="textColor" defaultValue={data.textColor || '#ffffff'} />
                  </div>
                </div>
                <div className="cbp-form-group">
                  <label>Tooltip (optional)</label>
                  <input className="cbp-input" name="tooltip" defaultValue={data.tooltip || ''} />
                </div>
                <div className="cbp-form-group">
                  <label>Position</label>
                  <select className="cbp-select" name="position" defaultValue={data.position || 'after'}>
                    <option value="before">Before username</option>
                    <option value="after">After username</option>
                    <option value="replace">Replace original badges</option>
                  </select>
                </div>
              </>
            )}

            {type === 'decoration' && (
              <>
                <div className="cbp-form-group">
                  <label>Type</label>
                  <select className="cbp-select" name="type" defaultValue={data.type || 'text'}>
                    <option value="text">Text</option>
                    <option value="icon">Icon/Emoji</option>
                    <option value="gradient">CSS Gradient</option>
                    <option value="animated">Animated</option>
                  </select>
                </div>
                <div className="cbp-form-group">
                  <label>Content</label>
                  <input className="cbp-input" name="content" defaultValue={data.content || ''} required placeholder="Text, emoji, or CSS gradient" />
                </div>
                <div className="cbp-form-group">
                  <label>Position</label>
                  <select className="cbp-select" name="position" defaultValue={data.position || 'username_suffix'}>
                    <option value="username_prefix">Before Username</option>
                    <option value="username_suffix">After Username</option>
                    <option value="status_prefix">Before Status</option>
                    <option value="status_suffix">After Status</option>
                    <option value="avatar_frame">Avatar Frame</option>
                    <option value="profile_banner">Profile Banner</option>
                  </select>
                </div>
                <div className="cbp-form-group">
                  <label>User ID (optional)</label>
                  <input className="cbp-input" name="condition" defaultValue={data.condition || ''} placeholder="123456789" />
                </div>
                <div className="cbp-form-group">
                  <label>Custom CSS (JSON)</label>
                  <textarea className="cbp-input cbp-textarea" name="style" defaultValue={JSON.stringify(data.style || {}, null, 2)} placeholder='{"fontSize": "12px", "color": "#ff0000"}' />
                </div>
              </>
            )}

            {type === 'username' && (
              <>
                <div className="cbp-form-group">
                  <label>Target User ID (or "self")</label>
                  <input className="cbp-input" name="targetUserId" defaultValue={data.targetUserId || 'self'} required />
                </div>
                <div className="cbp-form-group">
                  <label>Display Name</label>
                  <input className="cbp-input" name="displayName" defaultValue={data.displayName || ''} required />
                </div>
                <div className="cbp-form-row">
                  <div>
                    <label>Color</label>
                    <input className="cbp-color-input" type="color" name="color" defaultValue={data.color || '#ffffff'} />
                  </div>
                  <div>
                    <label>Gradient (CSS)</label>
                    <input className="cbp-input" name="gradient" defaultValue={data.gradient || ''} placeholder="linear-gradient(90deg, #ff6b6b, #4ecdc4)" />
                  </div>
                </div>
                <div className="cbp-form-row">
                  <div>
                    <label>Font Weight</label>
                    <select className="cbp-select" name="fontWeight" defaultValue={data.fontWeight || 'normal'}>
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                      <option value="light">Light</option>
                    </select>
                  </div>
                  <div>
                    <label>Text Shadow</label>
                    <input className="cbp-input" name="textShadow" defaultValue={data.textShadow || ''} placeholder="0 0 10px #ff0000" />
                  </div>
                </div>
                <div className="cbp-form-group">
                  <label className="cbp-label">
                    <input type="checkbox" className="cbp-checkbox" name="animated" defaultChecked={data.animated || false} />
                    Enable Animation
                  </label>
                </div>
                <div className="cbp-form-group">
                  <label>Animation Type</label>
                  <select className="cbp-select" name="animationType" defaultValue={data.animationType || 'pulse'}>
                    <option value="rainbow">Rainbow</option>
                    <option value="pulse">Pulse</option>
                    <option value="glow">Glow</option>
                    <option value="shake">Shake</option>
                    <option value="spin">Spin</option>
                    <option value="bounce">Bounce</option>
                    <option value="wave">Wave</option>
                  </select>
                </div>
              </>
            )}

            {type === 'connection' && (
              <>
                <div className="cbp-form-group">
                  <label>Name</label>
                  <input className="cbp-input" name="name" defaultValue={data.name || ''} required />
                </div>
                <div className="cbp-form-group">
                  <label>Icon (URL, emoji, or preset key)</label>
                  <input className="cbp-input" name="icon" defaultValue={data.icon || ''} required placeholder="github, 🐙, or https://..." />
                </div>
                <div className="cbp-form-group">
                  <label>Profile URL</label>
                  <input className="cbp-input" name="url" defaultValue={data.url || ''} required type="url" pattern="https?://.+" placeholder="https://github.com/username" />
                </div>
                <div className="cbp-form-row">
                  <div>
                    <label>Color</label>
                    <input className="cbp-color-input" type="color" name="color" defaultValue={data.color || '#5865f2'} />
                  </div>
                  <div>
                    <label>Position in List</label>
                    <input className="cbp-input cbp-input-small" type="number" name="position" defaultValue={data.position || 0} min={0} />
                  </div>
                </div>
                <div className="cbp-form-group">
                  <label className="cbp-label">
                    <input type="checkbox" className="cbp-checkbox" name="verified" defaultChecked={data.verified || false} />
                    Show Verified Badge
                  </label>
                </div>
                <div className="cbp-form-group">
                  <label className="cbp-label">
                    <input type="checkbox" className="cbp-checkbox" name="showInProfile" defaultChecked={data.showInProfile !== false} />
                    Show in Profile
                  </label>
                </div>
                <div className="cbp-form-group">
                  <label className="cbp-label">
                    <input type="checkbox" className="cbp-checkbox" name="showInUserPopout" defaultChecked={data.showInUserPopout !== false} />
                    Show in User Popout
                  </label>
                </div>
              </>
            )}

            <div className="cbp-modal-actions">
              <button type="button" className="cbp-btn cbp-btn-ghost" onClick={handleClose}>Cancel</button>
              <button type="submit" className="cbp-btn cbp-btn-primary">{isNew ? 'Add' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="cbp-root">
      <style>{styles}</style>
      <div className="cbp-tabs">
        <button className={`cbp-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Perfil</button>
        <button className={`cbp-tab ${activeTab === 'badges' ? 'active' : ''}`} onClick={() => setActiveTab('badges')}>Insígnias</button>
        <button className={`cbp-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>Geral</button>
        <button className={`cbp-tab ${activeTab === 'decorations' ? 'active' : ''}`} onClick={() => setActiveTab('decorations')}>Decorações</button>
        <button className={`cbp-tab ${activeTab === 'usernames' ? 'active' : ''}`} onClick={() => setActiveTab('usernames')}>Nomes</button>
        <button className={`cbp-tab ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>Conexões</button>
      </div>
      <div className="cbp-tab-content">
        {activeTab === 'profile' && <AppearancePanel value={settings.appearance} apply={appearance => handleSettingsChange({ ...settings, appearance })} />}
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'badges' && renderBadgesTab()}
        {activeTab === 'decorations' && renderDecorationsTab()}
        {activeTab === 'usernames' && renderUsernamesTab()}
        {activeTab === 'connections' && renderConnectionsTab()}
      </div>
    </div>
  );
};

export default SettingsPanel;

