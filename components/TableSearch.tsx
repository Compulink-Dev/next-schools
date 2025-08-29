"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";

const TableSearch = () => {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = (e.currentTarget[0] as HTMLInputElement).value;

    const params = new URLSearchParams(window.location.search);
    params.set("search", value);
    router.push(`${window.location.pathname}?${params}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-auto flex items-center gap-2 text-xs"
    >
      <Image src="/search.png" alt="" width={14} height={14} />
      <Input type="text" placeholder="Search..." className="w-[200px]" />
    </form>
  );
};

export default TableSearch;
