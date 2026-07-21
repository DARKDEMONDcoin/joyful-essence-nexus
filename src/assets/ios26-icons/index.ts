// Inline iOS Settings-style rounded tiles served as data URIs.

const svg = (bg: string, paths: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="${bg}"/><g transform="translate(4 4)" fill="#fff" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`,
  )}`;

export const IOS26_ICONS = {
  account: svg(
    '#8E8E93',
    '<circle cx="12" cy="8.2" r="4.1" stroke="none"/><path d="M4.7 21c.7-4.3 3.6-6.5 7.3-6.5s6.6 2.2 7.3 6.5" stroke="none"/>',
  ),
  billing: svg(
    '#34C759',
    '<rect x="3" y="6" width="18" height="12" rx="2.5" stroke="none"/><path d="M3 10h18" stroke="#34C759" stroke-width="2.2"/><circle cx="16.8" cy="14.8" r="1.25" stroke="none"/>',
  ),
  appearance: svg(
    '#5856D6',
    '<circle cx="12" cy="12" r="4.6" stroke="none"/><path d="M12 2.8v2.2M12 19v2.2M2.8 12h2.2M19 12h2.2M5.5 5.5l1.55 1.55M16.95 16.95l1.55 1.55M18.5 5.5l-1.55 1.55M7.05 16.95 5.5 18.5" fill="none" stroke="#fff" stroke-width="1.9"/>',
  ),
  personas: svg(
    '#FF9500',
    '<circle cx="9" cy="8.2" r="3.3" stroke="none"/><path d="M3.4 20c.6-3.8 2.8-5.8 5.8-5.8s5.2 2 5.8 5.8" stroke="none"/><circle cx="17.2" cy="8.8" r="2.6" opacity=".75" stroke="none"/><path d="M14.9 15.3c2.7.3 4.7 2 5.2 4.7" opacity=".75" stroke="none"/>',
  ),
  workspaces: svg(
    '#FF9F0A',
    '<rect x="4" y="4" width="7" height="7" rx="2" stroke="none"/><rect x="13" y="4" width="7" height="7" rx="2" stroke="none"/><rect x="4" y="13" width="7" height="7" rx="2" stroke="none"/><rect x="13" y="13" width="7" height="7" rx="2" stroke="none"/>',
  ),
  ai: svg(
    '#BF5AF2',
    '<path d="M12 3.6 13.9 9l5.5 1.9-5.5 1.9L12 20.4l-1.9-7.6-5.5-1.9L10.1 9 12 3.6Z" stroke="none"/><path d="M18.6 3.8 19.4 6l2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" opacity=".78" stroke="none"/>',
  ),
  skills: svg(
    '#FFCC00',
    '<path d="m18.6 4.1 1.3 1.3a1.5 1.5 0 0 1 0 2.1L8.2 19.2l-4.1.8.8-4.1L16.5 4.1a1.5 1.5 0 0 1 2.1 0Z" stroke="none"/><path d="M15.2 5.5 18.5 8.8" fill="none" stroke="#FFCC00" stroke-width="1.5"/>',
  ),
  memory: svg(
    '#AF52DE',
    '<path d="M12 4.5c-1.1-1-3-.8-4 .2-1 .9-1.2 2.1-.9 3.1-1.4.4-2.4 1.7-2.4 3.2 0 1.2.6 2.3 1.6 2.9-.2 2.1 1.4 3.9 3.5 3.9.9 0 1.7-.3 2.2-.9.6.6 1.4.9 2.3.9 2 0 3.6-1.8 3.4-3.9 1-.6 1.6-1.7 1.6-2.9 0-1.5-1-2.8-2.4-3.2.3-1-.1-2.2-1-3.1-1.1-1-2.9-1.2-4 .2Z" stroke="none"/><path d="M12 5.5v11" fill="none" stroke="#AF52DE" stroke-width="1.4" opacity=".45"/>',
  ),
  integrations: svg(
    '#007AFF',
    '<path d="M8 3.5v4M16 3.5v4M6.2 7.5h11.6v3.2a5.8 5.8 0 0 1-11.6 0V7.5Z" fill="none" stroke="#fff" stroke-width="2.1"/><path d="M12 16.5v4" fill="none" stroke="#fff" stroke-width="2.1"/>',
  ),
  language: svg(
    '#30B0C7',
    '<circle cx="12" cy="12" r="8.4" fill="none" stroke="#fff" stroke-width="2"/><path d="M3.8 12h16.4M12 3.8c2.6 2.8 2.6 13.6 0 16.4M12 3.8c-2.6 2.8-2.6 13.6 0 16.4" fill="none" stroke="#fff" stroke-width="1.6"/>',
  ),
  support: svg(
    '#FF3B30',
    '<path d="M12 3.7a8.3 8.3 0 1 0 0 16.6 8.3 8.3 0 0 0 0-16.6Zm0 5a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6Z" stroke="none" fill-rule="evenodd"/><path d="M6.2 6.2 9 9M15 15l2.8 2.8M17.8 6.2 15 9M9 15l-2.8 2.8" fill="none" stroke="#FF3B30" stroke-width="2.1"/>',
  ),
  faq: svg(
    '#64D2FF',
    '<path d="M5 5.5h14a2.5 2.5 0 0 1 2.5 2.5v7.2a2.5 2.5 0 0 1-2.5 2.5h-6.2L7.6 21v-3.3H5a2.5 2.5 0 0 1-2.5-2.5V8A2.5 2.5 0 0 1 5 5.5Z" stroke="none"/><path d="M9 10.2c.4-1.4 1.5-2.1 3.1-2.1 1.8 0 3 1 3 2.4 0 1.2-.8 1.9-1.8 2.5-.8.5-1.1.9-1.1 1.7M12.2 17h.1" fill="none" stroke="#64D2FF" stroke-width="1.7"/>',
  ),
  privacy: svg(
    '#5AC8FA',
    '<path d="M12 3.2 19 6v4.4c0 4.2-2.8 7.9-7 9-4.2-1.1-7-4.8-7-9V6l7-2.8Z" stroke="none"/><path d="m8.9 12.1 2 2 4.3-4.5" fill="none" stroke="#5AC8FA" stroke-width="1.8"/>',
  ),
  notifications: svg(
    '#FF9500',
    '<path d="M12 20a2.4 2.4 0 0 0 2.4-2.4H9.6A2.4 2.4 0 0 0 12 20Z" stroke="none"/><path d="M5.7 16.8h12.6c-1.2-1.4-1.6-2.7-1.6-5V9.4a4.7 4.7 0 0 0-9.4 0v2.4c0 2.3-.4 3.6-1.6 5Z" stroke="none"/>',
  ),
  status: svg(
    '#32D74B',
    '<path d="M3.2 12.5h3.4l2.3-6.7 3.5 12.2 2.5-5.5h5.9" fill="none" stroke="#fff" stroke-width="2.2"/>',
  ),
  gift: svg(
    '#FF2D55',
    '<path d="M4.2 10h15.6v10H4.2V10Z" stroke="none"/><path d="M3.5 7h17v4h-17V7Z" stroke="none"/><path d="M12 7v13M7.8 7c-1.4 0-2.3-.7-2.3-1.7S6.4 3.7 7.4 4c1.5.4 2.8 3 2.8 3H7.8Zm8.4 0c1.4 0 2.3-.7 2.3-1.7S17.6 3.7 16.6 4c-1.5.4-2.8 3-2.8 3h2.4Z" fill="none" stroke="#FF2D55" stroke-width="1.5"/>',
  ),
  switch: svg(
    '#8E8E93',
    '<path d="M5 8h12.5M14 4.5 17.5 8 14 11.5M19 16H6.5M10 12.5 6.5 16 10 19.5" fill="none" stroke="#fff" stroke-width="2.1"/>',
  ),
  sparkle: svg(
    '#BF5AF2',
    '<path d="M12 3.8 13.7 9l5.2 1.7-5.2 1.7L12 20.2l-1.7-7.8-5.2-1.7L10.3 9 12 3.8Z" stroke="none"/>',
  ),
  api: svg(
    '#007AFF',
    '<path d="M8.7 8.2 4.9 12l3.8 3.8M15.3 8.2l3.8 3.8-3.8 3.8M13.2 5.3l-2.4 13.4" fill="none" stroke="#fff" stroke-width="2.1"/>',
  ),
  logout: svg(
    '#FF453A',
    '<path d="M14 4.7h3.5a2 2 0 0 1 2 2v10.6a2 2 0 0 1-2 2H14" fill="none" stroke="#fff" stroke-width="2"/><path d="M10 16.7 5.3 12 10 7.3M5.5 12h10" fill="none" stroke="#fff" stroke-width="2.2"/>',
  ),
};
