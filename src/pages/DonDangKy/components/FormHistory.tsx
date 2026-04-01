import { Modal, Table, Tag } from 'antd';
import React from 'react';
import { useModel } from 'umi';

interface Props {
	visible: boolean;
	onClose: () => void;
}

const FormHistory: React.FC<Props> = ({ visible, onClose }) => {
	const { record } = useModel('dondangky');

	const columns = [
		{
			title: 'Thời gian',
			dataIndex: 'time',
			width: 150,
		},
		{
			title: 'Người thực hiện',
			dataIndex: 'user',
			width: 150,
		},
		{
			title: 'Hành động',
			dataIndex: 'action',
			width: 120,
			render: (val: string) => (
				<Tag color={val === 'Approved' ? 'success' : val === 'Rejected' ? 'error' : 'default'}>
					{val}
				</Tag>
			),
		},
		{
			title: 'Ghi chú',
			dataIndex: 'note',
		},
	];

	return (
		<Modal
			title='Lịch sử xét duyệt'
			visible={visible}
			onCancel={onClose}
			footer={false}
			width={700}
		>
			<Table
				dataSource={record?.actionHistory || []}
				columns={columns}
				pagination={false}
				rowKey={(r) => r.time + r.action}
				locale={{ emptyText: 'Chưa có lịch sử duyệt đơn' }}
			/>
		</Modal>
	);
};

export default FormHistory;
