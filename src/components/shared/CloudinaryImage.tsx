"use client";

import Image from 'next/image';
import { CldImage, CldImageProps } from 'next-cloudinary';

interface CloudinaryImageProps extends Omit<CldImageProps, 'src'> {
    src: string;
    className?: string;
    alt: string;
}

export function CloudinaryImage({ src, alt, className, ...props }: CloudinaryImageProps) {
    // If src is already a Cloudinary URL, we should not use deliveryType="fetch" as it causes a recursive fetch loop
    // and might be blocked by Cloudinary. We use Next.js Image to proxy the request.
    // If src is a URL (Cloudinary or external), use Next.js Image
    // This avoids using CldImage's deliveryType="fetch" which requires specific Cloudinary account configuration
    // and can cause 404/400 errors if domains are not whitelisted in Cloudinary dashboard.
    // Next.js Image Optimization will handle these via remotePatterns in next.config.mjs.
    const isCloudinary = src.includes('res.cloudinary.com');
    const isUrl = src.startsWith('http');

    if (isCloudinary || isUrl) {
        // Extract standard Next.js Image props and filter out CldImage specific props if possible
        // simplified approach: assume props are compatible or effectively ignored
        const { quality, ...rest } = props;
        const validQuality = typeof quality === 'number' ? quality : undefined;

        return (
            <Image
                src={src}
                alt={alt}
                className={className}
                width={props.width}
                height={props.height}
                fill={props.fill}
                sizes={props.sizes}
                priority={props.priority}
                style={props.style}
                quality={validQuality}
                {...rest}
            />
        );
    }

    return (
        <CldImage
            src={src}
            alt={alt}
            className={className}
            width={props.width || 1200}
            height={props.height || 800}
            deliveryType={isUrl ? 'fetch' : undefined}
            {...props}
        />
    );
}
