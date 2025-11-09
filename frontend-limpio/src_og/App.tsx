import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center font-sans text-white p-4">
      <div className="bg-slate-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center ring-1 ring-slate-700 max-w-lg w-full">
        
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
          ¡Tailwind CSS está funcionando!
        </h1>
        
        <p className="mt-6 text-slate-300">
          Si puedes ver este estilo (fondo oscuro, tarjeta centrada, texto en degradado), significa que tus archivos de configuración manual:
          <br />
          <code className="bg-slate-700 text-sky-300 rounded px-2 py-1 mt-2 inline-block">tailwind.config.js</code> y <code className="bg-slate-700 text-sky-300 rounded px-2 py-1 inline-block">postcss.config.js</code>
          <br />
          fueron creados y están siendo leídos correctamente por Vite.
        </p>
        
        <div className="mt-10">
          <button className="px-8 py-4 bg-sky-500 text-white font-bold rounded-full shadow-lg hover:bg-sky-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-sky-300">
            ¡Misión Cumplida!
          </button>
        </div>

      </div>
    </div>
  )
}

export default App
