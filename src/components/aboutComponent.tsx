import { useBearStore } from "@/stores/pengajuanTransporterStore";
import Link from "next/link";

export function Controls() {
  const bears: any = useBearStore();
  return (
    <div>
      <button onClick={() => bears.increasePopulation()}>one up</button>
      <Link href={"/about/no2"}>nextpage</Link>
    </div>
  );
}
