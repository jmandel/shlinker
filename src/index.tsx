import * as preact from "preact";
import { useState } from "preact/hooks";
import * as qrcode from "qrcode";
import pako from "pako";
import * as jose from "jose";
import smartLogo from "./smart-logo.svg";
import prettyBytes from "pretty-bytes";

interface SHLinkData {
  shlink: string;
  url: string;
  flag: string;
  key: string;
  label: string;
  recipient: string;
  files?: File[];
}

interface File {
  name: string;
  size: number;
  contentJson: object;
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

function makeShlinkWithPrefix(shlinkData: SHLinkData, prefix?: string) {
  if (!prefix) {
    return shlinkData.shlink;
  }
  return `${prefix}#${shlinkData.shlink}`;
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

  const generateQRCode = async () => {
    const qrCodeDataURL = await qrcode.toDataURL(makeShlinkWithPrefix(shlinkData, config.viewerPrefix));
    setQRCodeDataURL(qrCodeDataURL);
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
    <div
      style={{
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        width: "200px",
      }}
    >
      <img style={{ marginBottom: "10px" }} src={smartLogo} alt="SMART Logo" />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "2px",
          flexWrap: "wrap",
        }}
      >
        <button
          style={{ flexGrow: 1, flexBasis: "20%", border: "1px solid black" }}
          onClick={copyToClipboard}
        >
          {(toast && toast) || "Copy"}
        </button>
        <button
          style={{ flexBasis: "20%", flexShrink: 1, border: "1px solid black" }}
          onClick={downloadAllFiles}
        >
          Download
        </button>
        {!showQRCode && (
          <button
            style={{
              flexShrink: 1,
              flexBasis: "20%",
              border: "1px solid black",
            }}
            onClick={generateQRCode}
          >
            QR
          </button>
        )}
        {showQRCode && (
          <button
            style={{
              flexShrink: 1,
              flexBasis: "20%",
              border: "1px solid black",
            }}
            onClick={closeQRCode}
          >
            Hide
          </button>
        )}
      </div>
      {(showQRCode && qrCodeDataURL && (
        <img
          onClick={closeQRCode}
          style={{ width: "calc(100% + 2em)", marginLeft: "-1em" }}
          src={qrCodeDataURL}
          alt="QR Code"
        />
      )) ||
        null}
      {(config.showDetails && (
        <table>
          <tr>
            <td style={{ paddingRight: "10px" }}>Label</td>
            <td>{shlinkData.label}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: "10px" }}>Files</td>
            <td>{totalFiles}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: "10px" }}>Size</td>
            <td>{prettyBytes(totalSize)}</td>
          </tr>
        </table>
      )) ||
        null}
    </div>
  );
}

export function process(
  shlink?: string,
  recipient = "Generic Recipient"
): SHLinkData {
  let shlinkToUse = shlink;
  if (!shlink) {
    shlinkToUse = window.location.hash.slice(1);
  }
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
    recipient,
  };
}

export async function retrieve(
  shlinkData: SHLinkData,
  passcode?: string
): Promise<SHLinkData> {
  const { url, flag, key, recipient } = shlinkData;

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
  viewerPrefix?: string;
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
