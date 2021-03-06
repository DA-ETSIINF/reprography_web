export interface RegisterUser {
  username: string;
  email: string;
  password: string;
}

export interface LoginUser {
  username: string;
  password: string;
}

export interface UserInfo {
  username: string;
  email: string;
  funds: number;
  id: number;
}

export interface Folder {
  id: number;
  name: string;
  files: FileItem[];
  folders: Folder[];
}

export interface ShowedItems {
  id: number;
  name: string;
  files: FileItem[];
  folders: FolderItem[];
}

export interface FolderItem {
  id: number;
  name: string;
  shorten?: string;
}

export interface FileItem {
  id: number;
  name: string;
  type: string;
  link: string;
  npages: number;
  shorten?: string;
}

export interface FileToPrint {
  documentId: number;
  name: string;
  npages: number;
  doubleSided: boolean;
  ncopies: number;
  color: boolean;
}

export interface Notification {
  title: string;
  status: 'error' | 'loading' | 'ok' | 'info';
  description?: string;
}

export type popupMenuType = 'file' | 'folder' | 'itemExplorer';
export interface StreamRightClick {
  event: MouseEvent;
  type: popupMenuType;
}

export interface ItemMenu {
  text: string;
  icon: string;
  functionToRun: Function;
}

export type userOS = 'Windows' | 'Linux' | 'iOS' | 'Mac OS' | 'Android';
