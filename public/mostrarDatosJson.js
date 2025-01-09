// Manejar el evento de carga del archivo
document.getElementById('excelFile').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });

      // Convertir la primera hoja a JSON
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      // Mostrar el JSON resultante
      document.getElementById('jsonOutput').innerHTML = `
        <h4>Contenido convertido a JSON:</h4>
        <pre>${JSON.stringify(json, null, 2)}</pre>
      `;
    };
    reader.readAsBinaryString(file);
  });

  // Manejar el envío del formulario
  document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío predeterminado del formulario

    Swal.fire({
      title: "Subiendo...",
      text: "Por favor espera mientras subimos el archivo...",
      icon: "info",
      showConfirmButton: false,
    });

    const formData = new FormData(this);
    fetch('/upload-excel', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        Swal.fire({
          title: "¡Éxito!",
          text: data.message, 
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: data.message, 
          icon: "error",
          confirmButtonText: "Aceptar",
        });
      }
    })
    .catch(error => {
      Swal.fire({
        title: "Error",
        text: "Hubo un problema de conexión.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    });
  });