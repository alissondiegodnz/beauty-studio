export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2">
          <div className="w-4 h-4 bg-[#D6AAAB] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-4 h-4 bg-[#e6d5b8] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-[#d4c5aa] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-gray-700 font-medium">Carregando...</p>
      </div>
    </div>
  );
}