import * as preact from "preact";
import { useState } from "preact/hooks";
import * as qrcode from "qrcode";
import pako from "pako";
import * as jose from "jose";
import smartLogo from "./smart-logo.svg";
import Dropdown from "react-bootstrap/Dropdown";

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
  showDetails: boolean;
}

function SHLinkWidget({ shlinkData, showDetails }: SHLinkWidgetProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [qrCodeDataURL, setQRCodeDataURL] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);

  const totalFiles = (shlinkData.files || []).length;
  const totalSize = (shlinkData.files || []).reduce(
    (total, file) => total + file.size,
    0
  );


  const copyToClipboard = () => {
    navigator.clipboard.writeText(shlinkData.shlink);
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
    const qrCodeDataURL = await qrcode.toDataURL(shlinkData.shlink);
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
    <div style={{ textAlign: "left" }}>
      <img  style={{ marginBottom: "10px" }} src={smartLogo} alt="SMART Logo" />
      <Dropdown style={{ marginBottom: "10px" }}>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          {toast && toast || "SMART Health Link"}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={copyToClipboard}>Copy link</Dropdown.Item>
          <Dropdown.Item onClick={downloadAllFiles}>
            Download files
          </Dropdown.Item>
          {!showQRCode && (
            <Dropdown.Item onClick={generateQRCode}>Show QR code</Dropdown.Item>
          )}
          {showQRCode && (
            <Dropdown.Item onClick={closeQRCode}>Close QR code</Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
      {(showQRCode && qrCodeDataURL && (
        <img onClick={closeQRCode} style={{ marginLeft: "-1em" }} src={qrCodeDataURL} alt="QR Code" />
      )) ||
        null}
        {showDetails && 
<table>
        <tr>
          <td style={{ paddingRight: "10px" }}>Label</td>
          <td>{shlinkData.label}</td>
        </tr>
        <tr>
          <td style={{ paddingRight: "10px" }}>Total files</td>
          <td>{totalFiles}</td>
        </tr>
        <tr>
          <td style={{ paddingRight: "10px" }}>Total size</td>
          <td>{totalSize} bytes</td>
        </tr>
      </table>
        || null}
      
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
    const decryptedFile = await decryptFile(encryptedFile, key);
    files = [{ ...(decryptedFile as File), name: "shl-file.json" }];
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
    const manifest = await response.json();

    files = await Promise.all(
      manifest.files.map(async (file: any) => {
        const response = await fetch(file.location);
        const encryptedFile = await response.text();
        const decryptedFile = await decryptFile(encryptedFile, key);
        return { ...(decryptedFile as File), name: file.name };
      })
    );
  }

  return { ...shlinkData, files };
}

async function decryptFile(
  encryptedFile: string,
  key: string
): Promise<Partial<File>> {
  const decryptedFile = await jose.compactDecrypt(
    encryptedFile,
    jose.base64url.decode(key)
  );
  const decryptedPayload = new TextDecoder().decode(decryptedFile.plaintext);

  const mimeType =
    decryptedFile.protectedHeader.cty ?? decryptedPayload.startsWith("{")
      ? "application/fhir+json"
      : "application/smart-health-card";

  if (mimeType === "application/smart-health-card") {
    const compressedPayload = jose.base64url.decode(
      decryptedPayload.split(".")[1]
    );
    const decompressedPayload = pako.inflateRaw(compressedPayload, {
      to: "string",
    });
    return {
      contentJson: JSON.parse(decompressedPayload ?? "{}").vc?.credentialSubject
        ?.fhirBundle,
      mimeType,
      size: decompressedPayload.length,
    };
  } else if (mimeType === "application/fhir+json") {
    return {
      contentJson: JSON.parse(decryptedPayload),
      mimeType,
      size: decryptedPayload.length,
    };
  }

  throw new Error("Unsupported SHL File MIME type: " + mimeType);
}

export function render(shlinkData: SHLinkData,container: Element, showDetails = true) {
  preact.render(<SHLinkWidget shlinkData={shlinkData} showDetails={showDetails} />, container);
}
