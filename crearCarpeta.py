from office365.sharepoint.client_context import ClientContext

def crear_carpeta(parent_folder_url, new_folder_name, ctx):
    """Crea una carpeta en SharePoint si no existe."""
    # Obtener la carpeta donde se creará la nueva carpeta
    parent_folder = ctx.web.get_folder_by_server_relative_url(parent_folder_url)

    # Verificar si la carpeta ya existe
    try:
        existing_folder = parent_folder.folders.get_by_name(new_folder_name)
        ctx.load(existing_folder)
        ctx.execute_query()
        print(f"La carpeta '{new_folder_name}' ya existe.")
    
    except Exception:
        # Si la carpeta no existe, crearla
        parent_folder.folders.add(new_folder_name)
        ctx.execute_query()
        print(f"Carpeta '{new_folder_name}' creada con éxito.")