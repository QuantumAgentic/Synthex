import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'medium', showText = true, className = '' }: LogoProps) {
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 80,
  };

  const textSizeMap = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-5xl',
  };

  const logoSize = sizeMap[size];
  const textSize = textSizeMap[size];

  // Different positioning for large size (homepage)
  const logoMargin = size === 'large' ? 'translate-y-2 -mr-3' : '-mr-2';

  return (
    <Link href="/" className={`flex items-end gap-0 ${className}`}>
      <Image
        src="/synthex-logo.svg"
        alt="Synthex"
        width={logoSize}
        height={logoSize}
        priority
        className={logoMargin}
      />
      {showText && (
        <span className={`${textSize} font-bold text-gray-900`}>
          ynthex
          <span className="text-xs text-gray-500 ml-1 font-normal">x402</span>
        </span>
      )}
    </Link>
  );
}
