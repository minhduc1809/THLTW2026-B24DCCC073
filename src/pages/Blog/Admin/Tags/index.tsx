import {
	createBlogTag,
	deleteBlogTag,
	listBlogTagsWithUsage,
	slugify,
	updateBlogTag,
	type BlogTagWithUsage,
} from '@/services/blog';
import rules from '@/utils/rules';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal, Popconfirm, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMemo, useState } from 'react';

interface TagFormValues {
	name: string;
	slug: string;
}

const BlogAdminTagsPage = () => {
	const [tags, setTags] = useState<BlogTagWithUsage[]>(listBlogTagsWithUsage());
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [editingTagId, setEditingTagId] = useState<string>();
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [slugTouched, setSlugTouched] = useState<boolean>(false);
	const [form] = Form.useForm<TagFormValues>();

	const editingTag = useMemo(() => tags.find((tag) => tag.id === editingTagId), [tags, editingTagId]);

	const reloadTags = () => {
		setTags(listBlogTagsWithUsage());
	};

	const openCreateModal = () => {
		setEditingTagId(undefined);
		setSlugTouched(false);
		form.resetFields();
		setModalOpen(true);
	};

	const openEditModal = (tag: BlogTagWithUsage) => {
		setEditingTagId(tag.id);
		setSlugTouched(true);
		form.setFieldsValue({
			name: tag.name,
			slug: tag.slug,
		});
		setModalOpen(true);
	};

	const handleDelete = (tagId: string) => {
		deleteBlogTag(tagId);
		message.success('Xóa thẻ thành công');
		reloadTags();
	};

	const handleSubmit = async (values: TagFormValues) => {
		setSubmitting(true);
		try {
			if (editingTagId) {
				updateBlogTag(editingTagId, values);
				message.success('Cập nhật thẻ thành công');
			} else {
				createBlogTag(values);
				message.success('Thêm thẻ thành công');
			}
			setModalOpen(false);
			form.resetFields();
			reloadTags();
		} catch (error) {
			message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
		} finally {
			setSubmitting(false);
		}
	};

	const columns: ColumnsType<BlogTagWithUsage> = [
		{
			title: 'Tên thẻ',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Slug',
			dataIndex: 'slug',
			key: 'slug',
		},
		{
			title: 'Số bài viết sử dụng',
			dataIndex: 'postCount',
			key: 'postCount',
			width: 180,
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
						title='Bạn có chắc chắn muốn xóa thẻ này?'
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
				<div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
					<Button type='primary' icon={<PlusOutlined />} onClick={openCreateModal}>
						Thêm thẻ
					</Button>
				</div>

				<Table rowKey='id' columns={columns} dataSource={tags} pagination={{ pageSize: 10 }} />
			</Card>

			<Modal
				visible={modalOpen}
				title={editingTag ? 'Cập nhật thẻ' : 'Thêm thẻ'}
				onCancel={() => setModalOpen(false)}
				onOk={() => form.submit()}
				confirmLoading={submitting}
				destroyOnClose
			>
				<Form<TagFormValues> form={form} layout='vertical' onFinish={handleSubmit}>
					<Form.Item name='name' label='Tên thẻ' rules={[...rules.required, ...rules.length(60)]}>
						<Input
							placeholder='Nhập tên thẻ'
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
							placeholder='frontend'
							onChange={() => {
								setSlugTouched(true);
							}}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default BlogAdminTagsPage;
