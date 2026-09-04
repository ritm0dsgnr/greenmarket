import { HomeAbout } from '@/components/HomeAbout'
import { HomeCatalog } from '@/components/HomeCatalog'
import { HomeHero } from '@/components/HomeHero'
import { HomeJournal } from '@/components/HomeJournal'
import { HomeNovelties } from '@/components/HomeNovelties'

export default function HomePage() {
  return (
    <main className="page">
      <HomeHero />
      <HomeNovelties />
      <HomeCatalog />
      <HomeAbout />
      <HomeJournal />
    </main>
  )
}
