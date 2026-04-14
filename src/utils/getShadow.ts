import { Theme } from '@mui/material/styles';

export default function getShadow(theme: Theme, shadow: string) {
  switch (shadow) {
    case 'primaryButton':
      return `0 2px 4px ${theme.palette.primary.main}40`;
    case 'secondaryButton':
      return `0 2px 4px ${theme.palette.secondary.main}40`;
    case 'errorButton':
      return `0 2px 4px ${theme.palette.error.main}40`;
    case 'warningButton':
      return `0 2px 4px ${theme.palette.warning.main}40`;
    case 'infoButton':
      return `0 2px 4px ${theme.palette.info.main}40`;
    case 'successButton':
      return `0 2px 4px ${theme.palette.success.main}40`;
    default:
      return theme.shadows[1];
  }
}
