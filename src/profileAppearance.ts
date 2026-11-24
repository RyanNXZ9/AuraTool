import type { ProfileAppearance } from './types';

const profileSelector = '[class^="userProfileOuter_"], [class^="userProfileModal_"], [class^="userProfilePopout_"], [class*=" userProfileOuter_"], [role="dialog"]:has([class*="userProfileInner_"])';

const bannerSelector = 'div[class^="banner_"], div[class*=" banner_"], div[class*="profileBanner_"]';

export function imageSource(input: string): string {
  const value = input.trim();
  if (/^data:image\/(?:gif|png|jpeg|webp|avif);base64,[a-z0-9+/=]+$/i.test(value)) return value;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

function avatarSelector(userId: string): string {
  return `img[src*="/avatars/${userId}/"], img[src*="/users/${userId}/avatars/"]`;
}

export function ownProfiles(userId: string): Set<HTMLElement> {
  const profiles = new Set<HTMLElement>();
  if (!/^\d+$/.test(userId)) return profiles;

  for (const avatar of document.querySelectorAll<HTMLImageElement>(avatarSelector(userId))) {
    const profile = avatar.closest<HTMLElement>(profileSelector);
    if (profile) {
      profiles.add(profile);
      continue;
    }

    // The full profile has also shipped as a dialog with a banner, without the older outer class.
    const dialog = avatar.closest<HTMLElement>('[role="dialog"]');
    if (dialog?.querySelector(bannerSelector) && dialog.querySelector('[class*="pronouns"], [class*="userTag"], [class*="profileBody"]')) {
      const firstAvatar = dialog.querySelector('img[src*="/avatars/"]');
      if (firstAvatar === avatar) profiles.add(dialog);
    }
  }
  return profiles;
}

export function applyOwnAvatar(userId: string, appearance: ProfileAppearance): void {
  if (!/^\d+$/.test(userId)) return;
  const source = imageSource(appearance.avatar);
  if (!source) return;

  const selector = avatarSelector(userId);
  for (const avatar of document.querySelectorAll<HTMLImageElement>('.aura-own-avatar')) {
    if (!avatar.matches(selector)) clearAvatar(avatar);
  }
  for (const avatar of document.querySelectorAll<HTMLImageElement>(selector)) {
    if (avatar.closest('.cbp-root') || avatar.classList.contains('aura-own-avatar')) continue;
    // Keep src intact so subsequent scans can still identify the account and Discord keeps its avatar mask.
    avatar.style.setProperty('--aura-avatar-image', `url(${JSON.stringify(source)})`);
    avatar.classList.add('aura-own-avatar');
  }
}

function overlay(host: HTMLElement, name: string, source: string): void {
  if (!source || host.querySelector(`.aura-media-${name}`)) return;
  source = imageSource(source);
  if (!source) return;
  host.classList.add('aura-media-host');
  const img = document.createElement('img');
  img.className = `aura-media aura-media-${name}`;
  img.alt = '';
  img.src = source;
  img.addEventListener('error', () => { img.hidden = true; }, { once: true });
  host.appendChild(img);
}

export function applyAppearance(profile: HTMLElement, appearance: ProfileAppearance, userId: string): void {
  const avatar = profile.querySelector<HTMLImageElement>(
    `img[src*="/avatars/${userId}/"], img[src*="/users/${userId}/avatars/"], [class*="avatar"] img[class*="avatar"]`,
  );
  const avatarFrame = avatar?.closest<HTMLElement>('div[class*="avatarWrapper"], div[class^="avatar_"], span[class^="avatar_"]')
    ?? avatar?.closest('svg')?.parentElement;
  if (avatarFrame) {
    overlay(avatarFrame, 'decoration', appearance.decoration);
  }

  const banner = profile.querySelector<HTMLElement>(bannerSelector);
  if (banner) overlay(banner, 'banner', appearance.banner);
  overlay(profile, 'effect', appearance.effect);

  if (appearance.primaryColor && appearance.accentColor) {
    profile.classList.add('aura-profile-theme');
    profile.style.setProperty('--aura-primary', appearance.primaryColor);
    profile.style.setProperty('--aura-accent', appearance.accentColor);
  }
}

function clearAvatar(avatar: HTMLImageElement): void {
  avatar.classList.remove('aura-own-avatar');
  avatar.style.removeProperty('--aura-avatar-image');
}

export function clearAppearance(): void {
  document.querySelectorAll<HTMLImageElement>('.aura-own-avatar').forEach(clearAvatar);
  document.querySelectorAll('.aura-media').forEach(node => node.remove());
  document.querySelectorAll('.aura-media-host').forEach(node => node.classList.remove('aura-media-host'));
  document.querySelectorAll<HTMLElement>('.aura-profile-theme').forEach(node => {
    node.classList.remove('aura-profile-theme');
    node.style.removeProperty('--aura-primary');
    node.style.removeProperty('--aura-accent');
  });
}

export const profileMediaStyles = `
.aura-media-host { position: relative; }
.aura-media[hidden] { display: none; }
.aura-media { position: absolute; pointer-events: none; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.aura-own-avatar { content: var(--aura-avatar-image) !important; object-fit: cover; }
.aura-media-decoration { inset: -12%; width: 124%; height: 124%; object-fit: contain; z-index: 2; }
.aura-media-banner { border-radius: inherit; }
.aura-media-effect { object-fit: contain; object-position: top; z-index: 3; }
.aura-profile-theme { background: linear-gradient(155deg, var(--aura-primary), var(--aura-accent)) !important; }
.aura-profile-connections { display: grid; gap: 6px; padding: 8px 12px; }
`;

