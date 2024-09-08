// docs/exalted-docs/app/docs/[[...slug]]/page.tsx
import { getPage, getPages } from "@/app/source";
import type { Metadata } from "next";
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from "fumadocs-ui/page";
import { ImageIcon } from "@/app/components";
import { notFound } from "next/navigation";
import { imageExists } from "@/app/utils/imageUtils";

export default async function Page({
  params,
}: {
  params: { slug?: string[] };
}) {
  const page = getPage(params.slug);

  if (page == null) {
    notFound();
  }

  const MDX = page.data.exports.default;
  const iconPath = params.slug ? params.slug.join("/") : "";
  const iconExists = imageExists(iconPath);

  return (
    <DocsPage toc={page.data.exports.toc} full={page.data.full}>
      <div className="flex items-end space-x-4">
      {params.slug && (
          <ImageIcon
            iconPath={iconPath}
            title={page.data.title}
            size={5}
            className="mr-2"
            exists={iconExists}
          />
        )}
        <DocsTitle className="leading-none -mb-[0.095em] inline-block align-baseline">
          {page.data.title}
        </DocsTitle>
      </div>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return getPages().map((page) => ({
    slug: page.slugs,
  }));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
  const page = getPage(params.slug);

  if (page == null) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  } satisfies Metadata;
}
