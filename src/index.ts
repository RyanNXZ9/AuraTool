import definePlugin from '@utils/types';
import { nativeProfileBadges } from './nativeBadges';
import SettingsPanel from './components/SettingsPanel';
import { initialize, cleanup } from './patcher';
import { auraSettings } from './storage';

export default definePlugin({
  name: 'Aura Tool',
  description: 'Local visual customization for profile badges, decorations, usernames and connections.',
  authors: [{ name: 'Aura Tool Contributors', id: 0n }],
  settings: auraSettings,
  dependencies: ['BadgeAPI'],
  userProfileBadge: nativeProfileBadges,
  settingsAboutComponent: SettingsPanel,
  start: initialize,
  stop: cleanup,
});
