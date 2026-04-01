import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	HistoryOutlined,
} from '@ant-design/icons';
import { Form, Input, Modal, Popconfirm, Space, Tag, message, Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import FormDonDangKy from './components/Form';
import FormHistory from './components/FormHistory';
import ButtonExtend from '@/components/Table/ButtonExtend';
import TableBase from '@/components/Table';
import { DonDangKyRecord } from '@/models/dondangky';
import { CauLacBoRecord } from '@/models/caulacbo';
import { IColumn } from '@/components/Table/typing';

const DonDangKyPage: React.FC = () => {
	const {
		setRecord,
		setVisibleForm,
		setEdit,
		setIsView,
		deleteModel,
		approveManyModel,
		rejectManyModel,
        page,
        limit,
        condition,
        filters,
        sort,
        selectedIds,
	} = useModel('dondangky');

	const caulacboModel = useModel('caulacbo');

	const [visibleReject, setVisibleReject] = useState(false);
	const [visibleHistory, setVisibleHistory] = useState(false);
	const [rejectReason, setRejectReason] = useState('');
	const [singleActionId, setSingleActionId] = useState<string | null>(null);

	useEffect(() => {
		caulacboModel.getModel();
	}, []);

	const mapCaulacbo = (id: string) => {
		const clb = caulacboModel.danhSach.find((c: CauLacBoRecord) => c._id === id);
		return clb ? clb.ten : 'Chưa rõ';
	};

	const columns: IColumn<DonDangKyRecord>[] = [
		{
			title: 'Họ và tên',
			dataIndex: 'hoTen',
			width: 180,
            filterType: 'string',
            sortable: true,
		},
		{
			title: 'Email',
			dataIndex: 'email',
			width: 180,
            filterType: 'string',
		},
		{
			title: 'SĐT',
			dataIndex: 'soDienThoai',
			width: 120,
            filterType: 'string',
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
            filterType: 'string',
		},
		{
			title: 'Câu lạc bộ',
			dataIndex: 'idCauLacBo',
			width: 200,
            filterType: 'select',
            filterData: caulacboModel.danhSach.map((c: CauLacBoRecord) => ({ label: c.ten, value: c._id })),
			render: (val: string) => mapCaulacbo(val),
		},
		{
			title: 'Sở trường',
			dataIndex: 'soTruong',
			width: 150,
		},
		{
			title: 'Lý do ĐK',
			dataIndex: 'lyDoDangKy',
			width: 200,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'trangThai',
			width: 120,
			align: 'center',
            filterType: 'select',
            filterData: [
                { label: 'Pending', value: 'Pending' },
                { label: 'Approved', value: 'Approved' },
                { label: 'Rejected', value: 'Rejected' },
            ],
			render: (val: string) => {
				let color = 'default';
				if (val === 'Approved') color = 'success';
				if (val === 'Rejected') color = 'error';
				if (val === 'Pending') color = 'warning';
				return <Tag color={color}>{val}</Tag>;
			},
		},
		{
			title: 'Ghi chú',
			dataIndex: 'ghiChu',
			width: 150,
		},
		{
			title: 'Thao tác',
			align: 'center',
			width: 220,
			fixed: 'right',
			render: (_: any, recordVal: DonDangKyRecord) => {
				const isPending = recordVal.trangThai === 'Pending';
				return (
					<Space>
						<ButtonExtend
							tooltip='Xem chi tiết'
							onClick={() => {
								setRecord(recordVal);
								setIsView(true);
								setVisibleForm(true);
							}}
							type='link'
							icon={<EyeOutlined />}
						/>
						{isPending && (
							<ButtonExtend
								tooltip='Chỉnh sửa'
								onClick={() => {
									setRecord(recordVal);
									setEdit(true);
									setIsView(false);
									setVisibleForm(true);
								}}
								type='link'
								icon={<EditOutlined />}
							/>
						)}
						{isPending && (
							<>
								<Popconfirm
									onConfirm={() => approveManyModel([recordVal._id])}
									title='Duyệt đơn đăng ký này?'
								>
									<ButtonExtend tooltip='Duyệt' type='link' style={{ color: 'green' }} icon={<CheckCircleOutlined />} />
								</Popconfirm>
								<ButtonExtend
									tooltip='Từ chối'
									type='link'
									danger
									onClick={() => {
										setSingleActionId(recordVal._id);
										setVisibleReject(true);
									}}
									icon={<CloseCircleOutlined />}
								/>
							</>
						)}
						<ButtonExtend
							tooltip='Xem lịch sử'
							onClick={() => {
								setRecord(recordVal);
								setVisibleHistory(true);
							}}
							type='link'
							icon={<HistoryOutlined style={{ color: '#1890ff' }} />}
						/>
						<Popconfirm
							onConfirm={() => deleteModel(recordVal._id)}
							title='Bạn có chắc chắn muốn xóa?'
						>
							<ButtonExtend tooltip='Xóa' type='link' danger icon={<DeleteOutlined />} />
						</Popconfirm>
					</Space>
				);
			},
		},
	];

	const handleReject = () => {
		if (!rejectReason) {
            message.warning('Vui lòng nhập lý do từ chối');
            return;
        }
		if (singleActionId) {
			rejectManyModel([singleActionId], rejectReason);
		} else {
			rejectManyModel(selectedIds as string[], rejectReason);
		}
		setVisibleReject(false);
		setRejectReason('');
		setSingleActionId(null);
	};

	return (
		<>
			<TableBase
                title='Đơn đăng ký tham gia'
				modelName='dondangky'
				columns={columns}
				dependencies={[page, limit, condition, filters, sort, caulacboModel.danhSach]}
                rowSelection
                detailRow={{ getCheckboxProps: (record: DonDangKyRecord) => ({ disabled: record.trangThai !== 'Pending' }) }}
                otherButtons={selectedIds && selectedIds.length > 0 ? [
                        <Space key="action">
                            <Button
                                type='default'
                                style={{ color: 'green', borderColor: 'green' }}
                                onClick={() => {
                                    approveManyModel(selectedIds as string[]);
                                }}
                            >
                                Duyệt {selectedIds.length} đơn đã chọn
                            </Button>
                            <Button
                                danger
                                onClick={() => {
                                    setSingleActionId(null);
                                    setVisibleReject(true);
                                }}
                            >
                                Từ chối {selectedIds.length} đơn đã chọn
                            </Button>
                        </Space>
                ] : []}
                scroll={{ x: 1600 }}
			/>

			<FormDonDangKy />
			<FormHistory visible={visibleHistory} onClose={() => setVisibleHistory(false)} />

			<Modal
				title='Từ chối đơn đăng ký'
				visible={visibleReject}
				onOk={handleReject}
				onCancel={() => {
					setVisibleReject(false);
					setRejectReason('');
					setSingleActionId(null);
				}}
				okButtonProps={{ disabled: !rejectReason }}
			>
				<Form layout='vertical'>
					<Form.Item label='Lý do từ chối (Bắt buộc)' required>
						<Input.TextArea
							rows={4}
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder='Nhập lý do từ chối...'
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default DonDangKyPage;
