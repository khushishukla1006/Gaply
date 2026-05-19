import { PaperDetail } from "@/components/PaperDetail";

interface PaperPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaperPage({ params }: PaperPageProps) {
  const { id } = await params;

  return (
    <div className="container py-8 md:py-12">
      <PaperDetail id={id} />
    </div>
  );
}
