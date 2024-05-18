import * as preact from "preact";
import * as jose from "jose";
import pako from "pako";
import { RenderConfig, SHLinkData, File } from "./components/SHLinkComponent";
import { SHLinkWidget } from "./util/SHLinkWidget";
import "./shlinker.css";

interface ManifestRequest {
  recipient: string;
  passcode?: string;
}

export function parse(shlink?: string): SHLinkData {
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
    originalPrefix: viewerPrefix,
  };
}

interface RetrieveOptions {
  recipient?: string;
  passcode?: string;
}

export async function retrieve(
  shlinkData: SHLinkData,
  { recipient = "Generic Recipient", passcode }: RetrieveOptions = {}
): Promise<SHLinkData> {
  const { url, flag, key } = shlinkData;

  let files: File[] = [];
  let totalFileSize = 0;

  if (flag.includes("U")) {
    const response = await fetch(url);
    const encryptedFile = await response.text();
    totalFileSize += encryptedFile.length;
    const decryptedFiles = await decryptFile(encryptedFile, key);
    files = decryptedFiles.map((file, index) => ({
      ...(file as File),
      name: file.name ?? `shl-file-${index}.json`,
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
        totalFileSize += encryptedFile.length;
        const decryptedFiles = await decryptFile(encryptedFile, key);
        decryptedFiles.forEach((file, shcIndex) => {
          files.push({
            ...(file as File),
            name: file.name ?? `shl-file-${index}-bundle-${shcIndex}.json`,
          });
        });
      })
    );
  }

  return { ...shlinkData, files, totalFileSize };
}

async function decodeHealthCard(vc: string): Promise<Partial<File>> {
  const compressedPayload = jose.base64url.decode(vc.split(".")[1]);
  const decompressedPayload = pako.inflateRaw(compressedPayload, {
    to: "string",
  });
  return {
    contentJson: JSON.parse(decompressedPayload ?? "{}").vc?.credentialSubject
      ?.fhirBundle,
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
    jose.base64url.decode(key),
    { inflateRaw: async (data: Uint8Array) => pako.inflateRaw(data) }
  );
  const decryptedPayload = new TextDecoder().decode(decryptedFile.plaintext);

  let mimeType = decryptedFile.protectedHeader.cty ?? "application/fhir+json";
  try {
    const parsed = JSON.parse(decryptedPayload);
    if (parsed.verifiableCredential) {
      mimeType = "application/smart-health-card";
    }
  } catch {
    console.log("Failed to parse decrypted payload as JSON");
  }
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

export function render(
  shlinkData: SHLinkData,
  container: Element,
  config: RenderConfig = { showDetails: true, qrStartsOpen: false }
) {
  preact.render(
    <SHLinkWidget shlinkData={shlinkData} config={config} />,
    container
  );
}