// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Published to GitHub Pages under the repository name, so every internal link
// is prefixed with `base`. Changing the repo name means changing this line.
export default defineConfig({
	site: 'https://ayhid.github.io',
	base: '/dev-workflow-documentation',
	integrations: [
		starlight({
			title: 'claude-dev-workflow',
			description:
				'Ticket-driven development with Claude Code against YouTrack or GitHub Issues.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/ayhid/claude-dev-workflow' },
			],
			editLink: {
				baseUrl: 'https://github.com/ayhid/dev-workflow-documentation/edit/main/',
			},
			sidebar: [
				{ label: 'Quick start', slug: 'quick-start' },
				{ label: 'Use cases', items: [{ autogenerate: { directory: 'use-cases' } }] },
				{ label: 'Recipes', items: [{ autogenerate: { directory: 'recipes' } }] },
				{ label: 'Reference', items: [{ autogenerate: { directory: 'reference' } }] },
			],
		}),
	],
});
