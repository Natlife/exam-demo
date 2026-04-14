export interface NavItemType {
  id?: string;
  title?: string;
  type?: string;
  url?: string;
  icon?: any;
  children?: NavItemType[];
  [key: string]: any;
}
