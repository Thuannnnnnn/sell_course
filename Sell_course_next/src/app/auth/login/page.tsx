
import {auth, signIn } from "@/lib/auth"
import { redirect } from 'next/navigation'
import Button from 'react-bootstrap/Button';
export default async function SignIn() {
  const session = await auth();
  console.log(session)
  if(session){
    redirect('/')
  }
  return(
    <form
    action={async () => {
      "use server"
      await signIn("google")
    }}
  >
    <Button variant="primary" type="submit">Signin with Google</Button>
  </form>
  )
} 