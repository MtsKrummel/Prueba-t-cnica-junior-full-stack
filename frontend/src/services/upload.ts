import { API_HOST } from "../config.ts"
import { type ApiUploadResponse, type Data } from "../types.ts"

// uploadFile toma un objeto File como parámetro y devuelve una promesa que se resuelve en una tupla que contiene un posible objeto Error y un posible objeto Data
export const uploadFile = async (file:File): Promise<[Error?, Data?]> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
        const res = await fetch(`${API_HOST}/api/files`, {
            method: 'POST',
            body: formData
        })

        if(!res.ok) return [new Error(`Error uploading file: ${res.statusText}`)]
        const json = await res.json() as ApiUploadResponse

        return [undefined, json.data]
    } catch (error) {
        if(error instanceof Error) return [error]
    } 

    return [new Error('Unknown error')]
}