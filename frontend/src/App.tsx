import './App.css'

function App() {

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []
    console.log(file)

    // array file;
    // string str;
    // [file, ...str] = [1, 2, 3];
    // console.log(file) => 1;
    // console.log(str) => 2, 3;

    // [ 
    //   [1,2,3],
    //   [4,5,6],
    //   [4,5,6],
    //   [7,8,9]
    // ]
  }

  return (
    <>
      <h4>Challenge</h4>
      <div>
        <input onChange={handleInputChange} name='file' type="file" accept='.csv'/>
      </div>
    </>
  )
}

export default App
