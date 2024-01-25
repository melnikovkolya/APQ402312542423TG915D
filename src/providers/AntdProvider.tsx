"use client";

import React, { useState } from "react";
import { useServerInsertedHTML } from "next/navigation";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

// NOTE: Needed for the issue https://github.com/ant-design/ant-design/issues/39891 in combination with Next.js
// 'loads the styles after page load in Next.js making the page look un-styled for a split second'
export const AntdProvider: React.FunctionComponent<React.PropsWithChildren> = ({
  children,
}) => {
  const [cache] = useState(() => createCache());

  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
};
