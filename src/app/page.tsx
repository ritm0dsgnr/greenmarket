import { HomeCatalog } from '@/components/HomeCatalog'
import { HomeHero } from '@/components/HomeHero'
import { HomeNovelties } from '@/components/HomeNovelties'

export default function HomePage() {
  return (
    <main className="page">
      <HomeHero />
      <HomeNovelties />
      <HomeCatalog />
    </main>
  )
}
