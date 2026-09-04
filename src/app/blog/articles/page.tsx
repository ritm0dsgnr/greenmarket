import { redirect } from 'next/navigation'

export default function BlogArticlesRedirectPage() {
  redirect('/blog?type=articles')
}
