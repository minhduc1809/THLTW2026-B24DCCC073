import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import rules from '@/utils/rules';
import moment from 'moment';

const ThongTinVanBang: React.FC = () => {
	const [list, setList] = useState<any[]>([]);
	const [qdList, setQdList] = useState<any[]>([]);
	const [bieuMau, setBieuMau] = useState<any[]>([]);
	const [visible, setVisible] = useState(false);
	const [editingId, setEditingId] = useState<any>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		const tt = localStorage.getItem('VB_THONG_TIN');
		const qd = localStorage.getItem('VB_QUYET_DINH');
		const bm = localStorage.getItem('VB_BIEU_MAU');
		setList(tt ? JSON.parse(tt) : []);
		setQdList(qd ? JSON.parse(qd) : []);
		setBieuMau(bm ? JSON.parse(bm) : []);
	};

	useEffect(() => { loadData(); }, []);

	const onFinish = (values: any) => {
		const current = localStorage.getItem('VB_THONG_TIN');
		const listArr = current ? JSON.parse(current) : [];
		
		const isDuplicate = listArr.some((i: any) => i.soHieu.toLowerCase() === values.soHieu.toLowerCase() && i.id !== editingId);
		if (isDuplicate) {
			form.setFields([{ name: 'soHieu', errors: ['Số hiệu văn bằng này đã tồn tại'] }]);
			return;
		}

		const formatted = { ...values, id: editingId };
		Object.keys(formatted).forEach((key) => {
			if (moment.isMoment(formatted[key])) formatted[key] = formatted[key].format('YYYY-MM-DD');
		});

		if (!editingId) {
			const qd = qdList.find((q: any) => q.id === values.quyetDinhId);
			if (qd) {
				const soStr = localStorage.getItem('VB_SO_VAN_BANG');
				const soList = soStr ? JSON.parse(soStr) : [];
				const idx = soList.findIndex((s: any) => s.id === qd.soVanBangId);
				if (idx !== -1) {
					soList[idx].soVaoSoHienTai += 1;
					formatted.soVaoSo = soList[idx].soVaoSoHienTai;
					localStorage.setItem('VB_SO_VAN_BANG', JSON.stringify(soList));
				}
			}
			formatted.id = crypto.randomUUID();
			listArr.push(formatted);
		} else {
			const index = listArr.findIndex((i: any) => i.id === editingId);
			formatted.soVaoSo = listArr[index].soVaoSo;
			listArr[index] = formatted;
		}
		localStorage.setItem('VB_THONG_TIN', JSON.stringify(listArr));
		setVisible(false);
		loadData();
	};

	const showModal = (record?: any) => {
		if (record) {
			setEditingId(record.id);
			const values = { ...record };
			Object.keys(values).forEach((key) => {
				const f = bieuMau.find((fm) => fm.name === key);
				if (f?.type === 'Date' || key === 'ngaySinh') values[key] = moment(values[key]);
			});
			form.setFieldsValue(values);
		} else { setEditingId(null); form.resetFields(); }
		setVisible(true);
	};

	const columns = [
		{ title: 'Số vào sổ', dataIndex: 'soVaoSo', key: 'soVaoSo' },
		{ title: 'Số hiệu', dataIndex: 'soHieu', key: 'soHieu' },
		{ title: 'MSV', dataIndex: 'msv', key: 'msv' },
		{ title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
		{
			title: 'Thao tác', key: 'action',
			render: (_: any, record: any) => (
				<Space>
					<Button icon={<EditOutlined />} onClick={() => showModal(record)} />
					<Popconfirm 
						title='Bạn có chắc chắn muốn xóa văn bằng này? Thao tác này có thể ảnh hưởng đến tính liên tục của số vào sổ.' 
						onConfirm={() => {
							const current = localStorage.getItem('VB_THONG_TIN');
							const listArr = current ? JSON.parse(current) : [];
							localStorage.setItem('VB_THONG_TIN', JSON.stringify(listArr.filter((i: any) => i.id !== record.id)));
							loadData();
						}}>
						<Button icon={<DeleteOutlined />} danger />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<Card title='Thông tin văn bằng' extra={<Button type='primary' icon={<PlusOutlined />} onClick={() => showModal()}>Thêm mới</Button>}>
			<Table dataSource={list} columns={columns} rowKey='id' />
			<Modal title={editingId ? 'Chỉnh sửa' : 'Thêm mới'} visible={visible} onCancel={() => setVisible(false)} onOk={() => form.submit()} width={800}>
				<Form form={form} layout='vertical' onFinish={onFinish}>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
						<Form.Item name='soVaoSo' label='Số vào sổ'><Input disabled placeholder='Tự động tăng' /></Form.Item>
						<Form.Item name='soHieu' label='Số hiệu' rules={rules.required}><Input /></Form.Item>
						<Form.Item name='msv' label='MSV' rules={rules.required}><Input /></Form.Item>
						<Form.Item name='hoTen' label='Họ tên' rules={rules.required}><Input /></Form.Item>
						<Form.Item name='ngaySinh' label='Ngày sinh' rules={rules.required}><DatePicker style={{ width: '100%' }} /></Form.Item>
						<Form.Item name='quyetDinhId' label='Quyết định' rules={rules.required}>
							<Select disabled={!!editingId}>{qdList.map((q: any) => <Select.Option key={q.id} value={q.id}>{q.soQD}</Select.Option>)}</Select>
						</Form.Item>
						{bieuMau.map((f) => (
							<Form.Item key={f.id} name={f.name} label={f.name}>
								{f.type === 'Number' ? <InputNumber style={{ width: '100%' }} /> : f.type === 'Date' ? <DatePicker style={{ width: '100%' }} /> : <Input />}
							</Form.Item>
						))}
					</div>
				</Form>
			</Modal>
		</Card>
	);
};

export default ThongTinVanBang;
