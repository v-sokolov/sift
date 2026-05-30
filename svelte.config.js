import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// TypeScript in `<script lang="ts">` blocks; Svelte 5 runes are on by default.
export default {
  preprocess: vitePreprocess(),
};
