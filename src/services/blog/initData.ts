import type { BlogAuthorProfile, BlogPost, BlogStore, BlogTag } from './typing';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const SHARED_IMAGE =
	'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80';

const createDate = (daysAgo: number): string => new Date(Date.now() - daysAgo * DAY_IN_MS).toISOString();

const author: BlogAuthorProfile = {
	name: 'Nguyen Van A',
	avatar: SHARED_IMAGE,
	bio: 'Frontend developer writing short practical notes.',
	skills: ['React', 'TypeScript', 'Ant Design'],
	socials: [
		{ label: 'GitHub', url: 'https://github.com' },
		{ label: 'LinkedIn', url: 'https://linkedin.com' },
		{ label: 'Facebook', url: 'https://facebook.com' },
	],
};

const tags: BlogTag[] = [
	{ id: 'tag-react', name: 'React', slug: 'react', createdAt: createDate(10) },
	{ id: 'tag-typescript', name: 'TypeScript', slug: 'typescript', createdAt: createDate(9) },
	{ id: 'tag-career', name: 'Career', slug: 'career', createdAt: createDate(8) },
];

const posts: BlogPost[] = [
	{
		id: 'post-1',
		title: 'React tips for cleaner components',
		slug: 'react-tips-for-cleaner-components',
		summary: '3 quick tips to keep React components easier to read and maintain.',
		content: '# React tips\n\n- Keep components small.\n- Reuse hooks.\n- Keep props explicit.',
		thumbnail: SHARED_IMAGE,
		tagIds: ['tag-react'],
		status: 'published',
		views: 12,
		authorName: author.name,
		createdAt: createDate(3),
		updatedAt: createDate(3),
	},
	{
		id: 'post-2',
		title: 'TypeScript habits that save debugging time',
		slug: 'typescript-habits-that-save-debugging-time',
		summary: 'Use strict types early to reduce runtime issues later.',
		content: '# TypeScript habits\n\nUse union types and avoid `any` in shared modules.',
		thumbnail: SHARED_IMAGE,
		tagIds: ['tag-typescript'],
		status: 'published',
		views: 7,
		authorName: author.name,
		createdAt: createDate(2),
		updatedAt: createDate(2),
	},
	{
		id: 'post-3',
		title: 'Draft: planning frontend career growth',
		slug: 'draft-planning-frontend-career-growth',
		summary: 'A short draft checklist for improving impact and communication.',
		content: '# Draft career checklist\n\n- Improve ownership.\n- Write better docs.\n- Mentor teammates.',
		thumbnail: SHARED_IMAGE,
		tagIds: ['tag-career'],
		status: 'draft',
		views: 0,
		authorName: author.name,
		createdAt: createDate(1),
		updatedAt: createDate(1),
	},
];

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const createInitialBlogStore = (): BlogStore =>
	clone({
		author,
		tags,
		posts,
	});

