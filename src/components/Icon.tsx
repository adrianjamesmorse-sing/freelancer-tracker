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
  | 'search'
  | 'mail'
  | 'check'
  | 'filter'
  | 'settings'

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
}

const paths: Record<IconName, string> = {
  dashboard: 'M3 13.5h8v7H3v-7Zm10 0h8v7h-8v-7ZM3 3.5h8v8H3v-8Zm10 0h8v4h-8v-4Z',
  users: 'M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19c0-2.8 3.3-4.5 5.5-4.5S14 16.2 14 19v1H3v-1Zm12 1v-1.1c0-1.1-.4-2.1-1.1-3 2 .2 5.1 1.4 5.1 4.1V20h-4Z',
  folder: 'M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-10Z',
  bell: 'M12 3.5a4.5 4.5 0 0 1 4.5 4.5V10c0 .9.3 1.8.8 2.6l1 1.4c.3.4 0 1-.5 1H6.2c-.5 0-.8-.6-.5-1l1-1.4A4.8 4.8 0 0 0 7.5 10V8A4.5 4.5 0 0 1 12 3.5Zm0 17a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2Z',
  sparkles: 'm12 3 1.6 4.1L18 8.7l-4.4 1.6L12 14.5l-1.6-4.2L6 8.7l4.4-1.6L12 3Zm6.5 11 1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5ZM5.5 14l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  'chevron-left': 'm14.5 5-7 7 7 7',
  'chevron-right': 'm9.5 5 7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  search: 'm20 20-3.5-3.5M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z',
  mail: 'M4 6.5h16A1.5 1.5 0 0 1 21.5 8v8a1.5 1.5 0 0 1-1.5 1.5h-16A1.5 1.5 0 0 1 2.5 16V8A1.5 1.5 0 0 1 4 6.5Zm0 1.5 8 5 8-5',
  check: 'm5 12 4 4L19 6',
  filter: 'M4 6h16M7 12h10m-7 6h4',
  settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm7.5 3.5-.9-.4a7.7 7.7 0 0 0-.4-1.1l.5-.9a1 1 0 0 0-.2-1.2l-1.3-1.3a1 1 0 0 0-1.2-.2l-.9.5a7.7 7.7 0 0 0-1.1-.4l-.4-.9a1 1 0 0 0-.9-.6h-1.8a1 1 0 0 0-.9.6l-.4.9a7.7 7.7 0 0 0-1.1.4l-.9-.5a1 1 0 0 0-1.2.2L5.4 8a1 1 0 0 0-.2 1.2l.5.9a7.7 7.7 0 0 0-.4 1.1l-.9.4a1 1 0 0 0-.6.9v1.8a1 1 0 0 0 .6.9l.9.4c.1.4.2.7.4 1.1l-.5.9a1 1 0 0 0 .2 1.2l1.3 1.3a1 1 0 0 0 1.2.2l.9-.5c.3.2.7.3 1.1.4l.4.9a1 1 0 0 0 .9.6h1.8a1 1 0 0 0 .9-.6l.4-.9c.4-.1.8-.2 1.1-.4l.9.5a1 1 0 0 0 1.2-.2l1.3-1.3a1 1 0 0 0 .2-1.2l-.5-.9c.2-.4.3-.7.4-1.1l.9-.4a1 1 0 0 0 .6-.9v-1.8a1 1 0 0 0-.6-.9Z',
}

export function Icon({ name, className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  )
}
