/**
 * DOM patcher for Aura Tool
 * Handles injection of badges, decorations, usernames, and connections into Discord's UI
 */

import { UserStore } from '@webpack/common';
import type { PluginSettings } from './types';
import { injectStyles, removeStyles, generateAllStyles } from './styles';
import { loadSettings } from './storage';
import { applyAppearance, applyOwnAvatar, clearAppearance, ownProfiles, profileMediaStyles } from './profileAppearance';

let observer: MutationObserver | null = null;
let frame: number | null = null;
let currentSettings: PluginSettings;
const modifiedElements = new Map<HTMLElement, Map<string, { value: string; priority: string }>>();

function setElementStyle(element: Element, property: string, value: string): void {
  if (!(element instanceof HTMLElement)) return;
  let originals = modifiedElements.get(element);
  if (!originals) {
    originals = new Map();
    modifiedElements.set(element, originals);
  }
  if (!originals.has(property)) {
    originals.set(property, { value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) });
  }
  element.style.setProperty(property, value);
}

/**
 * Apply custom badges to user elements in the DOM
 */
function applyCustomBadges(root: Document | Element = document): void {
  if (!currentSettings.globalEnabled) return;

  const { badges } = currentSettings;
  if (badges.length === 0) return;

  // Find all user badge containers
  const badgeContainers = root.querySelectorAll('[class*="badgeList"], [class*="badges"], [class*="profileBadges"]');

  badgeContainers.forEach(container => {
    badges.forEach(badge => {
      if (!badge.enabled || badge.native) return;

      const existing = container.querySelector(`.cbp-badge-${badge.id}`);
      if (existing) return;

      const badgeEl = document.createElement('span');
      badgeEl.className = `cbp-badge cbp-badge-${badge.id} cbp-badge-${badge.position}`;
      badgeEl.setAttribute('data-cbp-badge', badge.id);

      if (badge.tooltip) {
        badgeEl.classList.add('cbp-tooltip');
        badgeEl.setAttribute('data-tooltip', badge.tooltip);
      }

      if (badge.icon && (badge.icon.startsWith('http') || badge.icon.startsWith('data:'))) {
        const img = document.createElement('img');
        img.src = badge.icon;
        img.alt = '';
        img.style.width = '14px';
        img.style.height = '14px';
        img.style.marginRight = '4px';
        badgeEl.appendChild(img);
      } else if (badge.icon) {
        // Emoji or text icon
        badgeEl.textContent = badge.icon + ' ';
      }

      const label = document.createElement('span');
      label.textContent = badge.label;
      badgeEl.appendChild(label);

      if (badge.position === 'before') {
        container.insertBefore(badgeEl, container.firstChild);
      } else if (badge.position === 'after') {
        container.appendChild(badgeEl);
      } else if (badge.position === 'replace') {
        // Hide original badges and show only custom
        container.querySelectorAll('[class*="badge"]:not(.cbp-badge)').forEach(el => {
          setElementStyle(el, 'display', 'none');
        });
        container.appendChild(badgeEl);
      }
    });
  });
}

/**
 * Apply custom decorations
 */
