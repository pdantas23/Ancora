// client/src/features/catalog/pages/Catalog.tsx
import { useEffect } from "react";
import { useLocation } from "wouter";

type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
};

const products: Product[] = [
  { id: 1, name: "Produto Teste 1", price: 79.90, originalPrice: 100.00 },
  { id: 2, name: "Produto Teste 2", price: 59.90, originalPrice: 80.00 },
  { id: 3, name: "Produto Teste 3", price: 49.90 },
];

export default function Catalog() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Catálogo - Âncora";
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f5f0eb" }}>

      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
        <button onClick={() => setLocation("/")} className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 transition">
          ← Voltar
        </button>
        <h1 className="text-xl font-bold text-stone-900">Catálogo</h1>
        <div className="w-16" />
      </header>

      <main className="flex-1 px-6 py-8 mx-auto w-full max-w-5xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">
              <div className="aspect-square bg-stone-100 flex items-center justify-center">
                {product.image
                  ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  : <span className="text-sm text-stone-400">Sem imagem</span>
                }
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold text-stone-900 mb-2">{product.name}</p>
                <div className="flex items-center gap-2">
                  {product.originalPrice && (
                    <span className="text-xs text-stone-400 line-through">R$ {product.originalPrice.toFixed(2)}</span>
                  )}
                  <span className="text-sm font-bold" style={{ color: "#b8972a" }}>R$ {product.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center border-t border-stone-200">
        <p className="text-xs text-stone-400">© 2026 Dry Store. Todos os direitos reservados.</p>
        <p className="text-xs text-stone-400 mt-1">Case & Acessórios Premium</p>
      </footer>
    </div>
  );
}