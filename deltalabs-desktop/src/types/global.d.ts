/** ################################ COMPONENT ############################# */
/** Main exported component logic for this file. */
export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly NEXT_PUBLIC_API_BASE_URL?: string;
    }
  }

  interface ElectronAPI {
    window: {
      minimize: () => void;
      maximize: () => void;
      close: () => void;
      isMaximized?: () => Promise<boolean>;
      onMaximizeChange?: (callback: (isMaximized: boolean) => void) => () => void;
    };
    platform: string;
    isElectron: boolean;
  }


  interface Window {
    electron?: ElectronAPI;
  }
}
/** ################################ /COMPONENT ############################# */
