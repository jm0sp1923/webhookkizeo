# subirArchivo.py

import os
from office365.runtime.auth.user_credential import UserCredential
from office365.sharepoint.client_context import ClientContext
from dotenv import load_dotenv

load_dotenv()



def upload_file_to_sharepoint(site_url, destination_folder,nombre_del_archivo):
    try:
        # Reemplaza con tus credenciales de SharePoint
        username = os.getenv("USER_NAME")
        password = os.getenv("PASSWORD")
        print(username,password)
        # Crear credenciales de usuario
        user_credentials = UserCredential(username, password)

        # Crear contexto de cliente de SharePoint
        ctx = ClientContext(site_url).with_credentials(user_credentials)

        # Llamar a la función obtener_lista_negra desde obtenerBaseExcel
        
        if not nombre_del_archivo:
            print("No se pudo obtener el nombre del archivo.")
            return

        # Construcción correcta de la ruta del archivo
        full_file_path = os.path.join(os.path.dirname(__file__), "uploads",nombre_del_archivo)

        # Verifica si el archivo existe antes de continuar
        if not os.path.exists(full_file_path):
            print(f"Error: El archivo '{full_file_path}' no se encuentra.")
            return

        # Abrir el archivo
        with open(full_file_path, 'rb') as file_content:
            # Obtener la carpeta de destino
            target_folder = ctx.web.get_folder_by_server_relative_url(destination_folder)

            # Subir el archivo
            target_folder.upload_file(os.path.basename(full_file_path),file_content).execute_query()

        print(f"Archivo {os.path.basename(full_file_path)} subido con éxito!")
    
    except Exception as e:
        print(f"Error al subir el archivo: {e}")
        import traceback
        traceback.print_exc()



# Bloque principal que se ejecutará cuando el archivo Python se ejecute
if __name__ == "__main__":
    import sys
    # Recibe argumentos desde la línea de comandos
    if len(sys.argv) > 2:
        site_url = sys.argv[1]
        destination_folder = sys.argv[2]
        file_name = sys.argv[3]
    

        print(f"site url py: {site_url} \n")
        print(f"destination_folder py: {destination_folder} \n")
        print(f"file_name py: {file_name} \n")
        

        upload_file_to_sharepoint(site_url, destination_folder, file_name)
    else:
        print("No se proporcionaron los argumentos necesarios.")