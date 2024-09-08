// components/imageIcon.tsx
'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { ImageProps } from 'next/image';

interface ImageIconProps extends Omit<ImageProps, 'src' | 'alt' | 'layout'> {
  iconPath: string;
  title: string;
  size?: number;
  exists?: boolean;
}

const ImageIcon: React.FC<ImageIconProps> = ({ 
  iconPath, 
  title, 
  size = 24, 
  exists = true,
  ...props 
}) => {
  const [error, setError] = useState(false);

  if (!exists || error) {
    return null;
  }

  return (
    <div style={{ width: `${size}em`, height: `${size}em` }} className={`relative not-prose file:${props.className}`}>
      <Image
        src={`/images/icons/${iconPath}.png`}
        alt={`Icon for ${title}`}
        layout="fill"
        objectFit="cover"
        objectPosition="top"
        className="flex-shrink-0 !my-0 not-prose"
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
};

export default ImageIcon;