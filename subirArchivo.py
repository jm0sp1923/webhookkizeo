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


def crear_carpeta(ctx, carpeta_base, subcarpeta):
    """Verifica si la subcarpeta existe en SharePoint, si no, la crea."""
    try:
        # Verificar si la carpeta existe
        ctx.web.get_folder_by_server_relative_url(f"{carpeta_base}/{subcarpeta}").execute_query()
    except Exception:
        # Crear la subcarpeta
        carpeta_padre = ctx.web.get_folder_by_server_relative_url(carpeta_base)
        carpeta_padre.folders.add(subcarpeta).execute_query()
        print(f"Carpeta '{subcarpeta}' creada exitosamente en '{carpeta_base}'.")

def subir_archivo_a_sharepoint(url_sitio, carpeta_base, nombre_del_archivo):
    try:
        usuario = os.getenv("USER_NAME")
        contrasena = os.getenv("PASSWORD")
        credenciales_usuario = UserCredential(usuario, contrasena)
        ctx = ClientContext(url_sitio).with_credentials(credenciales_usuario)

        # Obtener el mes actual
        mes_actual_ingles = datetime.now().strftime("%B")
        mes_actual_espanol = traducir_mes(mes_actual_ingles)
        

        # Construir la ruta completa del archivo
        ruta_completa_archivo = os.path.join(os.path.dirname(__file__), "uploads", nombre_del_archivo)
        if not os.path.exists(ruta_completa_archivo):
            print(f"Error: El archivo '{ruta_completa_archivo}' no se encuentra.")
            return

        crear_carpeta(ctx, f"{carpeta_base}/", mes_actual_espanol)
        
        carpeta_destino = f"{carpeta_base}/{mes_actual_espanol}"

        # Subir el archivo
        with open(ruta_completa_archivo, 'rb') as contenido_archivo:
            carpeta_destino_codificada = quote(carpeta_destino, safe='/')
            carpeta_objetivo = ctx.web.get_folder_by_server_relative_url(carpeta_destino_codificada)
            carpeta_objetivo.upload_file(os.path.basename(ruta_completa_archivo), contenido_archivo).execute_query()

        print(f"Archivo '{os.path.basename(ruta_completa_archivo)}' subido con éxito a '{carpeta_destino}'!")
    
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
