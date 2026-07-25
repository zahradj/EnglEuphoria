/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Img } from 'npm:@react-email/components@0.0.22'

export const LOGO_WHITE_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-white.png'
export const LOGO_BLACK_URL = 'https://dcoxpyzoqjvmuuygvlme.supabase.co/storage/v1/object/public/email-assets/logo-black.png'
export const SITE_NAME = 'EnglEuphoria'

/**
 * The logo-white.png / logo-black.png assets are the square (500x500)
 * concentric "e" mark — always render width === height. Every template
 * used to hardcode this as a wide banner (e.g. 160x44), which squashed
 * the circular mark into a flat ellipse. Route all email logo usage
 * through here so that can't happen again.
 */
export function EmailLogo({
  variant = 'white',
  size = 44,
  style,
}: {
  variant?: 'white' | 'black'
  size?: number
  style?: React.CSSProperties
}) {
  return (
    <Img
      src={variant === 'white' ? LOGO_WHITE_URL : LOGO_BLACK_URL}
      width={size}
      height={size}
      alt={SITE_NAME}
      style={{ margin: '0 auto', display: 'block', ...style }}
    />
  )
}
