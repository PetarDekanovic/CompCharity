import React, { useEffect, useState } from 'react';

const useAuth = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('backend_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('backend_token');
        localStorage.removeItem('user_data');
        setUser(null);
    };

    return { user, logout };
};

export default useAuth;