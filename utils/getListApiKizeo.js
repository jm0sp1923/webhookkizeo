// URL de la API
const apiUrl = 'https://www.kizeoforms.com/rest/v3/lists/';

// Token de autenticación
const token = 'appi_kizeo_8dee71f523975ee24eb2a49f055e97b5241f1145';

// Realizar una solicitud GET a la API con el token
fetch(apiUrl, {
    method: 'GET',
    headers: {
        Authorization: token
    },
})
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener los datos de la API');
        }
        return response.json();
    })
    .then(data => {
        const listTypeSelect = document.getElementById('listType');
        data.lists.forEach(list => {
            const option = document.createElement('option');
            option.value = list.id; 
            option.textContent = list.name;
            listTypeSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
