// docs/exalted-docs/app/source.ts
import { map } from "@/.map";
import { createMDXSource } from "fumadocs-mdx";
import { icons } from "lucide-react";
import { loader } from "fumadocs-core/source";
import { createElement } from "react";
import { ImageIcon } from "@/app/components";

export const { getPage, getPages, pageTree } = loader({
  baseUrl: "/docs",
  rootDir: "docs",
  source: createMDXSource(map),
  icon(icon) {
    if (!icon) {
      return;
    }

    if (icon) {
      return createElement(ImageIcon, {
        iconPath: icon,
        title: `Icon ${icon}`,
        size: 1.45,
      });
    }

    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons]);
    }

    return;
  },
});
