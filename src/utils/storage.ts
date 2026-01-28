import { useState, useEffect } from 'react';

const PRODUCT_KEY = 'APP_PRODUCTS';
const ORDER_KEY = 'APP_ORDERS';

export const INITIAL_PRODUCTS = [
    { id: 1, name: 'Laptop Dell XPS 13', category: 'Laptop', price: 25000000, quantity: 15 },
    { id: 2, name: 'iPhone 15 Pro Max', category: 'Điện thoại', price: 30000000, quantity: 8 },
    { id: 3, name: 'Samsung Galaxy S24', category: 'Điện thoại', price: 22000000, quantity: 20 },
    { id: 4, name: 'iPad Air M2', category: 'Máy tính bảng', price: 18000000, quantity: 5 },
    { id: 5, name: 'MacBook Air M3', category: 'Laptop', price: 28000000, quantity: 12 },
    { id: 6, name: 'AirPods Pro 2', category: 'Phụ kiện', price: 6000000, quantity: 0 },
    { id: 7, name: 'Samsung Galaxy Tab S9', category: 'Máy tính bảng', price: 15000000, quantity: 7 },
    { id: 8, name: 'Logitech MX Master 3', category: 'Phụ kiện', price: 2500000, quantity: 25 },
];

export const INITIAL_ORDERS = [
    { id: 'DH001', customerName: 'Nguyễn Văn A', phone: '0912345678', address: '123 Nguyễn Huệ, Q1, TP.HCM', products: [{ productId: 1, productName: 'Laptop Dell XPS 13', quantity: 1, price: 25000000 }], totalAmount: 25000000, status: 'Chờ xử lý', createdAt: '2024-01-15' }
];

export const useSharedState = <T>(key: string, initialValue: T) => {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(state) : value;
            setState(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        const handleStorageChange = () => {
            try {
                const item = window.localStorage.getItem(key);
                if (item) {
                    setState(JSON.parse(item));
                }
            } catch (error) {
                console.error(error);
            }
        }
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [key]);
    return [state, setValue] as const;
};
export const PRODUCT_STORAGE_KEY = PRODUCT_KEY;
export const ORDER_STORAGE_KEY = ORDER_KEY;
