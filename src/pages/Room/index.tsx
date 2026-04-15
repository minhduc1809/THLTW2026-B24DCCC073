import { createRoom, deleteRoom, getRooms, updateRoom } from '@/services/room';
import type { Room, RoomPayload } from '@/types/room';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Card, Modal, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import RoomForm from './components/RoomForm';
import RoomTable from './components/RoomTable';

const RoomPage = () => {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [visibleForm, setVisibleForm] = useState(false);
	const [editingRoom, setEditingRoom] = useState<Room | null>(null);

	const loadRooms = useCallback(() => {
		setLoading(true);
		setRooms(getRooms());
		setLoading(false);
	}, []);

	useEffect(() => {
		loadRooms();
	}, [loadRooms]);

	const handleOpenCreate = () => {
		setEditingRoom(null);
		setVisibleForm(true);
	};

	const handleCloseForm = () => {
		setVisibleForm(false);
		setEditingRoom(null);
	};

	const handleSubmitRoom = async (values: RoomPayload) => {
		setSubmitting(true);

		try {
			if (editingRoom) {
				const updated = updateRoom(editingRoom.id, values);
				if (!updated) {
					message.error('Không tìm thấy phòng để cập nhật');
					return;
				}

				message.success('Cập nhật phòng thành công');
			} else {
				createRoom(values);
				message.success('Thêm phòng thành công');
			}

			handleCloseForm();
			loadRooms();
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditRoom = (room: Room) => {
		setEditingRoom(room);
		setVisibleForm(true);
	};

	const handleDeleteRoom = (room: Room) => {
		if (room.capacity >= 30) {
			message.warning('Chỉ được xóa phòng có số chỗ ngồi nhỏ hơn 30');
			return;
		}

		Modal.confirm({
			title: 'Xác nhận xóa phòng',
			content: `Bạn có chắc chắn muốn xóa ${room.name}?`,
			okText: 'Xóa',
			okType: 'danger',
			cancelText: 'Hủy',
			onOk: () => {
				const isDeleted = deleteRoom(room.id);
				if (!isDeleted) {
					message.error('Xóa phòng thất bại');
					return;
				}

				message.success('Xóa phòng thành công');
				loadRooms();
			},
		});
	};

	return (
		<Card
			title='Quản lý phòng học'
			extra={
				<Button type='primary' icon={<PlusCircleOutlined />} onClick={handleOpenCreate}>
					Thêm phòng
				</Button>
			}
		>
			<RoomTable rooms={rooms} loading={loading} onEdit={handleEditRoom} onDelete={handleDeleteRoom} />

			<RoomForm visible={visibleForm} rooms={rooms} editingRoom={editingRoom}	submitting={submitting}	onCancel={handleCloseForm} onSubmit={handleSubmitRoom} />
		</Card>
	);
};

export default RoomPage;
