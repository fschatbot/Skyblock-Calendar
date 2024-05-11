import { calcDay } from "../assets/utils";
import { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState({ seconds: 0, minute: 0, hour: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const { seconds, minute, hour } = calcDay();
            setTime({ seconds, minute, hour });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}${time.hour >= 12 ? 'pm' : 'am'}`;
};

export default Clock;
