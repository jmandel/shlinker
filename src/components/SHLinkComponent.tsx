import * as preact from "preact";
import {
  Copy01Icon,
  Download04Icon,
  QrCodeIcon,
  Share01Icon,
  Tick01Icon,
} from "./buttons";
import smartLogo from "../smart-logo.svg";
import prettyBytes from "pretty-bytes";


export interface File {
    name: string;
    size: number;
    contentJson: any;
    mimeType: string;
  }

export interface RenderConfig {
    showDetails: boolean;
    viewerPrefix?: string | null;
    qrStartsOpen?: boolean;
    logoOverride?: string | null;
  }

export interface SHLinkData {
    shlink: string;
    originalPrefix?: string;
    url: string;
    flag: string;
    key: string;
    label: string;
    files?: File[];
    totalFileSize?: number;
  }

export interface SHLinkWidgetProps {
    shlinkData: SHLinkData;
    config: RenderConfig;
    totalFiles: number;
    totalSize: number;
    totalResources: number;
    copyToClipboard: () => void;
    downloadAllFiles: () => void;
    shareLink: () => void;
    generateQRCode: () => void;
    closeQRCode: () => void;
    qrContainerRef: (qrcodeContainer: HTMLDivElement | null) => void;
    showQRCode: boolean;
    qrCodeDataURL: string;
    toast: string | null;
    // Add any other props you're passing to SHLinkWidgetView here
  }
  
const SHLinkWidgetView: preact.FunctionComponent<SHLinkWidgetProps> = ({
  shlinkData,
  config,
  totalFiles,
  totalSize,
  totalResources,
  copyToClipboard,
  downloadAllFiles,
  shareLink,
  generateQRCode,
  closeQRCode,
  qrContainerRef,
  showQRCode,
  qrCodeDataURL,
  toast,
}) => {
  return (
    <div className="shlink-widget">
      {config.logoOverride !== null && (
        <img
          className="shlink-widget__logo"
          src={config.logoOverride ?? smartLogo}
          alt="SMART Logo"
        />
      )}
      <div className="shlink-widget__button-group">
        <button
          className="shlink-widget__button"
          onClick={copyToClipboard}
          title="Copy"
        >
          {toast ? <Tick01Icon /> : <Copy01Icon />}
        </button>
        <button
          className="shlink-widget__button"
          onClick={downloadAllFiles}
          title="Download"
        >
          <Download04Icon />
        </button>
        {typeof navigator.share !== "undefined" && (
          <button
            className="shlink-widget__button"
            onClick={shareLink}
            title="Share"
          >
            <Share01Icon />
          </button>
        )}

        {!showQRCode && (
          <button
            className="shlink-widget__button"
            onClick={generateQRCode}
            title="QR"
          >
            <QrCodeIcon />
          </button>
        )}
        {showQRCode && (
          <button
            className="shlink-widget__button"
            onClick={closeQRCode}
            title="QR"
          >
            <QrCodeIcon />
          </button>
        )}
      </div>
      <div
        ref={qrContainerRef}
        className={`shlink-widget__qrcode-container ${
          showQRCode ? "shlink-widget__qrcode-container--expand" : ""
        }`}
      >
        <button onClick={closeQRCode}>
          <img
            className="shlink-widget__qrcode"
            src={qrCodeDataURL}
            alt="QR Code"
          />
        </button>
      </div>
      {(shlinkData.label && (
        <div className="shlink-widget__label">{shlinkData.label}</div>
      )) ||
        null}
      {(config.showDetails && (
        <table className="shlink-widget__details">
          <thead>
            <tr>
              <th>Attribute</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Files</td>
              <td>{totalFiles}</td>
            </tr>
            <tr>
              <td>FHIR</td>
              <td>{prettyBytes(totalResources).replace("B", "R")}</td>
            </tr>
            <tr>
              <td>Size</td>
              <td>{prettyBytes(totalSize)}</td>
            </tr>
          </tbody>
        </table>
      )) ||
        null}
    </div>
  );
};

export default SHLinkWidgetView;