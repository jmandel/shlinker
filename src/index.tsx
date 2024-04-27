import * as preact from "preact";
import { useState, useEffect } from "preact/hooks";
import * as qrcode from "qrcode";
import pako from "pako";
import * as jose from "jose";
import smartLogo from "./smart-logo.svg";
import prettyBytes from "pretty-bytes";

const Download04Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"} >
    <path d="M12 14.5L12 4.5M12 14.5C11.2998 14.5 9.99153 12.5057 9.5 12M12 14.5C12.7002 14.5 14.0085 12.5057 14.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 16.5C20 18.982 19.482 19.5 17 19.5H7C4.518 19.5 4 18.982 4 16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const QrCodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"} >
    <path d="M3 6C3 4.58579 3 3.87868 3.43934 3.43934C3.87868 3 4.58579 3 6 3C7.41421 3 8.12132 3 8.56066 3.43934C9 3.87868 9 4.58579 9 6C9 7.41421 9 8.12132 8.56066 8.56066C8.12132 9 7.41421 9 6 9C4.58579 9 3.87868 9 3.43934 8.56066C3 8.12132 3 7.41421 3 6Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 18C3 16.5858 3 15.8787 3.43934 15.4393C3.87868 15 4.58579 15 6 15C7.41421 15 8.12132 15 8.56066 15.4393C9 15.8787 9 16.5858 9 18C9 19.4142 9 20.1213 8.56066 20.5607C8.12132 21 7.41421 21 6 21C4.58579 21 3.87868 21 3.43934 20.5607C3 20.1213 3 19.4142 3 18Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 12L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 6C15 4.58579 15 3.87868 15.4393 3.43934C15.8787 3 16.5858 3 18 3C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6C21 7.41421 21 8.12132 20.5607 8.56066C20.1213 9 19.4142 9 18 9C16.5858 9 15.8787 9 15.4393 8.56066C15 8.12132 15 7.41421 15 6Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M21 12H15C13.5858 12 12.8787 12 12.4393 12.4393C12 12.8787 12 13.5858 12 15M12 17.7692V20.5385M15 15V16.5C15 17.9464 15.7837 18 17 18C17.5523 18 18 18.4477 18 19M16 21H15M18 15C19.4142 15 20.1213 15 20.5607 15.44C21 15.8799 21 16.5881 21 18.0043C21 19.4206 21 20.1287 20.5607 20.5687C20.24 20.8898 19.7767 20.9766 19 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const Copy01Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"} >
    <path d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9L16 9C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16L9 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Tick01Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"} >
    <path d="M5 14.5C5 14.5 6.5 14.5 8.5 18C8.5 18 14.0588 8.83333 19 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Share01Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} fill={"none"} >
    <path d="M20.3927 8.03168L18.6457 6.51461C17.3871 5.42153 16.8937 4.83352 16.2121 5.04139C15.3622 5.30059 15.642 6.93609 15.642 7.48824C14.3206 7.48824 12.9468 7.38661 11.6443 7.59836C7.34453 8.29742 6 11.3566 6 14.6525C7.21697 13.9065 8.43274 13.0746 9.8954 12.7289C11.7212 12.2973 13.7603 12.5032 15.642 12.5032C15.642 13.0554 15.3622 14.6909 16.2121 14.9501C16.9844 15.1856 17.3871 14.5699 18.6457 13.4769L20.3927 11.9598C21.4642 11.0293 22 10.564 22 9.99574C22 9.4275 21.4642 8.96223 20.3927 8.03168Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.5676 3C6.70735 3.00694 4.68594 3.10152 3.39411 4.39073C2 5.78202 2 8.02125 2 12.4997C2 16.9782 2 19.2174 3.3941 20.6087C4.78821 22 7.03198 22 11.5195 22C16.0071 22 18.2509 22 19.645 20.6087C20.6156 19.64 20.9104 18.2603 21 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

import "./shlinker.css"  

export interface SHLinkData {
  shlink: string;
  originalPrefix?: string;
  url: string;
  flag: string;
  key: string;
  label: string;
  files?: File[];
}

