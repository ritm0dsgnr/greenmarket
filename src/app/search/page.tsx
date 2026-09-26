import { redirect } from 'next/navigation'

/** Search lives in the header overlay; keep the old URL as a soft landing. */
export default function SearchPage() {
  redirect('/')
}
