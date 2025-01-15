import pandas as pd
import sys
import json
from io import BytesIO

def excel_json(contenido_archivo):
    # Convierte el buffer en un archivo Excel
    archivo_excel = BytesIO(contenido_archivo)

    # Lee el archivo Excel desde el buffer (especificar motor 'openpyxl' para archivos .xlsx)
    df = pd.read_excel(archivo_excel, engine='openpyxl')

    # Convierte cada fila del DataFrame a un diccionario
    data = df.to_dict(orient='records')

    # Crear una lista de diccionarios convertidos en un formato adecuado para el JSON
    json_data = []
    for row in data:
        json_row = {}
        for key, value in row.items():
            json_row[key] = str(value).replace(',', '|')  # Reemplaza las comas con '|'
        json_data.append(json_row)

    # Devuelve el resultado como un JSON en formato string
    return json.dumps(json_data, indent=4)

if __name__ == "__main__":
    # Leer el contenido del archivo desde stdin
    contenido_archivo = sys.stdin.buffer.read()

    # Llamar a la función con el contenido del archivo
    json_result = excel_json(contenido_archivo)
    
    # Imprimir el resultado en formato JSON
    print(json_result)
