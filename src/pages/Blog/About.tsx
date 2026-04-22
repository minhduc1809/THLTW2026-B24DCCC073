import { getBlogAuthor, updateBlogAuthor } from '@/services/blog';
import type { BlogAuthorProfile } from '@/services/blog/typing';
import rules from '@/utils/rules';
import { GithubOutlined, LinkOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Form, Input, message, Modal, Row, Space, Tag, Typography } from 'antd';
import { useState } from 'react';

interface AuthorFormValues {
	name: string;
	avatar: string;
	bio: string;
	skills: string;
	github: string;
	linkedin: string;
	facebook: string;
}

const BlogAboutPage = () => {
	const [author, setAuthor] = useState<BlogAuthorProfile>(getBlogAuthor());
	const [modalOpen, setModalOpen] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [form] = Form.useForm<AuthorFormValues>();

	const getSocialUrl = (label: string): string => author.socials.find((item) => item.label === label)?.url ?? '';

	const openEditModal = () => {
		form.setFieldsValue({
			name: author.name,
			avatar: author.avatar,
			bio: author.bio,
			skills: author.skills.join(', '),
			github: getSocialUrl('GitHub'),
			linkedin: getSocialUrl('LinkedIn'),
			facebook: getSocialUrl('Facebook'),
		});
		setModalOpen(true);
	};

	const parseSkills = (input: string): string[] =>
		input
			.split(/[\n,]/)
			.map((item) => item.trim())
			.filter(Boolean);

	const handleSubmit = async (values: AuthorFormValues) => {
		setSubmitting(true);
		try {
			const updated = updateBlogAuthor({
				name: values.name,
				avatar: values.avatar,
				bio: values.bio,
				skills: parseSkills(values.skills),
				socials: [
					{ label: 'GitHub', url: values.github || '' },
					{ label: 'LinkedIn', url: values.linkedin || '' },
					{ label: 'Facebook', url: values.facebook || '' },
				],
			});
			setAuthor(updated);
			setModalOpen(false);
			message.success('Cập nhật thông tin thành công');
		} catch (error) {
			message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Card>
				<Space direction='vertical' size={20} style={{ width: '100%' }}>
					<Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
						<Typography.Title level={3} style={{ marginBottom: 0 }}>
							Thông tin tác giả
						</Typography.Title>
						<Button type='primary' onClick={openEditModal}>
							Chỉnh sửa thông tin
						</Button>
					</Space>

					<Row gutter={[24, 24]} align='middle'>
						<Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'center' }}>
							<Avatar size={180} src={author.avatar} />
						</Col>
						<Col xs={24} md={16}>
							<Typography.Title level={2}>{author.name}</Typography.Title>
							<Typography.Paragraph>{author.bio}</Typography.Paragraph>

							<Typography.Title level={4}>Kỹ năng</Typography.Title>
							<Space wrap>
								{author.skills.map((skill) => (
									<Tag key={skill} color='blue'>
										{skill}
									</Tag>
								))}
							</Space>

							<Typography.Title level={4} style={{ marginTop: 20 }}>
								Mạng xã hội
							</Typography.Title>
							<Space wrap>
								{author.socials.map((social) => (
									<a key={social.label} href={social.url} target='_blank' rel='noreferrer'>
										<Button icon={social.label === 'GitHub' ? <GithubOutlined /> : <LinkOutlined />}>
											{social.label}
										</Button>
									</a>
								))}
							</Space>
						</Col>
					</Row>
				</Space>
			</Card>

			<Modal
				visible={modalOpen}
				title='Chỉnh sửa thông tin tác giả'
				onCancel={() => setModalOpen(false)}
				onOk={() => form.submit()}
				confirmLoading={submitting}
				width={760}
				destroyOnClose
			>
				<Form<AuthorFormValues> form={form} layout='vertical' onFinish={handleSubmit}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name='name' label='Tên tác giả' rules={[...rules.required, ...rules.length(120)]}>
								<Input placeholder='Nhập tên tác giả' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name='avatar' label='Ảnh đại diện (URL)' rules={[...rules.required, ...rules.httpLink]}>
								<Input placeholder='https://example.com/avatar.png' />
							</Form.Item>
						</Col>
					</Row>

					<Form.Item name='bio' label='Tiểu sử' rules={[...rules.required, ...rules.length(400)]}>
						<Input.TextArea rows={3} placeholder='Nhập tiểu sử ngắn của tác giả' />
					</Form.Item>

					<Form.Item
						name='skills'
						label='Kỹ năng'
						rules={[
							...rules.required,
							{
								validator: (_, value) => {
									const skills = parseSkills(value || '');
									if (!skills.length) {
										return Promise.reject(new Error('Vui lòng nhập ít nhất 1 kỹ năng'));
									}
									return Promise.resolve();
								},
							},
						]}
					>
						<Input.TextArea rows={2} placeholder='Ví dụ: React, TypeScript, Ant Design' />
					</Form.Item>

					<Row gutter={16}>
						<Col span={8}>
							<Form.Item name='github' label='GitHub URL'>
								<Input placeholder='https://github.com/...' />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name='linkedin' label='LinkedIn URL'>
								<Input placeholder='https://linkedin.com/in/...' />
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item name='facebook' label='Facebook URL'>
								<Input placeholder='https://facebook.com/...' />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>
		</>
	);
};

export default BlogAboutPage;
