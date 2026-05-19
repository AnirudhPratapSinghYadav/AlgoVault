const ROWS = [
  { stage: 'Disaster declaration', trad: '3–10 days', algo: '0 days (auto-detected)' },
  { stage: 'Fund verification', trad: '4–8 weeks', algo: '< 2 hours (2 signatures)' },
  { stage: 'Beneficiary onboarding', trad: '2–6 weeks', algo: '0 (pre-verified)' },
  { stage: 'Funds reach victims', trad: '14–26 months', algo: '< 4 hours' },
  { stage: 'Audit trail', trad: 'Manual, weeks', algo: 'Instant, on-chain' },
] as const

export default function SpeedComparisonTable() {
  return (
    <section className="mb-8 overflow-hidden border border-border-subtle bg-bg-surface">
      <div className="border-b border-border-subtle px-5 py-4">
        <p className="font-[JetBrains_Mono] text-[10px] font-medium uppercase tracking-[0.14em] text-accent-primary">
          Why AlgoVault exists
        </p>
        <p className="mt-1.5 text-[13px] text-text-tertiary" style={{ fontFamily: 'Inter, sans-serif' }}>
          The same aid flow. Radically different timelines.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-5 py-3 text-left font-[JetBrains_Mono] text-[10px] uppercase tracking-wider text-text-tertiary w-[30%]">
                Stage
              </th>
              <th className="px-5 py-3 text-left font-[JetBrains_Mono] text-[10px] uppercase tracking-wider bg-[#1a0505] text-[#E63946] w-[35%]">
                Traditional Aid
              </th>
              <th className="px-5 py-3 text-left font-[JetBrains_Mono] text-[10px] uppercase tracking-wider bg-[#051a0a] text-[#2DC653] w-[35%]">
                AlgoVault
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.stage} className={i % 2 === 0 ? 'bg-bg-surface' : 'bg-bg-primary'}>
                <td className="px-5 py-3.5 text-[13px] text-text-secondary" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {row.stage}
                </td>
                <td className="px-5 py-3.5 bg-[#1a0505]/50">
                  <strong className="font-[Sora] text-[15px] font-bold text-[#E63946]">{row.trad}</strong>
                </td>
                <td className="px-5 py-3.5 bg-[#051a0a]/50">
                  <strong className="font-[Sora] text-[15px] font-bold text-[#2DC653]">{row.algo}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-border-subtle px-5 py-2.5 font-[JetBrains_Mono] text-[9px] text-text-tertiary">
        Sources: FEMA After-Action Reports · UN OCHA FTS · World Bank 2018–2024
      </p>
      <div
        className="mx-5 mb-5 border border-[rgba(45,198,83,0.2)] border-l-[3px] border-l-[#2DC653] px-4 py-3"
        style={{ background: 'rgba(45, 198, 83, 0.08)' }}
      >
        <p className="text-[13px] text-[#2DC653]" style={{ fontFamily: 'Inter, sans-serif' }}>
          AlgoVault is the missing infrastructure between these two columns.
        </p>
      </div>
    </section>
  )
}
