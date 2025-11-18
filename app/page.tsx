import HeroSection from "@/src/components/HeroSection";
import { mockMovies } from "@/src/data/mockMovies";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      <HeroSection movies={mockMovies} />
      <div className="px-6 py-8 md:px-12 lg:px-16">
        {/* Content rows sẽ được thêm sau */}
      </div>
    </div>
  );
}
