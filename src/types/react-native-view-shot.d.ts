declare module 'react-native-view-shot' {
  import { Component, RefObject } from 'react';
  import { ViewProps } from 'react-native';

  export interface CaptureOptions {
    format?: 'png' | 'jpg' | 'webm' | 'raw';
    quality?: number;
    result?: 'tmpfile' | 'base64' | 'data-uri' | 'zip-base64';
    snapshotContentContainer?: boolean;
  }

  export interface ViewShotRef {
    capture: () => Promise<string>;
  }

  export interface ViewShotProps extends ViewProps {
    options?: CaptureOptions;
    captureMode?: 'explicit' | 'continuous' | 'update' | 'mount';
    onCapture?: (uri: string) => void;
    onCaptureFailure?: (error: Error) => void;
  }

  export default class ViewShot extends Component<ViewShotProps> {
    capture: () => Promise<string>;
  }
}

declare module 'react-native-share' {
  export interface ShareOptions {
    url?: string;
    urls?: string[];
    type?: string;
    message?: string;
    title?: string;
    subject?: string;
    failOnCancel?: boolean;
  }

  const Share: {
    open: (options: ShareOptions) => Promise<void>;
    shareSingle: (options: ShareOptions) => Promise<void>;
  };

  export default Share;
}
