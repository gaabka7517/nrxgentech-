import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, ExternalLink, Copy, Check } from 'lucide-react';

interface QRCodeCardProps {
  certificateNumber: string;
  size?: number;
  showDetails?: boolean;
}

export const QRCodeCard: React.FC<QRCodeCardProps> = ({
  certificateNumber,
  size = 200,
  showDetails = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Construct absolute URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verifyUrl = `${origin}/verify/${encodeURIComponent(certificateNumber)}`;

  useEffect(() => {
    if (!canvasRef.current || !certificateNumber) return;

    QRCode.toCanvas(
      canvasRef.current,
      verifyUrl,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#075A91', // NexGen Blue for QR code modules
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      },
      (err) => {
        if (!err && canvasRef.current) {
          setDataUrl(canvasRef.current.toDataURL('image/png'));
        }
      }
    );
  }, [certificateNumber, verifyUrl, size]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR-${certificateNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs flex flex-col items-center text-center">
      <div className="relative p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded-lg shadow-2xs" />
        {/* Subtle center logo dot */}
        <div className="absolute w-8 h-8 bg-white dark:bg-gray-900 rounded-full border-2 border-[#5ACB00] flex items-center justify-center shadow-xs pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-[#075A91]" />
        </div>
      </div>

      {showDetails && (
        <div className="mt-4 w-full">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[#5ACB00] font-mono text-xs font-bold border border-emerald-100 dark:border-emerald-800">
            <span>ID:</span>
            <span>{certificateNumber}</span>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-1 break-all" title={verifyUrl}>
            {verifyUrl}
          </p>

          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleCopyLink}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              title="Copy verification link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={handleDownloadQR}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#075A91] hover:bg-[#064b79] rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Download QR image"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save QR</span>
            </button>

            <a
              href={`/verify/${encodeURIComponent(certificateNumber)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#075A91] dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-lg transition-colors"
              title="Open public verification page"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Verify</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
