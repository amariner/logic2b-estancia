import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
export default defineConfig({ site: 'https://estancia.logic2b.com', trailingSlash: 'always', integrations: [react()] });
