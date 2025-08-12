async function fetchAuthenticated(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('Sua sessão expirou ou você não tem permissão. Faça login novamente.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject('Unauthorized');
    }

    const defaultHeaders = {
        // Adiciona Content-Type apenas se houver body ou explicitamente pedido
        ...(options.body && !options.headers?.['Content-Type'] && {'Content-Type': 'application/json'}),
        ...options.headers
    };

    defaultHeaders['Authorization'] = `Bearer ${token}`;

    return fetch(url, { ...options, headers: defaultHeaders })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                alert('Sua sessão expirou ou você não tem permissão. Faça login novamente.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject('Unauthorized'); 
            }
            return response;
        });
}
