export const ROOM_TYPE = {
	THEORY: 'Lý thuyết',
	PRACTICE: 'Thực hành',
	HALL: 'Hội trường',
} as const;

export type RoomType = keyof typeof ROOM_TYPE;

export const ROOM_STORAGE_KEY = 'rooms';

export const ROOM_TYPE_OPTIONS = Object.entries(ROOM_TYPE).map(([value, label]) => ({
	label,
	value: value as RoomType,
}));

export const ROOM_MANAGER_LIST = [
	'Nguyễn Văn A',
	'Trần Thị B',
	'Lê Văn C',
	'Phạm Thị D',
	'Hoàng Văn E',
	'Võ Thị F',
	'Nguyễn Hữu G',
	'Đặng Thị H',
	'Bùi Văn I',
	'Đỗ Thị K',
] as const;

export const ROOM_MANAGER_OPTIONS = ROOM_MANAGER_LIST.map((manager) => ({
	label: manager,
	value: manager,
}));
