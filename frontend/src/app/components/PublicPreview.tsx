"use client";

const MOCK_POSTS = [
  {
    author: "Chico do Armazém",
    content: "Ouve lá, não vais acreditar no que o gajo dos Recursos Humanos disse depois da terceira bifana... ele jurou que se o patrão soubesse que...",
    color: "#C4122E"
  },
  {
    author: "Eng. Arnaldo",
    content: "Psst... ó tu que estás aí a olhar pelo vidro com cara de quem quer e não pode. A cerveja está gelada e o lugar ao lado do balcão ainda está vago. Vais ficar aí a apanhar frio?",
    color: "#1A1A1A"
  },
  {
    author: "Maria do IT",
    content: "Atenção freguesia: acabei de apanhar um curioso a ler esta posta lá fora. Que falta de chá! Entra mas é na Tasca se queres saber o resto do bitaite.",
    color: "#E5B044"
  }
];

export function PublicPreview() {
  return (
    <div className="relative max-w-xl mx-auto mt-12 px-6">
      <h3 className="text-[#E5B044] text-xs font-black uppercase tracking-[0.2em] mb-6 text-center opacity-70">
        — O que se diz na mesa 3 —
      </h3>

      <div className="space-y-6 relative">
        {MOCK_POSTS.map((post, i) => (
          <div
            key={i}
            className="bg-[#F5E6D3]/5 border border-[#F5E6D3]/10 p-5 rounded-2xl text-left shadow-2xl transition-all duration-500"
            style={{
              filter: `blur(${i * 1.5}px)`,
              opacity: 1 - i * 0.2,
              transform: `scale(${1 - i * 0.03}) translateY(-${i * 10}px)`
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center text-[10px] font-black text-white"
                style={{ backgroundColor: post.color }}
              >
                {post.author.charAt(0)}
              </div>
              <span className="text-sm font-bold text-[#F5E6D3] italic opacity-80">
                {post.author}
              </span>
            </div>
            <p className="text-[#F5E6D3] text-base leading-relaxed font-medium italic">
              "{post.content}"
            </p>
          </div>
        ))}

        {/* EFEITO DE VIDRO FOSCADO EM CIMA DO ÚLTIMO POST */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/90 to-transparent flex items-end justify-center pb-8">
           <div className="backdrop-blur-[2px] absolute inset-0 pointer-events-none"></div>

           <div className="relative z-10 text-center">
             <p className="text-[#F5E6D3] text-sm font-bold mb-4 drop-shadow-lg">
                O balcão está ao rubro e tu aí fora...
             </p>
           </div>
        </div>
      </div>
    </div>
  );
}
