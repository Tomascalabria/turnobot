import TransportComparator from '@/components/TransportComparator'

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold">TransBot 🚦</h1>
        <p className="text-sm text-gray-600">
          Ingresá origen y destino y compará cuánto te sale ir en auto propio, en colectivo, en Uber o
          en Cabify.
        </p>
      </header>
      <TransportComparator />
    </main>
  )
}
