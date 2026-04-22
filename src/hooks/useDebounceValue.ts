import { useEffect, useState } from 'react';

const useDebounceValue = <T,>(value: T, delay = 300): T => {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			window.clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
};

export default useDebounceValue;