interface File {
  name: string;
  size: number;
  contentJson: any;
  mimeType: string;
}

interface ManifestRequest {
  recipient: string;
  passcode?: string;
}

export interface SHLinkWidgetProps {
  shlinkData: SHLinkData;
  config: RenderConfig
}

function makeShlinkWithPrefix(shlinkData: SHLinkData, prefix?: string | null) {
  const prefixToUse = (prefix === null) ? null : prefix ?? shlinkData.originalPrefix;

  if (prefixToUse) {
    return `${prefixToUse}#${shlinkData.shlink}`;
  }
  return `${shlinkData.shlink}`;
}

function SHLinkWidget({ shlinkData, config }: SHLinkWidgetProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [qrCodeDataURL, setQRCodeDataURL] = useState("");
  const [showQRCode, setShowQRCode] = useState(config.qrStartsOpen || false);

  const totalFiles = (shlinkData.files || []).length;
  const totalSize = (shlinkData.files || []).reduce(
    (total, file) => total + file.size,
    0
  );

  const totalResources = (shlinkData.files || []).map(f => f?.contentJson?.entry?.length || 0).reduce((total, e) => total + e, 0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(makeShlinkWithPrefix(shlinkData, config.viewerPrefix));
    makeToast("Copied!");
  };

  const downloadAllFiles = () => {
    (shlinkData.files || []).forEach((file) => {
      const blob = new Blob([JSON.stringify(file.contentJson)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

    const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SMART Health Link',
          text: '',
          url: makeShlinkWithPrefix(shlinkData, config.viewerPrefix),
        });
        console.log('Link shared successfully');
      } catch (error) {
        console.error('Error sharing link:', error);
      }
    } else {
      console.log('Web Share API not supported');
      copyToClipboard();
    }
  };


  const qrContainerRef = (qrcodeContainer: HTMLDivElement | null) => {
      if (!qrcodeContainer) return;
    const qrcodeHeight = qrcodeContainer.clientWidth;
    qrcodeContainer.style.setProperty('--qrcode-height', `${qrcodeHeight}px`);
  };

  useEffect(() => {
     qrcode.toDataURL(makeShlinkWithPrefix(shlinkData, config.viewerPrefix)).then((dataURL) => setQRCodeDataURL(dataURL));
  }, [shlinkData])
  const generateQRCode = async () => {
    setShowQRCode(true);
  };

  const closeQRCode = () => {
    setShowQRCode(false);
  };

  function makeToast(message: string) {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 600);
  }

  return (
    <div className="shlink-widget">
      <img className="shlink-widget__logo" src={smartLogo} alt="SMART Logo" />
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
        {(true || typeof navigator.share !== "undefined") && <button
          className="shlink-widget__button"
          onClick={shareLink}
          title="Share"
        >
          <Share01Icon />
        </button>}
        
        {!showQRCode && (
          <button className="shlink-widget__button" onClick={generateQRCode} title="QR">
          <QrCodeIcon />
          </button>
        )}
        {showQRCode && (
          <button className="shlink-widget__button" onClick={closeQRCode} title="QR">
          <QrCodeIcon />
          </button>
        )}
      </div>
      <div ref={qrContainerRef} className={`shlink-widget__qrcode-container ${showQRCode ? 'shlink-widget__qrcode-container--expand' : ''}`}>
        <img
          className="shlink-widget__qrcode"
          onClick={closeQRCode}
          src={qrCodeDataURL}
          alt="QR Code"
        />
      </div>
      {shlinkData.label && <div class="shlink-widget__label">{shlinkData.label}</div> || null}
      {(config.showDetails && (
        <table className="shlink-widget__details">
          
          <tr>
            <td>Files</td>
            <td>{totalFiles}</td>
          </tr>
          <tr>
            <td>FHIR</td>
            <td>{totalResources}</td>
          </tr>
          <tr>
            <td>Size</td>
            <td>{prettyBytes(totalSize)}</td>
          </tr>
        </table>
      )) ||
        null}
    </div>
  );
}


