import {useEffect, useState} from 'react';
import {unSubscribeToNotifications} from '../api/notifications';
import {Card,Alert} from 'antd';

const Unsubscribe = () => {
    const [message, setMessage] = useState(null);

    const parseQueryString = () => {
        const queryString = location.hash?.split("?")[1];
        const params = queryString.split("&");
        const paramObject = {};

        params.forEach((param) => {
            const [key, value] = param.split("=");
            paramObject[key] = value;
        });

        return paramObject;
    };

    const queryParams = parseQueryString();

    useEffect(() => {
        if (queryParams?.email) {
            unSubscribeToNotifications({email: queryParams?.email})
                .then(() => setMessage('You have successfully unsubscribed'))
                .catch(() => setMessage('Failed to unsubscribe'));
        }
    }, [queryParams?.email]);

    return (
        <Card title='Notifications'>
            {message && <Alert message={message} type={
                message.includes('successfully') ? 'success' : 'error'
            }/>}
        </Card>
    );
};

export default Unsubscribe;