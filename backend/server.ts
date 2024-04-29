import express from 'express'
import cors from 'cors'
//Multer es un "middleware" de node.js para el manejo de multipart/form-data, el cuál es usado sobre todo para la subida de archivos. Funciona interceptando las solicitudes entrantes que contienen archivos, como formularios de carga, y los procesa para que puedas trabajar fácilmente con estos archivos en tu aplicación.
import multer from 'multer'
import csvToJson from 'convert-csv-to-json'


const app = express()
const port = process.env.PORT ?? 3000

//multer.memoryStorage(), significa que los archivos se almacenarán en la memoria del servidor como buffers. Esto es útil para procesar archivos pequeños o realizar operaciones en los archivos antes de guardarlos en un sistema de archivos o base de datos. 

//Cuando una solicitud con archivos llega al servidor, Multer procesa los archivos según la configuración proporcionada (en este caso, el almacenamiento en memoria). Esto incluye la extracción de los archivos del cuerpo de la solicitud y la disponibilidad de los mismos a través del objeto req.file o req.files en tus rutas o controladores.
const storage = multer.memoryStorage()

//Crea una instancia de Multer con una configuración específica de almacenamiento, en este caso, utilizando memoryStorage. Esto significa que los archivos cargados se almacenarán temporalmente en la memoria del servidor como buffers. La variable upload se convierte en un middleware que puede ser utilizado en rutas específicas de Express para manejar la carga de archivos.
const upload = multer({ storage })

let userData: Array<Record <string, string>> = []

app.use(cors())

app.post('/api/files', upload.single('file'), async (req, res) => {
    //1. Extract file from request
    const { file } = req
    //2. Validate that we have file
    if(!file){
        return res.status(500).json({ message: 'File is required' })
    }
    //3. Validate the mimetype (csv)
    if(file.mimetype != 'text/csv'){
        return res.status(500).json({ message: 'File must be CSV' })
    }

    let json: Array<Record <string, string>> = []
    try {
        //4. Transform the file (Buffer) to string
        const csvString = Buffer.from(file.buffer).toString('utf-8')
        // file.buffer.toString('utf-8') --> Verificar si es más rápido esta forma de convertir el buffer a string en el testing.

        //5. Transform string (csv) to JSON
        json = csvToJson.csvStringToJson(csvString)
    } catch (error) {
        return res.status(500).json({ message: 'Error parsing the file' })
    }
    //6. Save the JSON to db (or memory)
    userData = json

    //7. Return 200 with the message and the JSON
    return res.status(200).json({ data:[], message: 'El archivo se cargó correctamente' })
})

app.get('/api/users/', async (req, res) => {
    //1. Extract the query param 'q' from the request
    const { q } = req.query  
    //2. Validate that we have the query param
    if(!q){
        return res.status(500).json({ message: "Query param 'q' is required" })
    }

    if(Array.isArray(q)){
        return res.status(500).json({ message: "Query param 'q' must be a string" })
    }

    //3. Filter the data from the db (or memory) with the query param
    
    const search = q.toString().toLowerCase().trim()

    const filterdData = userData.filter(row => {
        return Object
                .values(row)
                .some(value => value.toLowerCase().includes(search))
    })

    //4. Return 200 with the filtered data
    return res.status(200).json({ data: filterdData })
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})
