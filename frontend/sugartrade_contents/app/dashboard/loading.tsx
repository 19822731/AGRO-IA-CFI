export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-[#1a2040] rounded"></div>
        <div className="h-5 w-48 bg-[#1a2040] rounded"></div>
      </div>

      <div className="border-b border-[#1a2040] mb-6">
        <div className="flex space-x-2 pb-2">
          <div className="h-8 w-20 bg-[#1a2040] rounded"></div>
          <div className="h-8 w-20 bg-[#1a2040] rounded"></div>
          <div className="h-8 w-20 bg-[#1a2040] rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#111936] rounded-lg p-6 border border-[#1a2040] h-28"></div>
        ))}
      </div>

      <div className="bg-[#111936] rounded-lg p-6 border border-[#1a2040]">
        <div className="h-7 w-48 bg-[#1a2040] rounded mb-2"></div>
        <div className="h-5 w-72 bg-[#1a2040] rounded mb-6"></div>
        <div className="h-[300px] bg-[#0a0f29] rounded"></div>
      </div>
    </div>
  )
}
