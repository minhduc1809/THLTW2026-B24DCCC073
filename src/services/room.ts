import { ROOM_STORAGE_KEY } from '@/constants/enum';
import type { Room, RoomPayload } from '@/types/room';

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

const safeJsonParse = (value: string | null): Room[] => {
	if (!value) return [];

	try {
		const parsedValue = JSON.parse(value);
		if (!Array.isArray(parsedValue)) return [];

		return parsedValue.filter(
			(room): room is Room =>
				typeof room?.id === 'string' &&
				typeof room?.code === 'string' &&
				typeof room?.name === 'string' &&
				typeof room?.manager === 'string' &&
				typeof room?.capacity === 'number' &&
				typeof room?.type === 'string',
		);
	} catch (error) {
		return [];
	}
};

const saveRooms = (rooms: Room[]) => {
	if (!isBrowser) return;
	window.localStorage.setItem(ROOM_STORAGE_KEY, JSON.stringify(rooms));
};

const generateRoomId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const getRooms = (): Room[] => {
	if (!isBrowser) return [];
	return safeJsonParse(window.localStorage.getItem(ROOM_STORAGE_KEY));
};

export const createRoom = (payload: RoomPayload): Room => {
	const currentRooms = getRooms();
	const newRoom: Room = {
		id: generateRoomId(),
		...payload,
	};

	saveRooms([...currentRooms, newRoom]);
	return newRoom;
};

export const updateRoom = (id: string, payload: RoomPayload): Room | null => {
	const currentRooms = getRooms();
	let updatedRoom: Room | null = null;

	const nextRooms = currentRooms.map((room) => {
		if (room.id !== id) return room;

		updatedRoom = {
			...room,
			...payload,
			id,
		};

		return updatedRoom;
	});

	if (!updatedRoom) return null;

	saveRooms(nextRooms);
	return updatedRoom;
};

export const deleteRoom = (id: string): boolean => {
	const currentRooms = getRooms();
	const nextRooms = currentRooms.filter((room) => room.id !== id);

	if (nextRooms.length === currentRooms.length) return false;

	saveRooms(nextRooms);
	return true;
};
