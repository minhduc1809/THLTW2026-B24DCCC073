import { Button, Card, Col, Form, Modal, Row, Select, Table, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel, useLocation } from 'umi';
import { DonDangKyRecord } from '@/models/dondangky';
import { CauLacBoRecord } from '@/models/caulacbo';
import { SwapOutlined } from '@ant-design/icons';
import { Location } from 'history';

const ThanhVienCLBPage: React.FC = () => {
	const {
		danhSach,
		getModel,
		loading,
		changeGroupManyModel,
	} = useModel('dondangky');

	const caulacboModel = useModel('caulacbo');
	const location = useLocation<Location>();

	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [visibleChange, setVisibleChange] = useState(false);
	const [targetClub, setTargetClub] = useState('');
	const [filterClub, setFilterClub] = useState<string | null>(null);

	useEffect(() => {
		caulacboModel.getModel();
		
		const searchParams = new URLSearchParams((location as any).search);
		const idCLB = searchParams.get('idCauLacBo');
		if (idCLB) {
			setFilterClub(idCLB);
            getModel({}, (item: any) => item.trangThai === 'Approved' && item.idCauLacBo === idCLB);
        } else {
            getModel({}, (item: any) => item.trangThai === 'Approved');
        }
	}, [location]);

    const doManualFilter = (val: string | null) => {
        setFilterClub(val);
        if (val) {
            getModel({}, (item: any) => item.trangThai === 'Approved' && item.idCauLacBo === val);
        } else {
            getModel({}, (item: any) => item.trangThai === 'Approved');
        }
    }

	const mapCaulacbo = (id: string) => {
		const clb = caulacboModel.danhSach.find((c: CauLacBoRecord) => c._id === id);
		return clb ? clb.ten : 'Chưa rõ';
	};

	let dataRender = danhSach;

	const columns = [
		{
			title: 'Họ và tên',
			dataIndex: 'hoTen',
			width: 180,
			sorter: (a: DonDangKyRecord, b: DonDangKyRecord) => a.hoTen.localeCompare(b.hoTen),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			width: 180,
		},
		{
			title: 'SĐT',
			dataIndex: 'soDienThoai',
			width: 120,
		},
		{
			title: 'Giới tính',
			dataIndex: 'gioiTinh',
			width: 100,
		},
        {
			title: 'Địa chỉ',
			dataIndex: 'diaChi',
			width: 200,
		},
		{
			title: 'Sở trường',
			dataIndex: 'soTruong',
			width: 200,
		},
        {
			title: 'Lý do ĐK',
			dataIndex: 'lyDoDangKy',
			width: 200,
		},
		{
			title: 'Câu lạc bộ hiện tại',
			dataIndex: 'idCauLacBo',
			width: 250,
			render: (val: string) => <Tag color='blue'>{mapCaulacbo(val)}</Tag>,
		},
	];

	const handleChangeGroup = async () => {
		if (!targetClub) return;
        await changeGroupManyModel(selectedRowKeys as string[], targetClub);
        doManualFilter(filterClub);
		setVisibleChange(false);
		setTargetClub('');
		setSelectedRowKeys([]);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: (newSelectedRowKeys: React.Key[]) => {
			setSelectedRowKeys(newSelectedRowKeys);
		},
	};

    const clubName = filterClub ? mapCaulacbo(filterClub) : '';

	return (
		<Card title={`Quản lý Danh sách Thành viên ${clubName ? `- ${clubName}` : ''}`} bordered={false}>
			<Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
				<Col span={8}>
					<Select
						style={{ width: '100%' }}
						placeholder='Lọc theo Câu lạc bộ'
						allowClear
						value={filterClub}
						onChange={(val) => doManualFilter(val)}
					>
						{caulacboModel.danhSach.map((clb: CauLacBoRecord) => (
							<Select.Option key={clb._id} value={clb._id}>{clb.ten}</Select.Option>
						))}
					</Select>
				</Col>
				<Col span={16} style={{ textAlign: 'right' }}>
					{selectedRowKeys.length > 0 && (
						<Button
							type='primary'
							icon={<SwapOutlined />}
							onClick={() => setVisibleChange(true)}
						>
							Chuyển CLB cho {selectedRowKeys.length} thành viên
						</Button>
					)}
				</Col>
			</Row>

			<Table
				rowSelection={rowSelection}
				rowKey='_id'
				loading={loading}
				columns={columns}
				dataSource={dataRender}
				bordered
				scroll={{ x: 1400 }}
				pagination={{ showSizeChanger: true, showTotal: (t) => `Tổng số: ${t}` }}
			/>

			<Modal
				title={`Chuyển CLB cho ${selectedRowKeys.length} thành viên`}
				visible={visibleChange}
				onOk={handleChangeGroup}
				onCancel={() => {
					setVisibleChange(false);
					setTargetClub('');
				}}
				okButtonProps={{ disabled: !targetClub }}
			>
				<Form layout='vertical'>
					<Form.Item label='Chọn Câu lạc bộ muốn chuyển đến' required>
						<Select
							value={targetClub}
							onChange={(v) => setTargetClub(v)}
							placeholder='Chọn câu lạc bộ...'
						>
							{caulacboModel.danhSach.filter((c: CauLacBoRecord) => c.hoatDong).map((clb: CauLacBoRecord) => (
								<Select.Option key={clb._id} value={clb._id}>{clb.ten}</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</Card>
	);
};

export default ThanhVienCLBPage;
