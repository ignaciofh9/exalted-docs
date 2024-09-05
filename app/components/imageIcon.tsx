import React from 'react';
import Image from 'next/image';
import { ImageProps } from 'next/image';

interface ImageIconProps extends Omit<ImageProps, 'src' | 'alt' | 'layout'> {
  iconPath: string;
  title: string;
  size?: number;
}

const ImageIcon: React.FC<ImageIconProps> = ({ 
  iconPath, 
  title, 
  size = 24, 
  ...props 
}) => {
  return (
    <div style={{ width: `${size}em`, height: `${size}em` }} className={`relative ${props.className}`}>
      <Image
        src={`/images/icons/${iconPath}.png`}
        alt={`Icon for ${title}`}
        layout="fill"
        objectFit="cover"
        objectPosition="top"
        className="flex-shrink-0"
        {...props}
      />
    </div>
  );
};

export default ImageIcon;