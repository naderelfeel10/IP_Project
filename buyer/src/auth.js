const AUTH_TOKEN_KEY = 'buyerAuthToken';
const AUTH_USER_KEY = 'buyerAuthUser';
const AUTH_PAYLOAD_KEY = 'buyerAuthPayload';

const decodeJwtPayload = (token) => {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
        atob(base64)
            .split('')
            .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
            .join('')
    );

    return JSON.parse(json);
};

export const saveAuthToken = (token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);

    const user = decodeJwtPayload(token);
    localStorage.setItem(AUTH_PAYLOAD_KEY, JSON.stringify(user));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
        email: user.email,
        username: user.username
    }));
};

export const getAuthToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthUser = () => {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const getAuthPayload = () => {
    const payload = localStorage.getItem(AUTH_PAYLOAD_KEY);
    if(payload){
        return JSON.parse(payload);
    }

    const token = getAuthToken();
    return token ? decodeJwtPayload(token) : null;
};

export const clearAuthToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_PAYLOAD_KEY);
};

export const isSignedIn = () => {
    return Boolean(getAuthToken());
};
