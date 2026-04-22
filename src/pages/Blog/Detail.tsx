import { getBlogAuthor, increasePostViews, listRelatedPosts, type BlogPostWithTags } from '@/services/blog';
import { ArrowLeftOutlined, CalendarOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Skeleton, Space, Tag, Typography } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { history, useParams } from 'umi';

const BlogDetailPage = () => {
	const { slug } = useParams<{ slug: string }>();
	const [post, setPost] = useState<BlogPostWithTags>();
	const [relatedPosts, setRelatedPosts] = useState<BlogPostWithTags[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	const author = getBlogAuthor();

	useEffect(() => {
		if (!slug) {
			setLoading(false);
			return;
		}

		setLoading(true);
		const visitedPost = increasePostViews(slug);
		setPost(visitedPost);
		setRelatedPosts(visitedPost ? listRelatedPosts(visitedPost.id, 3) : []);
		setLoading(false);
	}, [slug]);

	if (loading) {
		return <Skeleton active paragraph={{ rows: 8 }} />;
	}

	if (!post) {
		return (
			<Card>
				<Space direction='vertical' size={16} style={{ width: '100%' }}>
					<Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/blog')}>
						Quay lại danh sách
					</Button>
					<Empty description='Không tìm thấy bài viết' />
				</Space>
			</Card>
		);
	}

	return (
		<div>
			<Button icon={<ArrowLeftOutlined />} onClick={() => history.push('/blog')} style={{ marginBottom: 16 }}>
				Quay lại danh sách
			</Button>

			<Card style={{ marginBottom: 16 }}>
				<Row gutter={[24, 24]}>
					<Col xs={24} lg={14}>
						<img
							src={post.thumbnail}
							alt={post.title}
							style={{ height: 320, width: '100%', objectFit: 'cover', borderRadius: 8 }}
						/>
					</Col>
					<Col xs={24} lg={10}>
						<Typography.Title level={2}>{post.title}</Typography.Title>
						<Space direction='vertical' size={8}>
							<span>
								<UserOutlined /> {post.authorName}
							</span>
							<span>
								<CalendarOutlined /> {moment(post.createdAt).format('DD/MM/YYYY HH:mm')}
							</span>
							<span>
								<EyeOutlined /> {post.views} lượt xem
							</span>
						</Space>
						<div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
							{post.tags.map((tag) => (
								<Tag key={tag.id}>{tag.name}</Tag>
							))}
						</div>
					</Col>
				</Row>
			</Card>

			<Card style={{ marginBottom: 16 }}>
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						gap: 12,
						paddingBottom: 16,
						marginBottom: 16,
						borderBottom: '1px solid #f0f0f0',
					}}
				>
					<img
						src={author.avatar}
						alt={author.name}
						style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
					/>
					<div>
						<Typography.Text strong>{author.name}</Typography.Text>
						<Typography.Paragraph>{author.bio}</Typography.Paragraph>
					</div>
				</div>
				<div style={{ lineHeight: 1.8, fontSize: 15 }}>
					<ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
				</div>
			</Card>

			<Card title='Bài viết liên quan'>
				{relatedPosts.length === 0 ? (
					<Empty description='Chưa có bài viết liên quan' />
				) : (
					<Row gutter={[16, 16]}>
						{relatedPosts.map((item) => (
							<Col key={item.id} xs={24} md={12} lg={8}>
								<Card hoverable onClick={() => history.push(`/blog/${item.slug}`)}>
									<Typography.Title level={5}>{item.title}</Typography.Title>
									<Typography.Paragraph ellipsis={{ rows: 2 }}>{item.summary}</Typography.Paragraph>
									<Typography.Text type='secondary'>
										{moment(item.createdAt).format('DD/MM/YYYY')}
									</Typography.Text>
								</Card>
							</Col>
						))}
					</Row>
				)}
			</Card>
		</div>
	);
};

export default BlogDetailPage;
