import { redirect } from 'next/navigation'

export default function BlogNewsRedirectPage() {
  redirect('/blog?type=news')
}
