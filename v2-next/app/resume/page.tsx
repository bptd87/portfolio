import React from "react";

export const dynamic = "force-dynamic";

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-black">
      <iframe
        title="Resume"
        src="/resume.pdf"
        className="w-full h-screen"
      />
    </div>
  );
}
