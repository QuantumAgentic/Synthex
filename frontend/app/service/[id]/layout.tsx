import { Providers } from '../../providers';

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
