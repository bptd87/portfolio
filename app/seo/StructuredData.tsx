import React from "react";

export function StructuredData({
  data,
}: {
  data?: Record<string, unknown>[];
}) {
  if (!data || data.length === 0) return null;

  return (
    <>
      {data.map((schema, index) => (
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={`json-ld-${index}`}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
