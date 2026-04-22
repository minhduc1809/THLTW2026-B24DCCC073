export type BlogPostStatus = 'draft' | 'published';

export interface BlogTag {
	id: string;
	name: string;
	slug: string;
	createdAt: string;
}

export interface BlogPost {
	id: string;
	title: string;
	slug: string;
	summary: string;
	content: string;
	thumbnail: string;
	tagIds: string[];
	status: BlogPostStatus;
	views: number;
	authorName: string;
	createdAt: string;
	updatedAt: string;
}

export interface BlogAuthorProfile {
	name: string;
	avatar: string;
	bio: string;
	skills: string[];
	socials: {
		label: string;
		url: string;
	}[];
}

export interface BlogStore {
	author: BlogAuthorProfile;
	tags: BlogTag[];
	posts: BlogPost[];
}

export interface BlogPostWithTags extends BlogPost {
	tags: BlogTag[];
}

export interface ListResult<T> {
	data: T[];
	total: number;
}

export interface PublicPostQuery {
	page: number;
	pageSize: number;
	keyword?: string;
	tagSlug?: string;
}

export interface AdminPostQuery {
	keyword?: string;
	status?: BlogPostStatus | 'all';
}

export interface SavePostPayload {
	title: string;
	slug: string;
	content: string;
	thumbnail: string;
	tagIds: string[];
	status: BlogPostStatus;
}

export interface SaveTagPayload {
	name: string;
	slug: string;
}

export interface SaveAuthorPayload {
	name: string;
	avatar: string;
	bio: string;
	skills: string[];
	socials: {
		label: string;
		url: string;
	}[];
}

export interface BlogTagWithUsage extends BlogTag {
	postCount: number;
}
