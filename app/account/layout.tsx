import { requireCustomer } from "@/lib/customer-auth";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCustomer();
  
  return <>{children}</>;
}