export function parse(
  shlink?: string,
): SHLinkData {

  const parts = (shlink ?? window.location.href).split("#");
  const shlinkToUse = parts.at(-1);
  const viewerPrefix = parts.at(-2);

  let shlinkPayloadEncoded = shlinkToUse!.split("shlink:/")?.at(1);
  const payload = jose.base64url.decode(shlinkPayloadEncoded!);
  const payloadText = new TextDecoder().decode(payload);
  const { url, flag, key, label } = JSON.parse(payloadText);

  return {
    shlink: shlinkToUse!,
    url,
    flag,
    key,
    label,
    originalPrefix: viewerPrefix
  };
}

interface RetrieveOptions {
  recipient?: string;
  passcode?: string;
}

export async function retrieve(
  shlinkData: SHLinkData,
  {recipient = "Generic Recipient", passcode}: RetrieveOptions = {}
): Promise<SHLinkData> {
  const { url, flag, key } = shlinkData;

  let files: File[] = [];

  if (flag.includes("U")) {
    const response = await fetch(url);
    const encryptedFile = await response.text();
    const decryptedFiles = await decryptFile(encryptedFile, key);
    files = decryptedFiles.map((file, index) => ({
      ...(file as File),
      name: file.name || `shl-file-${index}.json`,
    }));
  } else {
    const body: ManifestRequest = { recipient };
    if (flag.includes("P") && !passcode) {
      const promptedPasscode = window.prompt(
        "Enter the passcode for the SMART Health Link:"
      );
      if (promptedPasscode) {
        body.passcode = promptedPasscode;
      }
    } else if (flag.includes("P") && passcode) {
      body.passcode = passcode;
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const manifest: { files: any[] } = await response.json();

    await Promise.all(
      manifest.files.map(async (file: any, index) => {
        const response = await fetch(file.location);
        const encryptedFile = await response.text();
        const decryptedFiles = await decryptFile(encryptedFile, key);
        decryptedFiles.forEach((file, shcIndex) => {
          files.push({
            ...(file as File),
            name: file.name || `shl-file-${index}-bundle-${shcIndex}.json`,
          });
        });
      })
    );
  }

  return { ...shlinkData, files };
}

async function decodeHealthCard(vc: string): Promise<Partial<File>> {
  const compressedPayload = jose.base64url.decode(vc.split(".")[1]);
  const decompressedPayload = pako.inflateRaw(compressedPayload, {
    to: "string",
  });
  return {
    contentJson: JSON.parse(decompressedPayload ?? "{}").vc?.credentialSubject?.fhirBundle,
    mimeType: "application/fhir+json",
    size: decompressedPayload.length,
  };
}

async function decryptFile(
  encryptedFile: string,
  key: string
): Promise<Array<Partial<File>>> {
  const decryptedFile = await jose.compactDecrypt(
    encryptedFile,
    jose.base64url.decode(key)
  );
  const decryptedPayload = new TextDecoder().decode(decryptedFile.plaintext);

  let mimeType = decryptedFile.protectedHeader.cty ?? "application/fhir+json";
  try {
    const parsed = JSON.parse(decryptedPayload);
    if (parsed.verifiableCredential) {
      mimeType = "application/smart-health-card";
    }
  } catch {}

  if (mimeType === "application/smart-health-card") {
    const vcs = JSON.parse(decryptedPayload).verifiableCredential;
    return await Promise.all(vcs.map(decodeHealthCard));
  } else if (mimeType === "application/fhir+json") {
    return [
      {
        contentJson: JSON.parse(decryptedPayload),
        mimeType,
        size: decryptedPayload.length,
      },
    ];
  }

  throw new Error("Unsupported SHL File MIME type: " + mimeType);
}

interface RenderConfig {
  showDetails: boolean;
  viewerPrefix?: string | null;
  qrStartsOpen?: boolean;
}
export function render(
  shlinkData: SHLinkData,
  container: Element,
  config: RenderConfig = { showDetails: true, qrStartsOpen: false}
) {
  preact.render(
    <SHLinkWidget shlinkData={shlinkData} config={config} />,
    container
  );
}
