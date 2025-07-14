import { getCsrfToken, signIn } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import { useState } from 'react';

export default function Login({ csrfToken }: { csrfToken: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form
      method="post"
      onSubmit={(e) => {
        e.preventDefault();
        signIn('credentials', { email, password, callbackUrl: '/dashboard/overview' });
      }}
    >
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button type="submit">Sign in</button>
    </form>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
};
