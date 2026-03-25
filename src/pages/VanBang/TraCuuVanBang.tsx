import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Table, DatePicker, message, Descriptions, Tag, Row, Col, Modal } from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';

const TraCuuVanBang: React.FC = () => {
	const [list, setList] = useState<any[]>([]);
	const [allDiplomas, setAllDiplomas] = useState<any[]>([]);
	const [qdList, setQdList] = useState<any[]>([]);
	const [bieuMau, setBieuMau] = useState<any[]>([]);
	const [searchCounts, setSearchCounts] = useState<any>({});
	const [selectedRecord, setSelectedRecord] = useState<any>(null);
	const [form] = Form.useForm();

	const loadData = () => {
		const tt = localStorage.getItem('VB_THONG_TIN');
		const qd = localStorage.getItem('VB_QUYET_DINH');
		const bm = localStorage.getItem('VB_BIEU_MAU');
		const hs = localStorage.getItem('VB_TRA_CUU_HISTORY');
		setAllDiplomas(tt ? JSON.parse(tt) : []);
		setQdList(qd ? JSON.parse(qd) : []);
		setBieuMau(bm ? JSON.parse(bm) : []);
		setSearchCounts(hs ? JSON.parse(hs) : {});
	};

	useEffect(() => { loadData(); }, []);

	const onSearch = (values: any) => {
		const filled = Object.keys(values).filter((k) => values[k] !== undefined && values[k] !== null && values[k] !== '');
		if (filled.length < 2) { 
			message.warning('Vui lòng nhập ít nhất 2 tham số để tra cứu'); 
			return; 
		}

		const filtered = allDiplomas.filter((item: any) => {
			let m = true;
			if (values.soHieu && !item.soHieu.toLowerCase().includes(values.soHieu.toLowerCase())) m = false;
			if (values.soVaoSo && item.soVaoSo.toString() !== values.soVaoSo.toString()) m = false;
			if (values.msv && !item.msv.toLowerCase().includes(values.msv.toLowerCase())) m = false;
			if (values.hoTen && !item.hoTen.toLowerCase().includes(values.hoTen.toLowerCase())) m = false;
			if (values.ngaySinh && item.ngaySinh !== (values.ngaySinh ? values.ngaySinh.format('YYYY-MM-DD') : null)) m = false;
			return m;
		});

		setList(filtered);
		
		const hs = localStorage.getItem('VB_TRA_CUU_HISTORY');
		const counts = hs ? JSON.parse(hs) : {};
		filtered.forEach((f: any) => {
			counts[f.quyetDinhId] = (counts[f.quyetDinhId] || 0) + 1;
		});
		localStorage.setItem('VB_TRA_CUU_HISTORY', JSON.stringify(counts));
		setSearchCounts(counts);
	};

	const columns = [
		{ title: 'Số hiệu', dataIndex: 'soHieu', key: 'soHieu' },
		{ title: 'Số vào sổ', dataIndex: 'soVaoSo', key: 'soVaoSo' },
		{ title: 'MSV', dataIndex: 'msv', key: 'msv' },
		{ title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
		{
			title: 'Thao tác', key: 'action',
			render: (_: any, record: any) => <Button icon={<EyeOutlined />} onClick={() => setSelectedRecord(record)}>Chi tiết</Button>,
		},
	];

	return (
		<div style={{ padding: '24px' }}>
			<Card title='Tra cứu văn bằng tốt nghiệp'>
				<Form form={form} onFinish={onSearch} layout='vertical'>
					<Row gutter={16}>
						<Col span={4}><Form.Item name='soHieu' label='Số hiệu'><Input /></Form.Item></Col>
						<Col span={4}><Form.Item name='soVaoSo' label='Số vào sổ'><Input /></Form.Item></Col>
						<Col span={4}><Form.Item name='msv' label='MSV'><Input /></Form.Item></Col>
						<Col span={6}><Form.Item name='hoTen' label='Họ tên'><Input /></Form.Item></Col>
						<Col span={6}><Form.Item name='ngaySinh' label='Ngày sinh'><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
					</Row>
					<Button type='primary' icon={<SearchOutlined />} htmlType='submit'>Tra cứu</Button>
				</Form>
			</Card>

			{list.length > 0 && <Card style={{ marginTop: '24px' }}><Table dataSource={list} columns={columns} pagination={false} rowKey='id' /></Card>}

			<Modal visible={!!selectedRecord} onCancel={() => setSelectedRecord(null)} footer={null} width={800} title='Thông tin chi tiết văn bằng'>
				{selectedRecord && (
					<div style={{ padding: '16px' }}>
						<Descriptions bordered column={2}>
							<Descriptions.Item label='Số hiệu'>{selectedRecord.soHieu}</Descriptions.Item>
							<Descriptions.Item label='Số vào sổ'>{selectedRecord.soVaoSo}</Descriptions.Item>
							<Descriptions.Item label='MSV'>{selectedRecord.msv}</Descriptions.Item>
							<Descriptions.Item label='Họ tên'>{selectedRecord.hoTen}</Descriptions.Item>
							<Descriptions.Item label='Ngày sinh'>{selectedRecord.ngaySinh}</Descriptions.Item>
							<Descriptions.Item label='Quyết định'>{qdList.find(q => q.id === selectedRecord.quyetDinhId)?.soQD}</Descriptions.Item>
							{bieuMau.map((f) => <Descriptions.Item key={f.id} label={f.name}>{selectedRecord[f.name] || 'N/A'}</Descriptions.Item>)}
						</Descriptions>
						<div style={{ marginTop: '16px', textAlign: 'right' }}>
							<Tag color='blue'>Tổng lượt tra cứu của quyết định này: {searchCounts[selectedRecord.quyetDinhId] || 0}</Tag>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default TraCuuVanBang;
