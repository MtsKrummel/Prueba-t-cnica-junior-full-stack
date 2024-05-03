import './App.css'
import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { uploadFile } from './services/upload.ts'
import { type Data } from './types.ts'
import { Search } from './steps/Search.tsx'

//Mi aplicación va a tener diferentes estados, entonces vamos a hacer que nuestra UI (user interface) tenga distintos pasos.

const APP_STATUS = {
  INITIAL : 'initial', // Al entrar
  ERROR: 'error', // Cuando hay un error
  READY_UPLOAD: 'ready_upload', // Al elegir el archivo
  UPLOADING: 'uploading', // Mientras se sube
  READY_USAGE: 'ready_usage' // Después de subir
} as const 

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD] : 'Subir archivo',
  [APP_STATUS.UPLOADING] : 'Subiendo archivo...'
}

type AppStatusType = typeof APP_STATUS[keyof typeof APP_STATUS]

function App() {

  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.INITIAL)
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<Data>([])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []
    
    if(file){
      setFile(file)
      // Estás intentando asignar un valor de tipo "ready_upload" a un estado que está tipado como "initial" --> const [appStatus, setAppStatus] = useState(APP_STATUS.INITIAL)
      // Entonces cuando intentas cambiar el estado con setAppStatus(APP_STATUS.READY_UPLOAD), estás tratando de asignar un valor de tipo "ready_upload" a un estado que se espera que sea de tipo "initial", lo cual genera el error.
      // Para solucionar este error, asegúrate de que el estado appStatus y el valor que intentas asignar con setAppStatus tengan el mismo tipo. 
      setAppStatus(APP_STATUS.READY_UPLOAD)
    }

  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if(appStatus !== APP_STATUS.READY_UPLOAD || !file){
      return
    }
    setAppStatus(APP_STATUS.UPLOADING)

    const [err, newData] = await uploadFile(file)
    
    console.log({ newData })

    if(err){
      setAppStatus(APP_STATUS.ERROR)
      toast.error(err.message)
      return
    }

    setAppStatus(APP_STATUS.READY_USAGE)
    if(newData){
      setData(newData)
    }
    toast.success('Archivo subido correctamente')
  }

  const showBottom = appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING 
  const showInput = appStatus !== APP_STATUS.READY_USAGE

  return (
    <>
    <Toaster />
      <h4>Challenge</h4>
      {
        showInput && (
          <form onSubmit={handleSubmit}>
            <label>
              <input
                disabled={appStatus === APP_STATUS.UPLOADING} 
                onChange={handleInputChange} 
                name='file' 
                type="file" 
                accept='.csv'/>
            </label>

            {
              showBottom && (
                <button disabled={appStatus === APP_STATUS.UPLOADING}>
                  {BUTTON_TEXT[appStatus]}
                </button>
              )
            }
          </form>
        )
      }

      {
        appStatus === APP_STATUS.READY_USAGE && (
          <Search initialData={data} />
        )
      }

    </>
  )
}

export default App
