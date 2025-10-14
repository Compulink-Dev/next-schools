export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Message } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type MessageWithDetails = Message;

const SingleMessagePage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const message: MessageWithDetails | null = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    return notFound();
  }

  // Mark as read if current user is the receiver
  if (!message.read && message.receiverId === currentUserId) {
    await prisma.message.update({
      where: { id },
      data: { read: true },
    });
  }

  const isSender = message.senderId === currentUserId;
  const isReceiver = message.receiverId === currentUserId;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* MESSAGE HEADER */}
      <div className="bg-white rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">{message.title}</h1>
          {(role === "admin" || isSender) && (
            <FormContainer table="message" type="update" data={message} />
          )}
        </div>

        {/* MESSAGE METADATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lamaSky flex items-center justify-center">
                <Image src="/sender.png" alt="Sender" width={20} height={20} />
              </div>
              <div>
                <p className="font-medium text-gray-700">From</p>
                <p className="capitalize">
                  {message.senderType} • {message.senderId}
                  {isSender && (
                    <span className="text-blue-600 ml-2">(You)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-lamaPurple flex items-center justify-center">
                <Image
                  src="/receiver.png"
                  alt="Receiver"
                  width={20}
                  height={20}
                />
              </div>
              <div>
                <p className="font-medium text-gray-700">To</p>
                <p className="capitalize">
                  {message.receiverType} • {message.receiverId}
                  {isReceiver && (
                    <span className="text-green-600 ml-2">(You)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TIMESTAMP */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
          <div>
            <strong>Sent:</strong>{" "}
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "full",
              timeStyle: "short",
            }).format(message.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                message.read
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {message.read ? "Read" : "Unread"}
            </span>
            {message.updatedAt !== message.createdAt && (
              <span className="text-xs">
                Updated:{" "}
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(message.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MESSAGE CONTENT */}
      <div className="bg-white rounded-md p-6 flex-1">
        <h2 className="text-lg font-semibold mb-4">Message Content</h2>
        <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>

      {/* ACTIONS & QUICK LINKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* QUICK ACTIONS */}
        <div className="bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            {isReceiver && (
              <button className="w-full text-left p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors text-sm">
                📧 Reply to Message
              </button>
            )}
            <Link
              href={`/list/messages?senderId=${message.senderId}`}
              className="w-full text-left p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors text-sm"
            >
              👤 View All Messages from {isSender ? "You" : "This Sender"}
            </Link>
            <Link
              href="/list/messages"
              className="w-full text-left p-3 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
            >
              📋 Back to All Messages
            </Link>
          </div>
        </div>

        {/* MESSAGE INFO */}
        <div className="bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Message Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Message ID</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {message.id.slice(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span
                className={`font-semibold ${
                  message.read ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {message.read ? "Read" : "Unread"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Direction</span>
              <span className="font-semibold">
                {isSender ? "Outgoing" : isReceiver ? "Incoming" : "Admin View"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Characters</span>
              <span className="font-semibold">{message.content.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* REPLY SECTION - For receivers */}
      {isReceiver && (
        <div className="bg-white rounded-md p-6">
          <h2 className="text-lg font-semibold mb-4">Reply to Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response
              </label>
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-lamaSky focus:border-transparent"
                placeholder="Type your response here..."
              />
            </div>
            <div className="flex gap-3">
              <button className="bg-lamaSky text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-lamaSkyDark transition-colors">
                Send Reply
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                Save Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleMessagePage;
