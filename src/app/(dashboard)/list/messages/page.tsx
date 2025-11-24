//@ts-nocheck
export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Message, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import FilterSort from "@/components/FilterSort";

type MessageList = Message;

const MessageListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const conditions: Prisma.MessageWhereInput[] = [];

  // URL PARAMS CONDITION
  if (queryParams.search) {
    conditions.push({
      OR: [
        { title: { contains: queryParams.search, mode: "insensitive" } },
        { content: { contains: queryParams.search, mode: "insensitive" } },
      ],
    });
  }

  if (queryParams.senderId) {
    conditions.push({ senderId: queryParams.senderId });
  }

  if (queryParams.receiverId) {
    conditions.push({ receiverId: queryParams.receiverId });
  }

  if (queryParams.senderType) {
    //@ts-expect-error string is not assignable to type RecieverType
    conditions.push({ senderType: queryParams.senderType });
  }

  if (queryParams.receiverType) {
    //@ts-expect-error string is not assignable to type RecieverType
    conditions.push({ receiverType: queryParams.receiverType });
  }

  // ROLE CONDITIONS - Users can only see messages they sent or received
  if (role !== "admin") {
    conditions.push({
      OR: [{ senderId: currentUserId! }, { receiverId: currentUserId! }],
    });
  }

  // Combine all conditions with AND
  const query: Prisma.MessageWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const [data, count] = await prisma.$transaction([
    prisma.message.findMany({
      where: query,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.message.count({ where: query }),
  ]);

  // Mark messages as read when viewed (for receiver)
  if (data.length > 0) {
    const unreadMessages = data.filter(
      (msg) => !msg.read && msg.receiverId === currentUserId
    );

    if (unreadMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: unreadMessages.map((msg) => msg.id) },
          receiverId: currentUserId!,
        },
        data: { read: true },
      });
    }
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Messages</h1>
        <div className="flex flex-col md:flex-row items-center mb-8 gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterSort />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="message" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search messages..."
      />
      {/* PAGINATION */}
      {/* <Pagination page={p} count={count} /> */}
    </div>
  );
};

export default MessageListPage;
