import type { ProfileBadge } from '@api/Badges';
import { UserStore } from '@webpack/common';

import { auraSettings, loadSettings } from './storage';
import { imageSource } from './profileAppearance';

// Discord CDN asset hashes from the local Larpcord reference.
export const DISCORD_BADGES = [
  ['staff', 'Equipe do Discord', '5e74e9b61934fc1f67c65515d1f7e60d'],
  ['partner', 'Parceiro do Discord', '3f9748e53446a137a052f3454e2de41e'],
  ['hypesquad', 'Eventos HypeSquad', 'bf01d1073931f921909045f3a39fd264'],
  ['bravery', 'HypeSquad Bravery', '8a88d63823d8a71cd5e390baa45efa02'],
  ['brilliance', 'HypeSquad Brilliance', '011940fd013da3f7fb926e4a1cd2e618'],
  ['balance', 'HypeSquad Balance', '3aa41de486fa12454c3761e8e223442e'],
  ['bug-hunter', 'Caçador de bugs', '2717692c7dca7289b35297368a940dd0'],
  ['bug-hunter-gold', 'Caçador de bugs ouro', '848f79194d4be5ff5f81505cbd0ce1e6'],
  ['early-supporter', 'Apoiador inicial', '7060786766c9c840eb3019e725d2b358'],
  ['verified-developer', 'Desenvolvedor de bots verificado', '6df5892e0f35b051f8b61eace34f4967'],
  ['moderator', 'Moderador certificado', 'fee1624003e2fee35cb398e125dc479b'],
  ['active-developer', 'Desenvolvedor ativo', '6bdc42827a38498929a4920da12695d9'],
  ['nitro', 'Discord Nitro', '2ba85e8026a8614b640c2837bcdfe21b'],
  ['boost', 'Impulsionamento de servidor', 'boosts/discord-boost-1.svg'],
  ['orbs', 'Orbs', 'orb.svg'],
  ['quests', 'Missões', 'quest.png'],
  ['legacy-username', 'Nome de usuário legado', 'username.png'],
  ['account-age', 'Idade da conta', 'account-age/seed.svg'],
  ['game-time', 'Tempo de jogo', 'game-time/casual.svg'],
  ['game-variety', 'Variedade de jogos', 'game-variety/sampler.svg'],
  ['gifting', 'Presentes', 'gifting/patron.png'],
  ['streaming', 'Transmissão', 'streaming/newcomer.svg'],
  ['last-meadow', 'Last Meadow Online', 'last-meadow.png'],
] as const;

function namedVariants(directory: string, filenames: string[], extension = 'svg') {
  return filenames.map(name => [name[0]!.toUpperCase() + name.slice(1), `${directory}/${name}.${extension}`] as const);
}

export const BADGE_TIERS: Partial<Record<string, readonly (readonly [string, string])[]>> = {
  'account-age': namedVariants('account-age', ['seed','sprout','bud','blossom','sapling','redwood','sequoia','bristlecone','stromatolite','primordial']),
  'game-time': namedVariants('game-time', ['casual','recreational','seasoned','serious','dedicated','committed','devoted','ironclad','unshakeable','eternal']),
  'game-variety': namedVariants('game-variety', ['sampler','dabbler','enthusiast','explorer','adventurer','ranger','voyager','maverick','polymath','universalist']),
  'gifting': namedVariants('gifting', ['patron','champion','hero','luminary','icon','legend'], 'png'),
  'streaming': namedVariants('streaming', ['newcomer','fledgling','breakout','standout','headliner','star','sensation','trendsetter','visionary','phenomenon']),
  nitro: ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'emerald', 'ruby', 'opal']
    .map((tier, index) => [`Nível ${index + 1}`, `subscriptions/badges/${tier}.png`] as const),
  boost: [1, 2, 3, 6, 9, 12, 15, 18, 24]
    .map((months, index) => [`${months} ${months === 1 ? 'mês' : 'meses'}`, `boosts/discord-boost-${index + 1}.svg`] as const),
};

export function discordBadgeIcon(asset: string): string {
  if (!asset) return '';
  if (/^[a-f0-9]{32}$/i.test(asset)) return `https://cdn.discordapp.com/badge-icons/${asset}.png`;
  return `https://cdn.jsdelivr.net/gh/mezotv/discord-badges@main/assets/${asset}`;
}

export const nativeProfileBadges: ProfileBadge = {
  id: 'aura-tool-discord-badges',
  getBadges({ userId }) {
    if (userId !== UserStore?.getCurrentUser()?.id) return [];

    const { globalEnabled, badges } = auraSettings.plain.customization ?? loadSettings();
    if (!globalEnabled) return [];

    const selected = new Map(badges.filter(badge => badge.native && badge.enabled).map(badge => [badge.id, badge]));
    return DISCORD_BADGES.flatMap(([key, name, asset]) => {
      const id = `discord-${key}`;
      const badge = selected.get(id);
      if (!badge) return [];
      const tierAsset = BADGE_TIERS[key]?.[badge.nativeTier ?? -1]?.[1];
      const iconSrc = imageSource(badge.nativeIcon ?? '') || discordBadgeIcon(tierAsset ?? asset);
      if (!iconSrc) return [];
      const detail = badge.nativeDetail?.trim();
      return [{
        id: `aura-${id}`, name, description: detail ? `${name} · ${detail}` : name, iconSrc,
        props: { style: { transform: 'scale(1.07)' } },
      }];
    });
  },
};

