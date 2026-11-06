import { DetailPanel } from "@/components/DetailPanel";

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DetailPanel key={id} id={id} />;
}
