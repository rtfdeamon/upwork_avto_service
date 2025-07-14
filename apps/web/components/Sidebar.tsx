import Link from 'next/link';

export default function Sidebar() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/dashboard/overview">Overview</Link>
        </li>
        <li>
          <Link href="/dashboard/rulesets">Rulesets</Link>
        </li>
        <li>
          <Link href="/dashboard/apikeys">API Keys</Link>
        </li>
        <li>
          <Link href="/dashboard/drafts">Drafts</Link>
        </li>
        <li>
          <Link href="/dashboard/conversations">Conversations</Link>
        </li>
        <li>
          <Link href="/dashboard/billing">Billing</Link>
        </li>
      </ul>
    </nav>
  );
}
