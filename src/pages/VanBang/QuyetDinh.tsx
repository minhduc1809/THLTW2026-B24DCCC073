import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import rules from '@/utils/rules';
import moment from 'moment';

const QuyetDinh: React.FC = () => {
	const [list, setList] = useState<any[]>([]);
	const [soList, setSoList] = useState<any[]>([]);
	const [searchCounts, setSearchCounts] = useState<any>({});
	const [visible, setVisible] = useState(false);
	const [editingId, setEditingId] = useState<any>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		const qd = localStorage.getItem('VB_QUYET_DINH');
		const so = localStorage.getItem('VB_SO_VAN_BANG');
		const hs = localStorage.getItem('VB_TRA_CUU_HISTORY');
		setList(qd ? JSON.parse(qd) : []);
		setSoList(so ? JSON.parse(so) : []);
		setSearchCounts(hs ? JSON.parse(hs) : {});
	};

	useEffect(() => { loadData(); }, []);

	const onFinish = (values: any) => {
		const current = localStorage.getItem('VB_QUYET_DINH');
		const listArr = current ? JSON.parse(current) : [];
		
		const isDuplicate = listArr.some((i: any) => i.soQD.toLowerCase() === values.soQD.toLowerCase() && i.id !== editingId);
		if (isDuplicate) {
			form.setFields([{ name: 'soQD', errors: ['Số quyết định này đã tồn tại'] }]);
			return;
		}

		const data = { ...values, id: editingId, ngayBanHanh: values.ngayBanHanh.format('YYYY-MM-DD') };
		if (editingId) {
			const index = listArr.findIndex((i: any) => i.id === editingId);
			listArr[index] = data;
		} else {
			data.id = crypto.randomUUID();
			listArr.push(data);
		}
		localStorage.setItem('VB_QUYET_DINH', JSON.stringify(listArr));
		setVisible(false);
		loadData();
	};

	const showModal = (record?: any) => {
		if (record) { setEditingId(record.id); form.setFieldsValue({ ...record, ngayBanHanh: moment(record.ngayBanHanh) }); }
		else { setEditingId(null); form.resetFields(); }
		setVisible(true);
	};

	const columns = [
		{ title: 'Số QĐ', dataIndex: 'soQD', key: 'soQD' },
		{ title: 'Ngày ban hành', dataIndex: 'ngayBanHanh', key: 'ngayBanHanh' },
		{ title: 'Trích yếu', dataIndex: 'trichYeu', key: 'trichYeu' },
		{
			title: 'Sổ văn bằng', dataIndex: 'soVanBangId', key: 'soVanBangId',
			render: (id: any) => soList.find((s: any) => s.id === id)?.tenSo || 'N/A',
		},
		{
			title: 'Lượt tra cứu',
			dataIndex: 'id',
			key: 'searchCount',
			render: (id: string) => <Tag color='blue'>{searchCounts[id] || 0}</Tag>
		},
		{
			title: 'Thao tác', key: 'action',
			render: (_: any, record: any) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => showModal(record)} />
					<Popconfirm 
						title='Xóa?' 
						onConfirm={() => {
							const vbData = localStorage.getItem('VB_THONG_TIN');
							const vbArr = vbData ? JSON.parse(vbData) : [];
							const hasVB = vbArr.some((vb: any) => vb.quyetDinhId === record.id);
							if (hasVB) {
								message.error('Quyết định này đang có văn bằng, không cho phép xóa!');
								return;
							}
							const qd = localStorage.getItem('VB_QUYET_DINH');
							const listArr = qd ? JSON.parse(qd) : [];
							localStorage.setItem('VB_QUYET_DINH', JSON.stringify(listArr.filter((i: any) => i.id !== record.id)));
							loadData();
						}}>
						<Button icon={<DeleteOutlined />} danger />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<Card title='Quyết định tốt nghiệp' extra={<Button type='primary' icon={<PlusOutlined />} onClick={() => showModal()}>Thêm mới</Button>}>
			<Table dataSource={list} columns={columns} rowKey='id' />
			<Modal visible={visible} title={editingId ? 'Chỉnh sửa' : 'Thêm mới'} onCancel={() => setVisible(false)} onOk={() => form.submit()}>
				<Form form={form} layout='vertical' onFinish={onFinish}>
					<Form.Item name='soQD' label='Số QĐ' rules={rules.required}><Input /></Form.Item>
					<Form.Item name='ngayBanHanh' label='Ngày ban hành' rules={rules.required}><DatePicker style={{ width: '100%' }} /></Form.Item>
					<Form.Item name='trichYeu' label='Trích yếu' rules={rules.required}><Input.TextArea /></Form.Item>
					<Form.Item name='soVanBangId' label='Sổ văn bằng' rules={rules.required}>
						<Select>{soList.map((s: any) => <Select.Option key={s.id} value={s.id}>{s.tenSo}</Select.Option>)}</Select>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default QuyetDinh;
