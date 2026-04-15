import { ROOM_MANAGER_LIST, ROOM_MANAGER_OPTIONS, ROOM_TYPE_OPTIONS } from '@/constants/enum';
import { getRooms } from '@/services/room';
import type { Room, RoomPayload } from '@/types/room';
import rules from '@/utils/rules';
import { Form, Input, InputNumber, Modal, Select } from 'antd';
import { useEffect, useMemo } from 'react';

interface RoomFormProps {
	visible: boolean;
	rooms: Room[];
	editingRoom?: Room | null;
	submitting?: boolean;
	onCancel: () => void;
	onSubmit: (values: RoomPayload) => Promise<void> | void;
}

interface RoomFormValues {
	code: string;
	name: string;
	capacity: number;
	type: Room['type'];
	manager: string;
}

type UniqueField = 'code' | 'name';

const normalizeFieldValue = (value: string) => value.trim().toLowerCase();

const getSourceRooms = (rooms: Room[]) => (rooms.length ? rooms : getRooms());

const createUniqueValidator = (
	field: UniqueField,
	rooms: Room[],
	editingRoomId?: string,
	message = 'Dữ liệu đã tồn tại',
) => ({
	validator: async (_: unknown, value: string) => {
		if (!value?.trim()) return Promise.resolve();

		const sourceRooms = getSourceRooms(rooms);
		const normalizedValue = normalizeFieldValue(value);

		const isDuplicated = sourceRooms.some(
			(room) => room.id !== editingRoomId && normalizeFieldValue(String(room[field])) === normalizedValue,
		);

		if (isDuplicated) return Promise.reject(new Error(message));
		return Promise.resolve();
	},
});

const capacityRangeWarningRule = {
	validator: async (_: unknown, value: number | null | undefined) => {
		if (value === null || value === undefined || value === ('' as unknown as number)) return Promise.resolve();
		if (Number(value) < 10 || Number(value) > 200) {
			return Promise.reject(new Error('Số chỗ ngồi phải từ 10 đến 200'));
		}

		return Promise.resolve();
	},
};

const managerInListRule = {
	validator: async (_: unknown, value: string | undefined) => {
		if (!value) return Promise.resolve();

		if (!ROOM_MANAGER_LIST.includes(value as (typeof ROOM_MANAGER_LIST)[number])) {
			return Promise.reject(new Error('Người phụ trách phải chọn từ danh sách'));
		}

		return Promise.resolve();
	},
};

const buildFormRules = (rooms: Room[], editingRoomId?: string) => ({
	code: [
		...rules.required,
		...rules.text,
		...rules.length(20),
		createUniqueValidator('code', rooms, editingRoomId, 'Mã phòng đã tồn tại'),
	],
	name: [
		...rules.required,
		...rules.text,
		...rules.length(120),
		createUniqueValidator('name', rooms, editingRoomId, 'Tên phòng đã tồn tại'),
	],
	capacity: [...rules.required, ...rules.number(200, 10, false), capacityRangeWarningRule],
	type: [...rules.required],
	manager: [...rules.required, managerInListRule],
});

const RoomForm = ({ visible, rooms, editingRoom, submitting = false, onCancel, onSubmit }: RoomFormProps) => {
	const [form] = Form.useForm<RoomFormValues>();

	const formRules = useMemo(() => buildFormRules(rooms, editingRoom?.id), [rooms, editingRoom?.id]);

	useEffect(() => {
		if (!visible) {
			form.resetFields();
			return;
		}

		if (editingRoom) {
			form.setFieldsValue(editingRoom);
			return;
		}

		form.resetFields();
	}, [visible, editingRoom, form]);

	const handleFinish = async (values: RoomFormValues) => {
		await onSubmit({
			...values,
			capacity: Number(values.capacity),
		});
	};

	return (
		<Modal
			title={editingRoom ? 'Cập nhật phòng học' : 'Thêm phòng học'}
			visible={visible}
			onCancel={onCancel}
			onOk={() => form.submit()}
			confirmLoading={submitting}
			okText={editingRoom ? 'Lưu thay đổi' : 'Tạo mới'}
			cancelText='Hủy'
			destroyOnClose
		>
			<Form form={form} layout='vertical' onFinish={handleFinish}>
				<Form.Item name='code' label='Mã phòng' rules={formRules.code}>
					<Input placeholder='Ví dụ: ABC' maxLength={20} />
				</Form.Item>

				<Form.Item name='name' label='Tên phòng' rules={formRules.name}>
					<Input placeholder='Ví dụ: Phòng A' maxLength={120} />
				</Form.Item>

				<Form.Item
					name='capacity'
					label='Số chỗ ngồi'
					rules={formRules.capacity}
					extra='Số chỗ ngồi từ 10 đến 200'
				>
					<InputNumber style={{ width: '100%' }} min={10} max={200} precision={0} />
				</Form.Item>

				<Form.Item name='type' label='Loại phòng' rules={formRules.type}>
					<Select placeholder='Chọn loại phòng' options={ROOM_TYPE_OPTIONS} />
				</Form.Item>

				<Form.Item name='manager' label='Người phụ trách' rules={formRules.manager}>
					<Select
						showSearch
						optionFilterProp='label'
						placeholder='Chọn người phụ trách'
						options={ROOM_MANAGER_OPTIONS}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default RoomForm;
