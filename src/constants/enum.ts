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
