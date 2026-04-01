import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Popconfirm, Space, Tag } from 'antd';
import moment from 'moment';
import React from 'react';
import { history, useModel } from 'umi';
import ExpandText from '@/components/ExpandText';
import FormCauLacBo from './components/Form';
import ButtonExtend from '@/components/Table/ButtonExtend';
import TableBase from '@/components/Table';
import { CauLacBoRecord } from '@/models/caulacbo';
import { IColumn } from '@/components/Table/typing';

const CauLacBoPage: React.FC = () => {
	const {
		setRecord,
		setVisibleForm,
		setEdit,
		deleteModel,
        page,
        limit,
        condition,
        filters,
        sort,
	} = useModel('caulacbo');

	const columns: IColumn<CauLacBoRecord>[] = [
		{
			title: 'Ảnh đại diện',
			dataIndex: 'avatar',
			align: 'center',
			width: 120,
			render: (val: string) => (val ? <img src={val} alt="avatar" style={{ width: 50, height: 50, objectFit: 'cover' }} /> : 'Chưa có'),
		},
		{
			title: 'Tên câu lạc bộ',
			dataIndex: 'ten',
			width: 250,
            filterType: 'string',
            sortable: true,
		},
		{
			title: 'Ngày thành lập',
			dataIndex: 'ngayThanhLap',
			align: 'center',
			width: 150,
			render: (val: string) => val ? moment(val).format('DD/MM/YYYY') : '',
		},
		{
			title: 'Mô tả',
			dataIndex: 'moTa',
            filterType: 'string',
            width: 300,
			render: (val: string) => <ExpandText>{val ? <div dangerouslySetInnerHTML={{ __html: val }} /> : ''}</ExpandText>,
		},
		{
			title: 'Chủ nhiệm CLB',
			dataIndex: 'chuNhiem',
            filterType: 'string',
			width: 200,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'hoatDong',
			align: 'center',
			width: 150,
			render: (val: boolean) => (
				<Tag color={val ? 'success' : 'error'}>{val ? 'Hoạt động' : 'Không hoạt động'}</Tag>
			),
		},
		{
			title: 'Thao tác',
			align: 'center',
			width: 150,
			fixed: 'right',
			render: (_: any, recordVal: CauLacBoRecord) => (
				<Space>
					<ButtonExtend
						tooltip='Chỉnh sửa'
						onClick={() => {
							setRecord(recordVal);
							setEdit(true);
							setVisibleForm(true);
						}}
						type='link'
						icon={<EditOutlined />}
					/>
					<ButtonExtend
						tooltip='Xem danh sách thành viên'
						onClick={() => {
							history.push(`/quan-ly-cau-lac-bo/thanh-vien?idCauLacBo=${recordVal._id}`);
						}}
						type='link'
						icon={<EyeOutlined />}
					/>
					<Popconfirm
						onConfirm={() => deleteModel(recordVal._id)}
						title='Bạn có chắc chắn muốn xóa?'
					>
						<ButtonExtend
							tooltip='Xóa'
							type='link'
							danger
							icon={<DeleteOutlined />}
						/>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<>
			<TableBase
				title='Câu lạc bộ'
				columns={columns}
				modelName='caulacbo'
				dependencies={[page, limit, condition, filters, sort]}
			/>
			<FormCauLacBo />
		</>
	);
};

export default CauLacBoPage;
