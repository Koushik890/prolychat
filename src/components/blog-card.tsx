import { Post } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

export default function BlogCard({
  data,
  priority,
}: {
  data: Post;
  priority?: boolean;
}) {
  return (
    <Link href={`/blog/${data.slug}`} className="block h-full">
      <div className="bg-background rounded-lg p-4 border hover:shadow-sm transition-shadow duration-200 h-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
          {data.image && (
            <Image
              className="rounded-lg object-cover border w-full h-[200px]"
              src={data.image}
              width={1200}
              height={630}
              alt={data.title}
              priority={priority}
            />
          )}
          {!data.image && <div className="bg-gray-200 h-[200px] rounded" />}
        </div>
        <div className="flex flex-col flex-grow">
          <p className="mb-2 flex-shrink-0">
            <time
              dateTime={data.publishedAt}
              className="text-sm text-muted-foreground font-mona"
            >
              {formatDate(data.publishedAt)}
            </time>
          </p>
          <h3 className="text-xl font-semibold mb-2 font-hubot line-clamp-2 flex-shrink-0">{data.title}</h3>
          <p className="text-foreground font-mona line-clamp-3 flex-grow">{data.summary}</p>
        </div>
      </div>
    </Link>
  );
}

