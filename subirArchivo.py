from urllib.parse import quote
from datetime import datetime
import os
from office365.runtime.auth.user_credential import UserCredential
from office365.sharepoint.client_context import ClientContext
from dotenv import load_dotenv

load_dotenv()

def traducir_mes(mes_en_ingles):
    """Traduce el mes de inglés a español."""
    meses = {
        "January": "Enero", "February": "Febrero", "March": "Marzo", "April": "Abril",
        "May": "Mayo", "June": "Junio", "July": "Julio", "August": "Agosto",
        "September": "Septiembre", "October": "Octubre", "November": "Noviembre",
        "December": "Diciembre"
    }
    return meses.get(mes_en_ingles, mes_en_ingles)

def subir_archivo_a_sharepoint(url_sitio, carpeta_base, nombre_del_archivo):
    try:
        usuario = os.getenv("USER_NAME")
        contrasena = os.getenv("PASSWORD")
        credenciales_usuario = UserCredential(usuario, contrasena)
        ctx = ClientContext(url_sitio).with_credentials(credenciales_usuario)

        mes_actual_ingles = datetime.now().strftime("%B")
        mes_actual_espanol = traducir_mes(mes_actual_ingles)
        carpeta_destino = f"{carpeta_base}/{mes_actual_espanol}"
        carpeta_destino_codificada = quote(carpeta_destino)

        # Verificar si el archivo existe
        ruta_completa_archivo = os.path.join(os.path.dirname(__file__), "uploads", nombre_del_archivo)
        if not os.path.exists(ruta_completa_archivo):
            print(f"Error: El archivo '{ruta_completa_archivo}' no se encuentra.")
            return

        # Verificar o crear la carpeta destino
        try:
            ctx.web.get_folder_by_server_relative_url(carpeta_destino_codificada).execute_query()
        except Exception:
            print(f"La carpeta '{carpeta_destino}' no existe. Creando...")
            carpeta_padre = ctx.web.get_folder_by_server_relative_url(carpeta_base)
            carpeta_padre.folders.add(mes_actual_espanol).execute_query()
            print(f"Carpeta '{mes_actual_espanol}' creada exitosamente.")

        # Subir el archivo
        with open(ruta_completa_archivo, 'rb') as contenido_archivo:
            carpeta_objetivo = ctx.web.get_folder_by_server_relative_url(carpeta_destino_codificada)
            carpeta_objetivo.upload_file(os.path.basename(ruta_completa_archivo), contenido_archivo).execute_query()

        print(f"Archivo {os.path.basename(ruta_completa_archivo)} subido con éxito a '{carpeta_destino}'!")
    
    except Exception as e:
        print(f"Error al subir el archivo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 3:
        url_sitio = sys.argv[1]
        carpeta_base = sys.argv[2]
        nombre_archivo = sys.argv[3]
        subir_archivo_a_sharepoint(url_sitio, carpeta_base, nombre_archivo)
    else:
        print("No se proporcionaron los argumentos necesarios.")
