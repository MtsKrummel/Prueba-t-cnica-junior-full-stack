import { toast } from "sonner"
import { searchData } from "../services/search"
import { Data } from "../types"
import { useState, useEffect } from "react"
import { useDebounce } from "@uidotdev/usehooks"

const DEBOUNCE_TIME = 500

export const Search = ({initialData} : {initialData : Data}) => {
    
    const [data, setData] = useState<Data>(initialData)
    const [search, setSearch] = useState<string>(() => {
        const searchParams = new URLSearchParams(window.location.search)
        return searchParams.get('q') ?? ''
    })

    const debounceSearch = useDebounce(search, DEBOUNCE_TIME)

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value)
    }
    useEffect(() => {
        //Actualizar la url

        // if(search === ''){
        //     window.history.pushState({}, '', window.location.pathname)
        //     return
        // } 

        // window.history.pushState({}, '', `?q=${search}`)

        //Mejor forma:
        const newPathName = debounceSearch === ''
            ? window.location.pathname
            : `?q=${debounceSearch}`

        window.history.pushState({}, '', newPathName)
    },[debounceSearch])

    useEffect(() => {
        //LLamar a la api para filtrar los resultados

        if(!debounceSearch){
            setData(initialData)
            return
        }

        searchData(debounceSearch)
            .then(res => {
                const [err, newData] = res
                if(err){
                    toast.error(err.message)
                    return
                } 

                if(newData) return setData(newData)
            })
    }, [debounceSearch, initialData])

    return (
        <div>
            <h1>Search</h1>
            
            <form>
                <input
                    value={search}
                    type="search"
                    placeholder="Buscar información..."
                    onChange={handleSearch}
                />
            </form>

            <ul>
                {
                    data.map((row, key) => (
                        <li key={key}>
                            <article>
                                {
                                    Object
                                        .entries(row)
                                        .map(
                                            ([key, value]) => (
                                                <p key={key}>
                                                    <strong>{key}:</strong>{value}
                                                </p>
                                            )
                                        )
                                }
                            </article>
                        </li>
                    ))
                }
            </ul>
        </div>

    )
}