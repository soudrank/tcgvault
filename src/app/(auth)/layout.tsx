export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 認証ページではサイドバー・BottomNavを表示しない
  return <>{children}</>;
}
