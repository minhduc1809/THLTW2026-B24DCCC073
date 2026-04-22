import {
	BLOG_STATUS_OPTIONS,
	createBlogPost,
	deleteBlogPost,
	listBlogTags,
	queryAdminPosts,
	slugify,
	updateBlogPost,
	type BlogPostStatus,
	type BlogPostWithTags,
	type BlogTag,
} from '@/services/blog';
import rules from '@/utils/rules';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

interface PostFormValues {
	title: string;
	slug: string;
	content: string;
	thumbnail: string;
	tagIds: string[];
	status: BlogPostStatus;
}

const STATUS_TEXT: Record<BlogPostStatus, string> = {
	draft: 'Nháp',
	published: 'Đã đăng',
};

const STATUS_COLOR: Record<BlogPostStatus, string> = {
	draft: 'orange',
	published: 'green',
};

const BlogAdminPostsPage = () => {
	const [posts, setPosts] = useState<BlogPostWithTags[]>([]);
	const [tags, setTags] = useState<BlogTag[]>([]);
	const [keyword, setKeyword] = useState<string>('');
	const [statusFilter, setStatusFilter] = useState<BlogPostStatus | 'all'>('all');
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [editingPostId, setEditingPostId] = useState<string>();
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [slugTouched, setSlugTouched] = useState<boolean>(false);

	const [form] = Form.useForm<PostFormValues>();

	const editingPost = useMemo(
		() => posts.find((post) => post.id === editingPostId),
		[posts, editingPostId],
	);

	const reloadData = () => {
		setPosts(queryAdminPosts({ keyword, status: statusFilter }));
		setTags(listBlogTags());
	};

	useEffect(() => {
		reloadData();
	}, [keyword, statusFilter]);

	const openCreateModal = () => {
		setEditingPostId(undefined);
		setSlugTouched(false);
		form.resetFields();
		form.setFieldsValue({ status: 'draft', tagIds: [] });
		setModalOpen(true);
	};

	const openEditModal = (post: BlogPostWithTags) => {
		setEditingPostId(post.id);
		setSlugTouched(true);
		form.setFieldsValue({
			title: post.title,
			slug: post.slug,
			content: post.content,
			thumbnail: post.thumbnail,
			tagIds: post.tagIds,
			status: post.status,
		});
		setModalOpen(true);
	};

	const handleDelete = (postId: string) => {
		deleteBlogPost(postId);
		message.success('Xóa bài viết thành công');
		reloadData();
	};

	const handleSubmit = async (values: PostFormValues) => {
		setSubmitting(true);
		try {
			if (editingPostId) {
				updateBlogPost(editingPostId, values);
				message.success('Cập nhật bài viết thành công');
			} else {
				createBlogPost(values);
				message.success('Thêm bài viết thành công');
			}
			setModalOpen(false);
			form.resetFields();
			reloadData();
		} catch (error) {
			message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
		} finally {
			setSubmitting(false);
		}
	};

	const columns: ColumnsType<BlogPostWithTags> = [
		{
			title: 'Tiêu đề',
			dataIndex: 'title',
			key: 'title',
			render: (_, record) => (
				<div>
					<Typography.Text strong>{record.title}</Typography.Text>
					<div>
						<Typography.Text type='secondary'>{record.slug}</Typography.Text>
					</div>
				</div>
			),
		},
		{
			title: 'Trạng thái',
			dataIndex: 'status',
			key: 'status',
			render: (status: BlogPostStatus) => <Tag color={STATUS_COLOR[status]}>{STATUS_TEXT[status]}</Tag>,
		},
		{
			title: 'Thẻ',
			dataIndex: 'tags',
			key: 'tags',
			render: (_, record) => (
				<Space size={[6, 6]} wrap>
					{record.tags.map((tag) => (
						<Tag key={tag.id}>{tag.name}</Tag>
					))}
				</Space>
			),
		},
		{
			title: 'Lượt xem',
			dataIndex: 'views',
			key: 'views',
			width: 110,
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createdAt',
			key: 'createdAt',
			width: 170,
			render: (value: string) => moment(value).format('DD/MM/YYYY HH:mm'),
		},
		{
			title: 'Thao tác',
			key: 'actions',
			width: 170,
			render: (_, record) => (
				<Space>
					<Button type='link' onClick={() => openEditModal(record)}>
						Sửa
					</Button>
					<Popconfirm
						title='Bạn có chắc chắn muốn xóa bài viết này?'
						onConfirm={() => handleDelete(record.id)}
						okText='Xóa'
						cancelText='Hủy'
					>
						<Button type='link' danger>
							Xóa
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<Card>
				<Space direction='vertical' size={16} style={{ width: '100%' }}>
					<Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
						<Space wrap>
							<Input
								allowClear
								placeholder='Tìm theo tiêu đề'
								style={{ width: 260 }}
								value={keyword}
								onChange={(event) => setKeyword(event.target.value)}
							/>
							<Select
								style={{ width: 180 }}
								value={statusFilter}
								onChange={(value: BlogPostStatus | 'all') => setStatusFilter(value)}
								options={[
									{ label: 'Tất cả trạng thái', value: 'all' },
									...BLOG_STATUS_OPTIONS.map((item) => ({
										label: item.label,
										value: item.value,
									})),
								]}
							/>
						</Space>

						<Space>
							<Button type='primary' icon={<PlusOutlined />} onClick={openCreateModal}>
								Thêm bài viết
							</Button>
						</Space>
					</Space>

					<Table rowKey='id' columns={columns} dataSource={posts} pagination={{ pageSize: 10 }} />
				</Space>
			</Card>

			<Modal
				visible={modalOpen}
				title={editingPost ? 'Cập nhật bài viết' : 'Thêm bài viết'}
				onCancel={() => setModalOpen(false)}
				onOk={() => form.submit()}
				confirmLoading={submitting}
				width={820}
				destroyOnClose
			>
				<Form<PostFormValues> form={form} layout='vertical' onFinish={handleSubmit}>
					<Form.Item name='title' label='Tiêu đề' rules={[...rules.required, ...rules.length(180)]}>
						<Input
							placeholder='Nhập tiêu đề bài viết'
							onChange={(event) => {
								if (!slugTouched) {
									form.setFieldsValue({ slug: slugify(event.target.value) });
								}
							}}
						/>
					</Form.Item>

					<Form.Item
						name='slug'
						label='Slug'
						rules={[
							...rules.required,
							{
								pattern: new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$'),
								message: 'Slug chỉ gồm chữ thường, số và dấu -',
							},
						]}
					>
						<Input
							placeholder='vi-du-bai-viet-cua-toi'
							onChange={() => {
								setSlugTouched(true);
							}}
						/>
					</Form.Item>

					<Form.Item name='thumbnail' label='Ảnh đại diện (URL)' rules={[...rules.required, ...rules.httpLink]}>
						<Input placeholder='https://example.com/thumbnail.png' />
					</Form.Item>

					<Form.Item
						name='tagIds'
						label='Thẻ'
						rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 thẻ' }]}
					>
						<Select
							mode='multiple'
							placeholder='Chọn thẻ cho bài viết'
							options={tags.map((tag) => ({
								label: tag.name,
								value: tag.id,
							}))}
						/>
					</Form.Item>

					<Form.Item name='status' label='Trạng thái' rules={[...rules.required]}>
						<Select
							options={BLOG_STATUS_OPTIONS.map((item) => ({
								label: item.label,
								value: item.value,
							}))}
						/>
					</Form.Item>

					<Form.Item name='content' label='Nội dung (Markdown)' rules={[...rules.required]}>
						<Input.TextArea rows={10} placeholder='Nhập nội dung markdown cho bài viết' />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default BlogAdminPostsPage;
