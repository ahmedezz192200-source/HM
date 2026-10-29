import { ImageOff } from 'lucide-react'
import { useState } from 'react'

export default function ProductImage({ src, alt, className = '' }) {
  const [failedSrc, setFailedSrc] = useState('')
  const hasImage = Boolean(src) && failedSrc !== src

  if (!hasImage) {
    return (
      <div
        role="img"
        aria-label={`${alt} — الصورة الأصلية غير متوفرة`}
        className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}
      >
        <ImageOff size={32} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailedSrc(src)}
      className={className}
      loading="lazy"
    />
  )
}
