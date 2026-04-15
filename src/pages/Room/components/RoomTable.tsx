import { ROOM_TYPE, ROOM_TYPE_OPTIONS } from '@/constants/enum';
import type { Room } from '@/types/room';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import { useMemo, useState } from 'react';

interface RoomTableProps {
	rooms: Room[];
	loading?: boolean;
	onEdit: (room: Room) => void;
	onDelete: (room: Room) => void;
}

const RoomTable = ({ rooms, loading = false, onEdit, onDelete }: RoomTableProps) => {
	const [searchCode, setSearchCode] = useState('');
	const [searchName, setSearchName] = useState('');
	const [typeFilter, setTypeFilter] = useState<Room['type'] | undefined>(undefined);
	const [managerFilter, setManagerFilter] = useState<string | undefined>(undefined);

	const managerOptions = useMemo(
		() =>
			Array.from(new Set(rooms.map((room) => room.manager.trim()).filter(Boolean)))
				.sort((a, b) => a.localeCompare(b, 'vi'))
				.map((value) => ({ label: value, value })),
		[rooms],
	);

	const filteredRooms = useMemo(() => {
		const normalizedCode = searchCode.trim().toLowerCase();
		const normalizedName = searchName.trim().toLowerCase();

		return rooms.filter((room) => {
			const matchCode = !normalizedCode || room.code.toLowerCase().includes(normalizedCode);
			const matchName = !normalizedName || room.name.toLowerCase().includes(normalizedName);
			const matchType = !typeFilter || room.type === typeFilter;
			const matchManager = !managerFilter || room.manager === managerFilter;

			return matchCode && matchName && matchType && matchManager;
		});
	}, [rooms, searchCode, searchName, typeFilter, managerFilter]);

	const columns: ColumnsType<Room> = useMemo(
		() => [
			{
				title: 'Mã phòng',
				dataIndex: 'code',
				width: 120,
			},
			{
				title: 'Tên phòng',
				dataIndex: 'name',
			},
			{
				title: 'Số chỗ ngồi',
				dataIndex: 'capacity',
				width: 120,
				align: 'right',
				sorter: (a, b) => a.capacity - b.capacity,
			},
			{
				title: 'Loại phòng',
				dataIndex: 'type',
				width: 140,
				render: (value: Room['type']) => <Tag color='blue'>{ROOM_TYPE[value]}</Tag>,
			},
			{
				title: 'Người phụ trách',
				dataIndex: 'manager',
				width: 220,
			},
			{
				title: 'Thao tác',
				key: 'actions',
				width: 140,
				fixed: 'right',
				align: 'center',
				render: (_, record) => {
					const canDelete = record.capacity < 30;

					return (
						<Space>
							<Tooltip title='Chỉnh sửa'>
								<Button type='link' icon={<EditOutlined />} onClick={() => onEdit(record)} />
							</Tooltip>
							<Tooltip title={canDelete ? 'Xóa' : 'Chỉ xóa khi số chỗ ngồi nhỏ hơn 30'}>
								<Button
									type='link'
									danger
									icon={<DeleteOutlined />}
									disabled={!canDelete}
									onClick={() => canDelete && onDelete(record)}
								/>
							</Tooltip>
						</Space>
					);
				},
			},
		],
		[onDelete, onEdit],
	);

	const resetFilters = () => {
		setSearchCode('');
		setSearchName('');
		setTypeFilter(undefined);
		setManagerFilter(undefined);
	};

	return (
		<>
			<Space wrap style={{ marginBottom: 16 }}>
				<Input
					allowClear
					style={{ width: 220 }}
					placeholder='Tìm theo mã phòng'
					value={searchCode}
					onChange={(event) => setSearchCode(event.target.value)}
				/>
				<Input
					allowClear
					style={{ width: 260 }}
					placeholder='Tìm theo tên phòng'
					value={searchName}
					onChange={(event) => setSearchName(event.target.value)}
				/>
				<Select
					allowClear
					style={{ width: 180 }}
					placeholder='Lọc theo loại phòng'
					options={ROOM_TYPE_OPTIONS}
					value={typeFilter}
					onChange={(value) => setTypeFilter(value)}
				/>
				<Select
					allowClear
					showSearch
					optionFilterProp='label'
					style={{ width: 220 }}
					placeholder='Lọc theo người phụ trách'
					options={managerOptions}
					value={managerFilter}
					onChange={(value) => setManagerFilter(value)}
				/>
				<Button onClick={resetFilters}>Đặt lại</Button>
			</Space>

			<Table<Room>
				rowKey='id'
				columns={columns}
				dataSource={filteredRooms}
				loading={loading}
				pagination={{ showSizeChanger: true, defaultPageSize: 10 }}
				scroll={{ x: 900 }}
			/>
		</>
	);
};

export default RoomTable;
