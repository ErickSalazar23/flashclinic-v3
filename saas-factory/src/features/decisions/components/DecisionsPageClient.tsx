'use client'

import { Decision } from '../types'
import { DecisionCard } from './DecisionCard'
import { useRouter } from 'next/navigation'

interface DecisionsPageClientProps {
  decisions: Decision[]
}

export function DecisionsPageClient({ decisions }: DecisionsPageClientProps) {
  const router = useRouter()

  const handleUpdate = () => {
    router.refresh()
  }

  const highPriority = decisions.filter(d => d.priority === 'high')
  const mediumPriority = decisions.filter(d => d.priority === 'medium')
  const lowPriority = decisions.filter(d => d.priority === 'low')

  return (
    <div className="space-y-8">
      {highPriority.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Prioridad Alta ({highPriority.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {highPriority.map(decision => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </section>
      )}

      {mediumPriority.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            Prioridad Media ({mediumPriority.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {mediumPriority.map(decision => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </section>
      )}

      {lowPriority.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Prioridad Baja ({lowPriority.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {lowPriority.map(decision => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
