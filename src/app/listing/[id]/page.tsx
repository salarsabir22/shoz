import { ListingDetail } from "./listing-detail";

export default function ListingPage({ params }: { params: { id: string } }) {
  return <ListingDetail listingId={params.id} />;
}
