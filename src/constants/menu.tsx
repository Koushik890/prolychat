import { AutomationDuoToneBlue, HomeDuoToneBlue, RocketDuoToneBlue, SettingsDuoToneWhite } from '@/icons';
import { v4 as uuid } from 'uuid';

export interface SideBarProps {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const SIDEBAR_MENU: SideBarProps[] = [
  {
    id: uuid(),
    label: 'home',
    icon: <HomeDuoToneBlue />,
  },
  {
    id: uuid(),
    label: 'automations',
    icon: <AutomationDuoToneBlue />,
  },
  {
    id: uuid(),
    label: 'settings',
    icon: <SettingsDuoToneWhite />,
  },
];