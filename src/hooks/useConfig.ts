import { ThemeDirection } from '../config';

export default function useConfig() {
  return {
    themeDirection: ThemeDirection.LTR,
    mode: 'light',
    presetColor: 'default',
    i18n: 'vi',
    miniDrawer: false,
    container: true,
    fontFamily: 'Outfit',
    borderRadius: 16,
    themeContrast: false,
  };
}