function applyCustomDecorations(root: Document | Element = document): void {
  if (!currentSettings.globalEnabled) return;

  const { decorations } = currentSettings;
  if (decorations.length === 0) return;

  decorations.forEach(dec => {
    if (!dec.enabled) return;

    let targets: NodeListOf<Element> | undefined;

    switch (dec.position) {
      case 'username_prefix':
        targets = root.querySelectorAll('[class*="username"], [class*="userName"], [class*="displayName"]');
        break;
      case 'username_suffix':
        targets = root.querySelectorAll('[class*="username"], [class*="userName"], [class*="displayName"]');
        break;
      case 'status_prefix':
      case 'status_suffix':
        targets = root.querySelectorAll('[class*="status"], [class*="presence"]');
        break;
      case 'avatar_frame':
        targets = root.querySelectorAll('[class*="avatar"], [class*="profileAvatar"]');
        break;
      case 'profile_banner':
        targets = root.querySelectorAll('[class*="banner"], [class*="profileBanner"]');
        break;
    }

    targets?.forEach(target => {
      if (dec.condition) {
        const userId = target.closest('[data-user-id]')?.getAttribute('data-user-id');
        const expectedId = dec.condition.trim().match(/^(?:user\.id\s*===?\s*['"])?(\d+)['"]?$/)?.[1];
        if (!expectedId || userId !== expectedId) return;
      }

      const existing = target.querySelector(`.cbp-decoration-${dec.id}`);
      if (existing) return;

      const decoEl = document.createElement('span');
      decoEl.className = `cbp-decoration cbp-decoration-${dec.id}`;

      if (dec.type === 'text' || dec.type === 'icon') {
        decoEl.textContent = dec.content;
      } else if (dec.type === 'gradient') {
        decoEl.style.background = dec.content;
        decoEl.style.webkitBackgroundClip = 'text';
        decoEl.style.webkitTextFillColor = 'transparent';
      }

      Object.assign(decoEl.style, dec.style);

      if (dec.position === 'username_prefix' || dec.position === 'status_prefix') {
        target.insertBefore(decoEl, target.firstChild);
      } else if (dec.position === 'avatar_frame') {
        decoEl.classList.add('cbp-avatar-frame');
        setElementStyle(target, 'position', 'relative');
        target.appendChild(decoEl);
      } else if (dec.position === 'profile_banner') {
        decoEl.classList.add('cbp-profile-banner-decoration');
        setElementStyle(target, 'position', 'relative');
        target.appendChild(decoEl);
      } else {
        target.appendChild(decoEl);
      }
    });
  });
}

/**
 * Apply custom usernames
 */
function applyCustomUsernames(root: Document | Element = document): void {
  if (!currentSettings.globalEnabled) return;

  const { usernames } = currentSettings;
  if (usernames.length === 0) return;

  const currentUserId = getCurrentUserId();

  usernames.forEach(un => {
    if (!un.enabled) return;

    const targetId = un.targetUserId === 'self' ? currentUserId : un.targetUserId;
    if (!targetId || !/^\d+$/.test(targetId)) return;

    // Find username elements for this user
    const usernameElements = root.querySelectorAll(`[data-user-id="${targetId}"] [class*="username"], [data-user-id="${targetId}"] [class*="userName"], [data-user-id="${targetId}"] [class*="displayName"]`);

    usernameElements.forEach(el => {
      const existing = el.querySelector(`.cbp-username-${un.id}`);
      if (existing) return;

      const nameEl = document.createElement('span');
      nameEl.className = `cbp-username cbp-username-${un.id}`;
      nameEl.textContent = un.displayName;

      // Apply styles via CSS variables
      if (un.color) nameEl.style.setProperty('--cbp-color', un.color);
      if (un.gradient) nameEl.style.setProperty('--cbp-gradient', un.gradient);
      if (un.textShadow) nameEl.style.setProperty('--cbp-shadow', un.textShadow);
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
        nameEl.style.setProperty('--cbp-animation', animMap[un.animationType] || un.customAnimation || 'cbp-pulse 2s ease-in-out infinite');
      }

      // Replace content
      if (el.querySelector('.cbp-username-original')) return;
      const original = document.createElement('span');
      original.className = 'cbp-username-original';
      original.hidden = true;
      while (el.firstChild) original.appendChild(el.firstChild);
      el.appendChild(original);
      el.appendChild(nameEl);
    });
  });
}

/**
 * Apply custom connections
 */
function applyCustomConnections(profile: HTMLElement): void {
  if (!currentSettings.globalEnabled) return;

  const { connections } = currentSettings;
  if (connections.length === 0) return;

  const compact = /popout/i.test(profile.className) || !!profile.closest('[class*="userProfilePopout"]');
  const visible = connections.filter(c => c.enabled && (compact ? c.showInUserPopout : c.showInProfile));
  if (!visible.length) return;
  let connectionsList = profile.querySelector('[class*="connectionsList"], [class*="connectionList"], .aura-profile-connections');
  if (!connectionsList) {
    connectionsList = document.createElement('div');
    connectionsList.className = 'aura-profile-connections';
    const heading = document.createElement('strong');
    heading.textContent = 'Conexões';
    connectionsList.appendChild(heading);
    const body = profile.querySelector('[class^="body_"], [class*="bodyInner_"], [class*="profileBody_"]') ?? profile;
    body.appendChild(connectionsList);
  }
  const list = connectionsList;
  visible

    .sort((a, b) => a.position - b.position)
    .forEach(conn => {
      const existing = list.querySelector(`.cbp-connection-${CSS.escape(conn.id)}`);
      if (existing) return;

      const connEl = document.createElement('div');
      connEl.className = `cbp-connection cbp-connection-${conn.id}`;
      const icon = document.createElement('div');
      icon.className = 'cbp-connection-icon';
      if (conn.color) icon.style.backgroundColor = conn.color;
      if (/^https?:\/\/|^data:image\//i.test(conn.icon)) {
        const image = document.createElement('img');
        image.src = conn.icon;
        image.alt = '';
        icon.appendChild(image);
      } else {
        icon.textContent = conn.icon;
      }

      const info = document.createElement('div');
      info.className = 'cbp-connection-info';
      const name = document.createElement('div');
      name.className = 'cbp-connection-name';
      name.textContent = conn.name;
      const address = document.createElement('div');
      address.className = 'cbp-connection-url';
      const link = document.createElement('a');
      link.textContent = conn.url;
      if (/^https?:\/\//i.test(conn.url)) {
        link.href = conn.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      address.appendChild(link);
      info.append(name, address);
      connEl.append(icon, info);
      if (conn.verified) {
        const check = document.createElement('span');
        check.className = 'cbp-connection-verified';
        check.textContent = '✓';
        check.title = 'Visual verification mark';
        connEl.appendChild(check);
      }

      list.appendChild(connEl);
    });
}

function getCurrentUserId(): string | undefined {
  return UserStore?.getCurrentUser()?.id;
}

function applyAllPatches(): void {
  if (!currentSettings.globalEnabled) return;
  applyCustomUsernames();
  const userId = getCurrentUserId();
  if (!userId) return;
  if (currentSettings.appearance) applyOwnAvatar(userId, currentSettings.appearance);
  for (const profile of ownProfiles(userId)) {
    applyCustomBadges(profile);
    applyCustomDecorations(profile);
    if (currentSettings.appearance) applyAppearance(profile, currentSettings.appearance, userId);
    applyCustomConnections(profile);
  }
}

function removeAllPatches(): void {
  clearAppearance();
  document.querySelectorAll('.aura-profile-connections').forEach(node => node.remove());
  document.querySelectorAll('.cbp-username-original').forEach(original => {
    original.replaceWith(...Array.from(original.childNodes));
  });
  document.querySelectorAll('.cbp-badge, .cbp-decoration, .cbp-username, .cbp-connection').forEach(element => {
    if (!element.closest('.cbp-root')) element.remove();
  });
  for (const [element, properties] of modifiedElements) {
    for (const [property, original] of properties) {
      if (original.value) element.style.setProperty(property, original.value, original.priority);
      else element.style.removeProperty(property);
    }
  }
  modifiedElements.clear();
  removeStyles();
}

const appearanceObserverOptions: MutationObserverInit = {
  childList: true, subtree: true, attributes: true, attributeFilter: ['src'],
};

export function refreshPatches(): void {
  if (!observer) return;
  observer.disconnect();
  try {
    currentSettings = loadSettings();
    removeAllPatches();
    if (currentSettings.globalEnabled) injectStyles(generateAllStyles(currentSettings) + profileMediaStyles);
    applyAllPatches();
  } finally {
    observer.observe(document.body, appearanceObserverOptions);
  }
}

export function initialize(): void {
  if (observer) return;
  observer = new MutationObserver(records => {
    if (!currentSettings.globalEnabled || frame !== null) return;
    if (!records.some(record => record.target instanceof Element
      && !record.target.closest('.cbp-root')
      && (record.addedNodes.length > 0 || record.target instanceof HTMLImageElement))) return;

    frame = requestAnimationFrame(() => {
      frame = null;
      for (const element of modifiedElements.keys()) {
        if (!element.isConnected) modifiedElements.delete(element);
      }
      observer?.disconnect();
      try {
        applyAllPatches();
      } finally {
        observer?.observe(document.body, appearanceObserverOptions);
      }
    });
  });
  refreshPatches();
}

export function cleanup(): void {
  observer?.disconnect();
  observer = null;
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  removeAllPatches();
}

