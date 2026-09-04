import { redirect } from 'next/navigation'

export default function BlogEventsRedirectPage() {
  redirect('/blog?type=events')
}
