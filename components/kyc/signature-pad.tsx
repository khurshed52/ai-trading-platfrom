"use client";

import { useRef, useState } from "react";
import { DeleteOutlined, UndoOutlined } from "@ant-design/icons";
import { Button } from "antd";
import SignatureCanvas from "react-signature-canvas";

type SignaturePadProps = {
  onChange: (signature: string | null) => void;
};

export function SignaturePad({ onChange }: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const publishSignature = () => {
    const signaturePad = signatureRef.current;
    if (!signaturePad || signaturePad.isEmpty()) {
      setHasSignature(false);
      onChange(null);
      return;
    }

    const signature = signaturePad.getTrimmedCanvas().toDataURL("image/png");
    setHasSignature(true);
    onChange(signature);
  };

  const handleClear = () => {
    signatureRef.current?.clear();
    setHasSignature(false);
    onChange(null);
  };

  const handleUndo = () => {
    const signaturePad = signatureRef.current;
    if (!signaturePad) {
      return;
    }

    const strokes = signaturePad.toData();
    signaturePad.fromData(strokes.slice(0, -1));
    publishSignature();
  };

  return (
    <section
      aria-label="Electronic signature"
      className="rounded-xl border border-slate-200 bg-white p-3"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="m-0 text-sm font-semibold text-slate-900">
          Your Signature <span className="text-red-500">*</span>
        </p>
        <div className="flex items-center gap-1">
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            disabled={!hasSignature}
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            type="text"
            size="small"
            icon={<UndoOutlined />}
            disabled={!hasSignature}
            onClick={handleUndo}
          >
            Undo
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <SignatureCanvas
          ref={signatureRef}
          penColor="#0f172a"
          minWidth={1.4}
          maxWidth={3}
          throttle={8}
          clearOnResize={false}
          onEnd={publishSignature}
          canvasProps={{
            width: 1000,
            height: 210,
            className: "block h-40 w-full touch-none bg-white sm:h-44",
            "aria-label": "Draw your electronic signature here",
            role: "img",
            tabIndex: 0,
          }}
        />
      </div>
      <p className="mb-0 mt-2 text-center text-[11px] leading-4 text-slate-500">
        Draw your signature using your mouse, trackpad, or finger.
      </p>
    </section>
  );
}
