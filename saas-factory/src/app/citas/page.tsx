import Link from 'next/link'

export default function CitasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950">
      <header className="border-b border-slate-800 py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <Link href="/" className="text-slate-400 hover:text-white">
            ← Volver a Flash Clinic
          </Link>
        </div>
      </header>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Agenda tu cita médica
          </h1>
          <p className="text-2xl text-slate-300 mb-12">
            Sin llamadas. Sin esperas. 100% online.
          </p>

          <Link 
            href="/citas/agendar"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-lg"
          >
            Agendar ahora →
          </Link>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Nuestros especialistas
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">👨‍⚕️</p>
              <p className="text-xl font-semibold text-white">Dr. Juan Pérez</p>
              <p className="text-slate-400">Medicina General</p>
              <p className="text-sm text-slate-500 mt-2">★★★★★ 127 reseñas</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">👩‍⚕️</p>
              <p className="text-xl font-semibold text-white">Dra. María González</p>
              <p className="text-slate-400">Odontología</p>
              <p className="text-sm text-slate-500 mt-2">★★★★★ 203 reseñas</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">👨‍⚕️</p>
              <p className="text-xl font-semibold text-white">Dr. Carlos Ramírez</p>
              <p className="text-slate-400">Pediatría</p>
              <p className="text-sm text-slate-500 mt-2">★★★★★ 89 reseñas</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/citas/agendar"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-lg"
            >
              Agendar cita →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
