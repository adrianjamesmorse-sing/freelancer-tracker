import type { SVGProps } from 'react'

type IconName =
  | 'dashboard'
  | 'users'
  | 'folder'
  | 'bell'
  | 'sparkles'
  | 'menu'
  | 'chevron-left'
  | 'chevron-right'
  | 'plus'
  | 'minus'
  | 'search'
  | 'mail'
  | 'check'
  | 'filter'
  | 'settings'
  | 'upload'
  | 'globe'
  | 'pin'
  | 'chart'
  | 'message-square'
  | 'coins'
  | 'shield'
  | 'apps'
  | 'vertex'

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
}

export function Icon({ name, className, ...props }: IconProps) {
  if (name === 'vertex') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
        <path d="M12 3 5.5 7v10L12 21l6.5-4V7L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M12 3v18M5.5 7 18.5 17M18.5 7 5.5 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.1" fill="currentColor" />
      </svg>
    )
  }

  const paths: Record<Exclude<IconName,'vertex'>, string> = {
    dashboard: 'M3 13.5h8v7H3v-7Zm10 0h8v7h-8v-7ZM3 3.5h8v8H3v-8Zm10 0h8v4h-8v-4Z',
    users: 'M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19c0-2.8 3.3-4.5 5.5-4.5S14 16.2 14 19v1H3v-1Zm12 1v-1.1c0-1.1-.4-2.1-1.1-3 2 .2 5.1 1.4 5.1 4.1V20h-4Z',
    folder: 'M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-10Z',
    bell: 'M12 3.5a4.5 4.5 0 0 1 4.5 4.5V10c0 .9.3 1.8.8 2.6l1 1.4c.3.4 0 1-.5 1H6.2c-.5 0-.8-.6-.5-1l1-1.4A4.8 4.8 0 0 0 7.5 10V8A4.5 4.5 0 0 1 12 3.5Zm0 17a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2Z',
    sparkles: 'm12 3 1.6 4.1L18 8.7l-4.4 1.6L12 14.5l-1.6-4.2L6 8.7l4.4-1.6L12 3Zm6.5 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5ZM5.5 14l.8 2 .2.4 2 .8-2 .8-.2.4-.8 2-.8-2-.4-.2-2-.8 2-.8.4-.4.8-2Z',
    menu: 'M4 7h16M4 12h16M4 17h16',
    'chevron-left': 'm15 18-6-6 6-6',
    'chevron-right': 'm9 6 6 6-6 6',
    plus: 'M12 5v14M5 12h14',
    minus: 'M5 12h14',
    search: 'm21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z',
    mail: 'M4 6.5h16v11H4v-11Zm0 .5 8 6 8-6',
    check: 'M5 12.5 9.5 17 19 7',
    filter: 'M4 6h16M7 12h10m-7 6h4',
    settings: 'M12 8.5A3.5 3.5 0 1 1 12 15.5 3.5 3.5 0 0 1 12 8.5Zm8 3.5-1.7.8a6.7 6.7 0 0 1-.6 1.5l.9 1.6-1.7 1.7-1.6-.9c-.5.3-1 .5-1.5.6L12 20l-2.1-.7a6.7 6.7 0 0 1-1.5-.6l-1.6.9-1.7-1.7.9-1.6a6.7 6.7 0 0 1-.6-1.5L4 12l.7-2.1c.1-.5.3-1 .6-1.5l-.9-1.6 1.7-1.7 1.6.9c.5-.3 1-.5 1.5-.6L12 4l2.1.7c.5.1 1 .3 1.5.6l1.6-.9 1.7 1.7-.9 1.6c.3.5.5 1 .6 1.5L20 12Z',
    upload: 'M12 16V5m0 0-4 4m4-4 4 4M5 19h14',
    globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 0c2.4 2.3 3.8 5.6 4 10-.2 4.4-1.6 7.7-4 10-2.4-2.3-3.8-5.6-4-10 .2-4.4 1.6-7.7 4-10Zm-9.5 10h19M4.5 6.5h15M4.5 17.5h15',
    pin: 'M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    chart: 'M5 19V9m7 10V5m7 14v-7M3 19h18',
    'message-square': 'M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6A2.5 2.5 0 0 1 16.5 15H10l-4.5 4v-4H7.5A2.5 2.5 0 0 1 5 12.5v-6Z',
    coins: 'M12 5c4.4 0 8 1.1 8 2.5S16.4 10 12 10 4 8.9 4 7.5 7.6 5 12 5Zm8 5v3c0 1.4-3.6 2.5-8 2.5S4 14.4 4 13v-3m16 3v3c0 1.4-3.6 2.5-8 2.5S4 17.4 4 16v-3',
    shield: 'M12 3 5.5 5.5v5.7c0 4.5 3 8.6 6.5 9.8 3.5-1.2 6.5-5.3 6.5-9.8V5.5L12 3Zm0 5v8m-3-3 3 3 3-3',
    apps: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d={paths[name]} />
    </svg>
  )
}
