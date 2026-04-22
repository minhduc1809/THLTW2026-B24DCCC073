import useDebounceValue from '@/hooks/useDebounceValue';
import { listBlogTags, queryPublishedPosts, type BlogPostWithTags, type BlogTag } from '@/services/blog';
import { CalendarOutlined, EyeOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Input, Pagination, Row, Space, Tag, Typography } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { history } from 'umi';

const PAGE_SIZE = 9;

const BlogHomePage = () => {
	const [posts, setPosts] = useState<BlogPostWithTags[]>([]);
	const [tags, setTags] = useState<BlogTag[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [page, setPage] = useState<number>(1);
	const [keyword, setKeyword] = useState<string>('');
	const [activeTagSlug, setActiveTagSlug] = useState<string | undefined>();
	const [loading, setLoading] = useState<boolean>(false);

	const debouncedKeyword = useDebounceValue(keyword, 300);

	const loadPosts = (targetPage: number = page) => {
		setLoading(true);

		try {
			const result = queryPublishedPosts({
				page: targetPage,
				pageSize: PAGE_SIZE,
				keyword: debouncedKeyword,
				tagSlug: activeTagSlug,
			});

			setPosts(result.data);
			setTotal(result.total);
			setTags(listBlogTags());
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setPage(1);
	}, [debouncedKeyword, activeTagSlug]);

	useEffect(() => {
		loadPosts(page);
	}, [page, debouncedKeyword, activeTagSlug]);

	return (
		<div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					gap: 16,
					flexWrap: 'wrap',
					marginBottom: 16,
				}}
			>
				<div>
					<Typography.Title level={2} style={{ marginBottom: 0 }}>
						Blog cá nhân
					</Typography.Title>
					<Typography.Paragraph style={{ marginBottom: 0, maxWidth: 720 }}>
						Nơi chia sẻ kinh nghiệm làm việc, viết code và phát triển sự nghiệp frontend.
					</Typography.Paragraph>
				</div>

				<Space>
					<Button onClick={() => history.push('/blog/about')}>Giới thiệu</Button>
					<Button type='primary' onClick={() => history.push('/blog/admin/posts')}>
						Quản lý bài viết
					</Button>
					<Button onClick={() => history.push('/blog/admin/tags')}>Quản lý thẻ</Button>
				</Space>
			</div>

			<Card style={{ marginBottom: 16 }}>
				<Row gutter={[16, 16]} align='middle'>
					<Col xs={24} lg={10}>
						<Input
							allowClear
							placeholder='Tìm theo tiêu đề, nội dung, tác giả...'
							prefix={<SearchOutlined />}
							value={keyword}
							onChange={(event) => setKeyword(event.target.value)}
						/>
					</Col>
					<Col xs={24} lg={14}>
						<Space size={[8, 8]} wrap>
							<Tag
								color={!activeTagSlug ? 'blue' : 'default'}
								style={{ cursor: 'pointer', userSelect: 'none' }}
								onClick={() => setActiveTagSlug(undefined)}
							>
								Tất cả
							</Tag>
							{tags.map((tag) => (
								<Tag
									key={tag.id}
									color={activeTagSlug === tag.slug ? 'blue' : 'default'}
									style={{ cursor: 'pointer', userSelect: 'none' }}
									onClick={() => setActiveTagSlug(tag.slug)}
								>
									{tag.name}
								</Tag>
							))}
						</Space>
					</Col>
				</Row>
			</Card>

			{posts.length === 0 ? (
				<Card>
					<Empty description='Không có bài viết phù hợp với điều kiện tìm kiếm' />
				</Card>
			) : (
				<>
					<Row gutter={[16, 16]}>
						{posts.map((post) => (
							<Col key={post.id} xs={24} md={12} xl={8}>
								<Card
									hoverable
									loading={loading}
									cover={<img alt={post.title} src={post.thumbnail} style={{ height: 200, width: '100%', objectFit: 'cover' }} />}
									onClick={() => history.push(`/blog/${post.slug}`)}
								>
									<Typography.Title
										level={4}
										style={{
											marginBottom: 8,
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical',
											overflow: 'hidden',
										}}
									>
										{post.title}
									</Typography.Title>
									<Typography.Paragraph style={{ marginBottom: 12, minHeight: 66 }} ellipsis={{ rows: 3 }}>
										{post.summary}
									</Typography.Paragraph>
									<Space size={[6, 6]} wrap style={{ marginBottom: 12 }}>
										{post.tags.map((tag) => (
											<Tag
												key={tag.id}
												color={activeTagSlug === tag.slug ? 'blue' : 'default'}
												onClick={(event) => {
													event.stopPropagation();
													setActiveTagSlug(tag.slug);
												}}
											>
												{tag.name}
											</Tag>
										))}
									</Space>
									<div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'rgba(0,0,0,0.65)' }}>
										<span>
											<UserOutlined /> {post.authorName}
										</span>
										<span>
											<CalendarOutlined /> {moment(post.createdAt).format('DD/MM/YYYY')}
										</span>
										<span>
											<EyeOutlined /> {post.views}
										</span>
									</div>
								</Card>
							</Col>
						))}
					</Row>

					<div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
						<Pagination
							current={page}
							pageSize={PAGE_SIZE}
							total={total}
							showSizeChanger={false}
							onChange={(nextPage) => setPage(nextPage)}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default BlogHomePage;
