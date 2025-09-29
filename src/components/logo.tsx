import Image from "next/image";

export function LMSLogo({ size = 16 }: { size?: number }) {
  return (
    <div className="">
      <Image alt="" src={"/logo.png"} width={30} height={30} />
    </div>
  );
}
