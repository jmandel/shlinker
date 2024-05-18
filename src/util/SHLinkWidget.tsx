import { useState, useEffect } from "preact/hooks";
import SHLinkWidgetView, {
  RenderConfig,
  SHLinkData,
} from "../components/SHLinkComponent";
import * as qrcode from "qrcode";

interface SHLinkWidgetProps {
  shlinkData: SHLinkData;
  config: RenderConfig;
}

function makeShlinkWithPrefix(shlinkData: SHLinkData, prefix?: string | null) {
  const prefixToUse =
    prefix === null ? null : prefix ?? shlinkData.originalPrefix;

  if (prefixToUse) {
    return `${prefixToUse}#${shlinkData.shlink}`;
  }
  return `${shlinkData.shlink}`;
}
export function SHLinkWidget({ shlinkData, config }: Readonly<SHLinkWidgetProps>) {
  const [toast, setToast] = useState<string | null>(null);
  const [qrCodeDataURL, setQRCodeDataURL] = useState("");
  const [showQRCode, setShowQRCode] = useState(config.qrStartsOpen || false);

  const totalFiles = (shlinkData.files || []).length;
  const totalSize =
    shlinkData.totalFileSize ??
    (shlinkData.files || []).reduce((total, file) => total + file.size, 0);

  const totalResources = (shlinkData.files || [])
    .map((f) => f?.contentJson?.entry?.length || 0)
    .reduce((total, e) => total + e, 0);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      makeShlinkWithPrefix(shlinkData, config.viewerPrefix)
    );
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
          title: "SMART Health Link",
          url: makeShlinkWithPrefix(shlinkData, config.viewerPrefix),
        });
        console.log("Link shared successfully");
      } catch (error) {
        console.error("Error sharing link:", error);
      }
    } else {
      console.log("Web Share API not supported");
      copyToClipboard();
    }
  };

  const qrContainerRef = (qrcodeContainer: HTMLDivElement | null) => {
    if (!qrcodeContainer) return;
    const qrcodeHeight = qrcodeContainer.clientWidth;
    qrcodeContainer.style.setProperty("--qrcode-height", `${qrcodeHeight}px`);
  };

  useEffect(() => {
    qrcode
      .toDataURL(makeShlinkWithPrefix(shlinkData, config.viewerPrefix))
      .then((dataURL) => setQRCodeDataURL(dataURL));
  }, [shlinkData]);
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
    <SHLinkWidgetView
      shlinkData={shlinkData}
      config={config}
      totalFiles={totalFiles}
      totalSize={totalSize}
      totalResources={totalResources}
      copyToClipboard={copyToClipboard}
      downloadAllFiles={downloadAllFiles}
      shareLink={shareLink}
      generateQRCode={generateQRCode}
      closeQRCode={closeQRCode}
      qrContainerRef={qrContainerRef}
      showQRCode={showQRCode}
      qrCodeDataURL={qrCodeDataURL}
      toast={toast}
    />
  );
}
