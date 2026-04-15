import type { RoomType } from '@/constants/enum';

export interface Room {
	id: string;
	code: string;
	name: string;
	capacity: number;
	type: RoomType;
	manager: string;
}

export type RoomPayload = Omit<Room, 'id'>;
