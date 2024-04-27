import * as preact from "preact";
import { useState, useEffect } from "preact/hooks";
import * as qrcode from "qrcode";
import pako from "pako";
import * as jose from "jose";
import smartLogo from "./smart-logo.svg";
import prettyBytes from "pretty-bytes";
import "./shlinker.css"  

interface SHLinkData {
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

interface SHLinkWidgetProps {
  shlinkData: SHLinkData;
}

interface ManifestRequest {
  recipient: string;
  passcode?: string;
}

interface SHLinkWidgetProps {
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
  const [showQRCode, setShowQRCode] = useState(false);

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
    }, 800);
  }

  return (
    <div className="shlink-widget">
      <img className="shlink-widget__logo" src={smartLogo} alt="SMART Logo" />
      <div className="shlink-widget__button-group">
        <button className="shlink-widget__button" onClick={copyToClipboard}>
          {(toast && toast) || "Copy"}
        </button>
        <button className="shlink-widget__button" onClick={downloadAllFiles}>
          Download
        </button>
        {!showQRCode && (
          <button className="shlink-widget__button" onClick={generateQRCode}>
            QR
          </button>
        )}
        {showQRCode && (
          <button className="shlink-widget__button" onClick={closeQRCode}>
            Hide
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
}
export function render(
  shlinkData: SHLinkData,
  container: Element,
  config: RenderConfig = { showDetails: true }
) {
  preact.render(
    <SHLinkWidget shlinkData={shlinkData} config={config} />,
    container
  );
}
