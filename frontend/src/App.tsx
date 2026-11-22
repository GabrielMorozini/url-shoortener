import './App.css'

function App() {
  return (
    <main id="center">
      <h1>URL SHORTENER</h1>

      <label className="url-input">
        <input type="url" placeholder="https://cole-sua-url.com" />
        <button>Encurtar</button>
      </label>
    </main>
  )
}

export default App