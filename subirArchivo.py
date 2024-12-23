# subirArchivo.py
import os
from datetime import datetime
from office365.runtime.auth.user_credential import UserCredential
from office365.sharepoint.client_context import ClientContext
from dotenv import load_dotenv

load_dotenv()

def subir_archivo_a_sharepoint(url_sitio, carpeta_base, nombre_del_archivo):
    try:
        # Credenciales de SharePoint obtenidas desde variables de entorno
        usuario = os.getenv("USER_NAME")
        contrasena = os.getenv("PASSWORD")
        print(usuario, contrasena)

        # Crear credenciales de usuario
        credenciales_usuario = UserCredential(usuario, contrasena)

        # Crear contexto del cliente de SharePoint
        ctx = ClientContext(url_sitio).with_credentials(credenciales_usuario)

        # Obtener el mes actual
        mes_actual = datetime.now().strftime("%B")  # Ejemplo: "Diciembre"
        carpeta_destino = os.path.join(carpeta_base, mes_actual)

        # Verificar si el archivo existe antes de continuar
        if not nombre_del_archivo:
            print("No se proporcionó el nombre del archivo.")
            return

        ruta_completa_archivo = os.path.join(os.path.dirname(__file__), "uploads", nombre_del_archivo)
        if not os.path.exists(ruta_completa_archivo):
            print(f"Error: El archivo '{ruta_completa_archivo}' no se encuentra.")
            return

        # Verificar si la carpeta del mes actual existe y crearla si no
        carpeta_objetivo = ctx.web.get_folder_by_server_relative_url(carpeta_destino)
        try:
            carpeta_objetivo.execute_query()  # Intenta acceder a la carpeta
        except Exception:
            print(f"La carpeta '{carpeta_destino}' no existe. Creando...")
            carpeta_padre = ctx.web.get_folder_by_server_relative_url(carpeta_base)
            carpeta_padre.folders.add(mes_actual).execute_query()
            print(f"Carpeta '{mes_actual}' creada exitosamente en '{carpeta_base}'.")

        # Subir el archivo
        with open(ruta_completa_archivo, 'rb') as contenido_archivo:
            carpeta_objetivo.upload_file(os.path.basename(ruta_completa_archivo), contenido_archivo).execute_query()

        print(f"Archivo {os.path.basename(ruta_completa_archivo)} subido con éxito a '{carpeta_destino}'!")
    
    except Exception as e:
        print(f"Error al subir el archivo: {e}")
        import traceback
        traceback.print_exc()

# Bloque principal que se ejecutará cuando el archivo Python se ejecute
if __name__ == "__main__":
    import sys
    # Recibe argumentos desde la línea de comandos
    if len(sys.argv) > 2:
        url_sitio = sys.argv[1]
        carpeta_base = sys.argv[2]
        nombre_archivo = sys.argv[3]
    
        print(f"url del sitio: {url_sitio} \n")
        print(f"carpeta base: {carpeta_base} \n")
        print(f"nombre del archivo: {nombre_archivo} \n")
        
        subir_archivo_a_sharepoint(url_sitio, carpeta_base, nombre_archivo)
    else:
        print("No se proporcionaron los argumentos necesarios.")
