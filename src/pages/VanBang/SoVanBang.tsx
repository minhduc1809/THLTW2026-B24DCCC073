import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, InputNumber, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import rules from '@/utils/rules';

const SoVanBang: React.FC = () => {
	const [list, setList] = useState<any[]>([]);
	const [visible, setVisible] = useState(false);
	const [form] = Form.useForm();
	const [editingId, setEditingId] = useState<any>(null);

	const loadData = () => {
		const data = localStorage.getItem('VB_SO_VAN_BANG');
		setList(data ? JSON.parse(data) : []);
	};

	useEffect(() => { loadData(); }, []);

	const onFinish = (values: any) => {
		const current = localStorage.getItem('VB_SO_VAN_BANG');
		const listArr = current ? JSON.parse(current) : [];
		
		const isDuplicate = listArr.some((i: any) => i.nam === values.nam && i.id !== editingId);
		if (isDuplicate) {
			form.setFields([{ name: 'nam', errors: ['Năm này đã có sổ văn bằng'] }]);
			return;
		}

		if (editingId) {
			const index = listArr.findIndex((i: any) => i.id === editingId);
			listArr[index] = { ...values, id: editingId, soVaoSoHienTai: listArr[index].soVaoSoHienTai };
		} else {
			listArr.push({ ...values, id: crypto.randomUUID(), soVaoSoHienTai: 0 });
		}
		localStorage.setItem('VB_SO_VAN_BANG', JSON.stringify(listArr));
		setVisible(false);
		loadData();
	};

	const showModal = (record?: any) => {
		if (record) { setEditingId(record.id); form.setFieldsValue(record); }
		else { setEditingId(null); form.resetFields(); }
		setVisible(true);
	};

	const handleDelete = (id: any) => {
		const qdData = localStorage.getItem('VB_QUYET_DINH');
		const qdArr = qdData ? JSON.parse(qdData) : [];
		const hasQuyetDinh = qdArr.some((qd: any) => qd.soVanBangId === id);
		
		if (hasQuyetDinh) {
			message.error('Sổ văn bằng này đang có quyết định tốt nghiệp, không cho phép xóa!');
			return;
		}

		const current = localStorage.getItem('VB_SO_VAN_BANG');
		const listArr = current ? JSON.parse(current) : [];
		localStorage.setItem('VB_SO_VAN_BANG', JSON.stringify(listArr.filter((i: any) => i.id !== id)));
		loadData();
	};

	const columns = [
		{ title: 'Năm', dataIndex: 'nam', key: 'nam' },
		{ title: 'Tên sổ', dataIndex: 'tenSo', key: 'tenSo' },
		{ 
			title: 'Số vào sổ hiện tại', 
			dataIndex: 'soVaoSoHienTai', 
			key: 'soVaoSoHienTai',
			render: (val: number) => val === 0 ? <Tag color='default'>Chưa có</Tag> : <Tag color='green'>{val}</Tag>
		},
		{
			title: 'Thao tác', key: 'action',
			render: (_: any, record: any) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => showModal(record)} />
					<Popconfirm title='Xác nhận xóa?' onConfirm={() => handleDelete(record.id)}>
						<Button icon={<DeleteOutlined />} danger />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<Card title='Quản lý sổ văn bằng' extra={<Button type='primary' icon={<PlusOutlined />} onClick={() => showModal()}>Thêm mới</Button>}>
			<Table dataSource={list} columns={columns} rowKey='id' />
			<Modal title={editingId ? 'Sửa' : 'Thêm'} visible={visible} onCancel={() => setVisible(false)} onOk={() => form.submit()}>
				<Form form={form} layout='vertical' onFinish={onFinish}>
					<Form.Item name='nam' label='Năm' rules={rules.required}><InputNumber style={{ width: '100%' }} /></Form.Item>
					<Form.Item name='tenSo' label='Tên sổ' rules={rules.required}><Input /></Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default SoVanBang;
