import { createInitialBlogStore } from './initData';
import type {
	AdminPostQuery,
	BlogAuthorProfile,
	BlogPost,
	BlogPostWithTags,
	BlogStore,
	BlogTag,
	BlogTagWithUsage,
	ListResult,
	PublicPostQuery,
	SaveAuthorPayload,
	SavePostPayload,
	SaveTagPayload,
} from './typing';

const STORAGE_KEY = 'personal-blog-store-v4';
const STORAGE_VERSION = '2026-04-22-seed3';

interface PersistedBlogStore extends BlogStore {
	__version?: string;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const getStorage = (): Storage | undefined => {
	if (typeof window === 'undefined') {
		return undefined;
	}

	return window.localStorage;
};

const normalizeText = (value: string): string =>
	value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/đ/g, 'd')
		.replace(/Đ/g, 'D')
		.toLowerCase()
		.trim();

export const slugify = (value: string): string =>
	normalizeText(value)
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');

const summarizeMarkdown = (content: string, maxLength = 180): string => {
	const plainText = content
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
		.replace(/[#>*_`~|-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

	if (plainText.length <= maxLength) {
		return plainText;
	}

	return `${plainText.slice(0, maxLength).trim()}...`;
};

const nowIso = (): string => new Date().toISOString();

const isValidStore = (candidate: Partial<PersistedBlogStore>): candidate is PersistedBlogStore =>
	Boolean(candidate?.author && Array.isArray(candidate.tags) && Array.isArray(candidate.posts));

const unwrapStore = (store: PersistedBlogStore): BlogStore => ({
	author: store.author,
	tags: store.tags,
	posts: store.posts,
});

const writeStore = (store: BlogStore): void => {
	const storage = getStorage();
	if (!storage) {
		return;
	}

	const persisted: PersistedBlogStore = {
		...store,
		__version: STORAGE_VERSION,
	};
	storage.setItem(STORAGE_KEY, JSON.stringify(persisted));
};

const createSeedStore = (): BlogStore => {
	const seed = createInitialBlogStore();
	writeStore(seed);
	return seed;
};

export const initBlogStore = (force = false): BlogStore => {
	const storage = getStorage();
	if (!storage) {
		return clone(createInitialBlogStore());
	}

	if (force) {
		return createSeedStore();
	}

	const raw = storage.getItem(STORAGE_KEY);
	if (!raw) {
		return createSeedStore();
	}

	try {
		const parsed = JSON.parse(raw) as Partial<PersistedBlogStore>;
		if (!isValidStore(parsed)) {
			return createSeedStore();
		}

		const store = unwrapStore(parsed as PersistedBlogStore);
		if (parsed.__version !== STORAGE_VERSION) {
			// Keep existing user data and only migrate metadata.
			writeStore(store);
		}

		return store;
	} catch {
		return createSeedStore();
	}
};

const readStore = (): BlogStore => initBlogStore(false);

const resolveTags = (tagIds: string[], tags: BlogTag[]): BlogTag[] => tags.filter((tag) => tagIds.includes(tag.id));

const withTags = (posts: BlogPost[], tags: BlogTag[]): BlogPostWithTags[] =>
	posts.map((post) => ({
		...post,
		tags: resolveTags(post.tagIds, tags),
	}));

const sortByCreatedDesc = (a: BlogPost, b: BlogPost): number => b.createdAt.localeCompare(a.createdAt);

const findTagIdBySlug = (tags: BlogTag[], slug?: string): string | undefined => {
	if (!slug) {
		return undefined;
	}
	return tags.find((tag) => tag.slug === slug)?.id;
};

const ensureSlugUnique = (posts: BlogPost[], slug: string, currentId?: string): void => {
	const normalizedSlug = slugify(slug);
	const exists = posts.some((post) => post.slug === normalizedSlug && post.id !== currentId);
	if (exists) {
		throw new Error('Slug đã tồn tại, vui lòng nhập slug khác.');
	}
};

const cleanTagIds = (tagIds: string[], tags: BlogTag[]): string[] => {
	const available = new Set(tags.map((tag) => tag.id));
	return Array.from(new Set(tagIds)).filter((id) => available.has(id));
};

export const getBlogAuthor = (): BlogAuthorProfile => readStore().author;

export const updateBlogAuthor = (payload: SaveAuthorPayload): BlogAuthorProfile => {
	const store = readStore();

	const normalizedSocials = payload.socials
		.map((social) => ({
			label: social.label.trim(),
			url: social.url.trim(),
		}))
		.filter((social) => social.label && social.url);

	const normalizedSkills = payload.skills.map((item) => item.trim()).filter(Boolean);
	if (!normalizedSkills.length) {
		throw new Error('Vui lòng nhập ít nhất 1 kỹ năng.');
	}

	const updatedAuthor: BlogAuthorProfile = {
		name: payload.name.trim(),
		avatar: payload.avatar.trim(),
		bio: payload.bio.trim(),
		skills: normalizedSkills,
		socials: normalizedSocials,
	};

	store.author = updatedAuthor;
	store.posts = store.posts.map((post) => ({
		...post,
		authorName: updatedAuthor.name,
		updatedAt: nowIso(),
	}));
	writeStore(store);

	return updatedAuthor;
};

export const listBlogTags = (): BlogTag[] => [...readStore().tags].sort((a, b) => a.name.localeCompare(b.name));

export const listBlogTagsWithUsage = (): BlogTagWithUsage[] => {
	const store = readStore();
	return store.tags
		.map((tag) => ({
			...tag,
			postCount: store.posts.filter((post) => post.tagIds.includes(tag.id)).length,
		}))
		.sort((a, b) => b.postCount - a.postCount || a.name.localeCompare(b.name));
};

export const queryPublishedPosts = ({ page, pageSize, keyword, tagSlug }: PublicPostQuery): ListResult<BlogPostWithTags> => {
	const store = readStore();
	const normalizedKeyword = normalizeText(keyword ?? '');
	const tagId = findTagIdBySlug(store.tags, tagSlug);
	const safePage = Math.max(page, 1);
	const safePageSize = Math.max(pageSize, 1);

	const filtered = store.posts
		.filter((post) => post.status === 'published')
		.filter((post) => (tagId ? post.tagIds.includes(tagId) : true))
		.filter((post) => {
			if (!normalizedKeyword) {
				return true;
			}

			const searchable = normalizeText(
				`${post.title} ${post.summary} ${post.content} ${post.authorName} ${resolveTags(post.tagIds, store.tags)
					.map((tag) => tag.name)
					.join(' ')}`,
			);

			return searchable.includes(normalizedKeyword);
		})
		.sort(sortByCreatedDesc);

	const start = (safePage - 1) * safePageSize;
	return {
		total: filtered.length,
		data: withTags(filtered.slice(start, start + safePageSize), store.tags),
	};
};

export const getPublishedPostBySlug = (slug: string): BlogPostWithTags | undefined => {
	const store = readStore();
	const post = store.posts.find((item) => item.slug === slug && item.status === 'published');
	if (!post) {
		return undefined;
	}

	return {
		...post,
		tags: resolveTags(post.tagIds, store.tags),
	};
};

export const increasePostViews = (slug: string): BlogPostWithTags | undefined => {
	const store = readStore();
	const index = store.posts.findIndex((post) => post.slug === slug && post.status === 'published');
	if (index < 0) {
		return undefined;
	}

	const updatedPost: BlogPost = {
		...store.posts[index],
		views: store.posts[index].views + 1,
		updatedAt: nowIso(),
	};

	store.posts[index] = updatedPost;
	writeStore(store);

	return {
		...updatedPost,
		tags: resolveTags(updatedPost.tagIds, store.tags),
	};
};

export const listRelatedPosts = (postId: string, limit = 3): BlogPostWithTags[] => {
	const store = readStore();
	const currentPost = store.posts.find((post) => post.id === postId);
	if (!currentPost) {
		return [];
	}

	const related = store.posts
		.filter((post) => post.status === 'published' && post.id !== postId)
		.filter((post) => post.tagIds.some((tagId) => currentPost.tagIds.includes(tagId)))
		.sort((a, b) => {
			const overlapA = a.tagIds.filter((tagId) => currentPost.tagIds.includes(tagId)).length;
			const overlapB = b.tagIds.filter((tagId) => currentPost.tagIds.includes(tagId)).length;
			if (overlapA !== overlapB) {
				return overlapB - overlapA;
			}
			return b.createdAt.localeCompare(a.createdAt);
		})
		.slice(0, limit);

	return withTags(related, store.tags);
};

export const queryAdminPosts = ({ keyword, status = 'all' }: AdminPostQuery): BlogPostWithTags[] => {
	const store = readStore();
	const normalizedKeyword = normalizeText(keyword ?? '');

	const filtered = store.posts
		.filter((post) => (status === 'all' ? true : post.status === status))
		.filter((post) => (normalizedKeyword ? normalizeText(post.title).includes(normalizedKeyword) : true))
		.sort(sortByCreatedDesc);

	return withTags(filtered, store.tags);
};

export const createBlogPost = (payload: SavePostPayload): BlogPostWithTags => {
	const store = readStore();
	const normalizedSlug = slugify(payload.slug || payload.title);
	if (!normalizedSlug) {
		throw new Error('Slug không hợp lệ.');
	}
	ensureSlugUnique(store.posts, normalizedSlug);

	const timestamp = nowIso();
	const cleanedTagIds = cleanTagIds(payload.tagIds, store.tags);
	const post: BlogPost = {
		id: `post-${Date.now()}`,
		title: payload.title.trim(),
		slug: normalizedSlug,
		summary: summarizeMarkdown(payload.content),
		content: payload.content.trim(),
		thumbnail: payload.thumbnail.trim(),
		tagIds: cleanedTagIds,
		status: payload.status,
		views: 0,
		authorName: store.author.name || 'Ẩn danh',
		createdAt: timestamp,
		updatedAt: timestamp,
	};

	store.posts = [post, ...store.posts];
	writeStore(store);

	return {
		...post,
		tags: resolveTags(post.tagIds, store.tags),
	};
};

export const updateBlogPost = (postId: string, payload: SavePostPayload): BlogPostWithTags => {
	const store = readStore();
	const index = store.posts.findIndex((post) => post.id === postId);
	if (index < 0) {
		throw new Error('Không tìm thấy bài viết.');
	}

	const normalizedSlug = slugify(payload.slug || payload.title);
	if (!normalizedSlug) {
		throw new Error('Slug không hợp lệ.');
	}
	ensureSlugUnique(store.posts, normalizedSlug, postId);

	const current = store.posts[index];
	const updated: BlogPost = {
		...current,
		title: payload.title.trim(),
		slug: normalizedSlug,
		summary: summarizeMarkdown(payload.content),
		content: payload.content.trim(),
		thumbnail: payload.thumbnail.trim(),
		tagIds: cleanTagIds(payload.tagIds, store.tags),
		status: payload.status,
		updatedAt: nowIso(),
	};

	store.posts[index] = updated;
	writeStore(store);

	return {
		...updated,
		tags: resolveTags(updated.tagIds, store.tags),
	};
};

export const deleteBlogPost = (postId: string): void => {
	const store = readStore();
	store.posts = store.posts.filter((post) => post.id !== postId);
	writeStore(store);
};

export const createBlogTag = (payload: SaveTagPayload): BlogTag => {
	const store = readStore();
	const normalizedSlug = slugify(payload.slug || payload.name);
	if (!normalizedSlug) {
		throw new Error('Slug thẻ không hợp lệ.');
	}
	const duplicated = store.tags.some((tag) => tag.slug === normalizedSlug);
	if (duplicated) {
		throw new Error('Thẻ đã tồn tại.');
	}

	const tag: BlogTag = {
		id: `tag-${Date.now()}`,
		name: payload.name.trim(),
		slug: normalizedSlug,
		createdAt: nowIso(),
	};

	store.tags = [tag, ...store.tags];
	writeStore(store);
	return tag;
};

export const updateBlogTag = (tagId: string, payload: SaveTagPayload): BlogTag => {
	const store = readStore();
	const index = store.tags.findIndex((tag) => tag.id === tagId);
	if (index < 0) {
		throw new Error('Không tìm thấy thẻ.');
	}

	const normalizedSlug = slugify(payload.slug || payload.name);
	if (!normalizedSlug) {
		throw new Error('Slug thẻ không hợp lệ.');
	}

	const duplicated = store.tags.some((tag) => tag.slug === normalizedSlug && tag.id !== tagId);
	if (duplicated) {
		throw new Error('Thẻ đã tồn tại.');
	}

	const updatedTag: BlogTag = {
		...store.tags[index],
		name: payload.name.trim(),
		slug: normalizedSlug,
	};

	store.tags[index] = updatedTag;
	writeStore(store);
	return updatedTag;
};

export const deleteBlogTag = (tagId: string): void => {
	const store = readStore();
	store.tags = store.tags.filter((tag) => tag.id !== tagId);
	store.posts = store.posts.map((post) => ({
		...post,
		tagIds: post.tagIds.filter((id) => id !== tagId),
		updatedAt: nowIso(),
	}));
	writeStore(store);
};

export const BLOG_STATUS_OPTIONS = [
	{ label: 'Nháp', value: 'draft' as const },
	{ label: 'Đã đăng', value: 'published' as const },
];

export type { BlogPostStatus, BlogPostWithTags, BlogTag, BlogTagWithUsage } from './typing';
