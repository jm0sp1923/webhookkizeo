from urllib.parse import quote
from datetime import datetime
from io import BytesIO
import os
from office365.runtime.auth.user_credential import UserCredential
from office365.sharepoint.client_context import ClientContext
from dotenv import load_dotenv
from crearCarpeta import crear_carpeta

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

def crear_estructura_carpeta(carpeta_base, tipo_diligencia, ctx):
    """Crea las carpetas: tipo de diligencia, año y mes en SharePoint."""
    try:
        # Obtener datos actuales
        mes_actual_ingles = datetime.now().strftime("%B")
        mes_actual_espanol = traducir_mes(mes_actual_ingles)
        anio_actual = datetime.now().year

        # Crear la subcarpeta de tipo de diligencia
        carpeta_tipo_diligencia = f"{carpeta_base}/{tipo_diligencia}"
        crear_carpeta(carpeta_base, tipo_diligencia, ctx)

        # Crear la subcarpeta del año actual
        carpeta_anio = f"{carpeta_tipo_diligencia}/{anio_actual}"
        crear_carpeta(carpeta_tipo_diligencia, str(anio_actual), ctx)

        # Crear la subcarpeta del mes actual
        carpeta_mes = f"{carpeta_anio}/{mes_actual_espanol}"
        crear_carpeta(carpeta_anio, mes_actual_espanol, ctx)

        return carpeta_mes

    except Exception as e:
        print(f"Error al crear la estructura de carpetas: {e}")
        raise

def subir_archivo_a_sharepoint(url_sitio, carpeta_base, tipo_diligencia, nombre_del_archivo, contenido_archivo):
    """Sube un archivo a una carpeta específica en SharePoint con la estructura de diligencia, año y mes."""
    try:
        usuario = os.getenv("USER_NAME")
        contrasena = os.getenv("PASSWORD")
        credenciales_usuario = UserCredential(usuario, contrasena)
        ctx = ClientContext(url_sitio).with_credentials(credenciales_usuario)

        # Crear la estructura de carpetas (tipo diligencia, año, mes)
        ruta_destino = crear_estructura_carpeta(carpeta_base, tipo_diligencia, ctx)

        # Subir el archivo
        carpeta_destino_codificada = quote(ruta_destino)
        carpeta_objetivo = ctx.web.get_folder_by_server_relative_url(carpeta_destino_codificada)

        # Crear un buffer a partir del archivo
        archivo_stream = BytesIO(contenido_archivo)
        carpeta_objetivo.upload_file(nombre_del_archivo, archivo_stream).execute_query()

        # Construir la URL completa
        path_file_upload = f"{url_sitio}/{ruta_destino}/{nombre_del_archivo}"
        
        print(path_file_upload)
        return path_file_upload

    except Exception as e:
        print(f"Error al subir el archivo: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 3:
        url_sitio = sys.argv[1]
        carpeta_base = sys.argv[2]
        tipo_diligencia = sys.argv[3]
        nombre_archivo = sys.argv[4]

        # Leer el contenido del archivo desde stdin
        contenido_archivo = sys.stdin.buffer.read()

        subir_archivo_a_sharepoint(url_sitio, carpeta_base, tipo_diligencia, nombre_archivo, contenido_archivo)
    else:
        print("No se proporcionaron los argumentos necesarios.")
