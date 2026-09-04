import { JournalCardSlider } from '@/components/content/JournalCardSlider'
import { getHomeJournalSliderItems, journalItems } from '@/content/journal'

export function HomeJournal() {
  const items = getHomeJournalSliderItems(journalItems)

  return (
    <JournalCardSlider
      title="Журнал"
      titleId="home-journal-title"
      items={items}
      prevLabel="Предыдущие материалы журнала"
      nextLabel="Следующие материалы журнала"
      pagesLabel="Пагинация журнала на главной"
      pageName="Материал"
    />
  )
}
