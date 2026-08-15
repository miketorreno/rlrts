"use client";

import TwigCard from "@/components/twigs/card";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";

export default function TwigsPage() {
  const { isAuthenticated } = useConvexAuth();
  const twigs = useQuery(api.twigs.list, isAuthenticated ? {} : "skip");

  return (
    <div className="grid grid-cols-2 gap-8">
      {twigs?.map((twig) => (
        <Link key={twig._id} href={`twigs/${twig._id}`}>
          <TwigCard title={twig.name} />
        </Link>
      ))}
    </div>
  );
}
