import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import rules from '@/utils/rules';

const BieuMau: React.FC = () => {
	const [list, setList] = useState<any[]>([]);
	const [visible, setVisible] = useState(false);
	const [editingId, setEditingId] = useState<any>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		const data = localStorage.getItem('VB_BIEU_MAU');
		setList(data ? JSON.parse(data) : []);
	};

	useEffect(() => { loadData(); }, []);

	const onFinish = (values: any) => {
		const current = localStorage.getItem('VB_BIEU_MAU');
		const listArr = current ? JSON.parse(current) : [];
		
		const isDuplicate = listArr.some((i: any) => i.name.toLowerCase() === values.name.toLowerCase() && i.id !== editingId);
		if (isDuplicate) {
			form.setFields([{ name: 'name', errors: ['Tên trường thông tin này đã tồn tại'] }]);
			return;
		}

		if (editingId) {
			const index = listArr.findIndex((i: any) => i.id === editingId);
			listArr[index] = { ...values, id: editingId };
		} else {
			listArr.push({ ...values, id: crypto.randomUUID() });
		}
		localStorage.setItem('VB_BIEU_MAU', JSON.stringify(listArr));
		setVisible(false);
		loadData();
	};

	const showModal = (record?: any) => {
		if (record) { setEditingId(record.id); form.setFieldsValue(record); }
		else { setEditingId(null); form.resetFields(); }
		setVisible(true);
	};

	const columns = [
		{ title: 'Tên trường thông tin', dataIndex: 'name', key: 'name' },
		{ 
			title: 'Kiểu dữ liệu', 
			dataIndex: 'type', 
			key: 'type',
			render: (type: string) => {
				const colors: Record<string, string> = { String: 'blue', Number: 'green', Date: 'orange' };
				return <Tag color={colors[type] || 'default'}>{type}</Tag>;
			}
		},
		{
			title: 'Thao tác', key: 'action',
			render: (_: any, record: any) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => showModal(record)} />
					<Popconfirm title='Xóa?' onConfirm={() => {
						const current = localStorage.getItem('VB_BIEU_MAU');
						const listArr = current ? JSON.parse(current) : [];
						localStorage.setItem('VB_BIEU_MAU', JSON.stringify(listArr.filter((i: any) => i.id !== record.id)));
						loadData();
					}}><Button icon={<DeleteOutlined />} danger /></Popconfirm>
				</Space>
			),
		},
	];

	return (
		<Card title='Cấu hình biểu mẫu' extra={<Button type='primary' icon={<PlusOutlined />} onClick={() => showModal()}>Thêm trường</Button>}>
			<Table dataSource={list} columns={columns} rowKey='id' />
			<Modal 
				title={editingId ? 'Chỉnh sửa trường thông tin' : 'Thêm mới trường thông tin'} 
				visible={visible} 
				onCancel={() => setVisible(false)} 
				onOk={() => form.submit()}
			>
				<Form form={form} layout='vertical' onFinish={onFinish}>
					<Form.Item name='name' label='Tên trường thông tin' rules={rules.required}><Input /></Form.Item>
					<Form.Item name='type' label='Kiểu dữ liệu' rules={rules.required}>
						<Select>
							<Select.Option value='String'>String</Select.Option>
							<Select.Option value='Number'>Number</Select.Option>
							<Select.Option value='Date'>Date</Select.Option>
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default BieuMau;
