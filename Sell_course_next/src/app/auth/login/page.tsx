
import {auth, signIn, signOut } from "@/lib/auth"
import Button from 'react-bootstrap/Button';
export default async function SignIn() {
  const session = await auth();
  const user = session?.user;
  return user ?  (
    <>
    <h1>Wellcome {user.name}</h1>
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <Button variant="danger" type="submit">Sign Out</Button>
    </form>
    </>  
  ) : (
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