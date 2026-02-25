import ClaimForm from "./ClaimForm";

export default async function ClaimPage({
  params,
}: {
  params: { token: string } | Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ClaimForm token={token} />;
}