import { SupportIcon } from "@/app/_components/icons";
import { PageStub } from "@/components/page-stub";

export default function SupportPage() {
  return (
    <PageStub
      title="Support"
      description="Reach platform support, browse runbooks, and review the status of any open incidents."
      Icon={SupportIcon}
    />
  );
}
