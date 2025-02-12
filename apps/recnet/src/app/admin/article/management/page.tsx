"use client";

import { Button, Flex, TextField } from "@radix-ui/themes";
import { useState } from "react";
import { toast } from "sonner";

import { trpc } from "@recnet/recnet-web/app/_trpc/client";
import { cn } from "@recnet/recnet-web/utils/cn";

import { Article } from "@recnet/recnet-api-model";

import { ArticleManagementForm } from "./ArticleManagementForm";

import { AdminSectionBox, AdminSectionTitle } from "../../AdminSections";

export default function ArticleManagementPage() {
  const [searchUrl, setSearchUrl] = useState("");
  const [foundArticle, setFoundArticle] = useState<Article | null>(null);

  const getArticleQuery = trpc.getArticleByLink.useQuery(
    { link: searchUrl, useDigitalLibrary: false },
    {
      enabled: false,
      retry: false,
    }
  );

  const handleSearch = async () => {
    setFoundArticle(null);
    if (!searchUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    const { data } = await getArticleQuery.refetch();

    if (data?.article) {
      setFoundArticle(data.article);
    } else {
      toast.error("No article found with the given URL.");
      setFoundArticle(null);
    }
  };

  const handleCloseForm = () => {
    setFoundArticle(null);
  };

  return (
    <div
      className={cn("w-full sm:w-[90%] md:w-[70%]", "flex flex-col gap-y-6")}
    >
      <AdminSectionBox>
        <AdminSectionTitle description="Please enter an article URL to manage.">
          Search Article by URL
        </AdminSectionTitle>
        <Flex className="gap-x-2 w-full mt-2">
          <TextField.Root
            placeholder="Enter article URL, e.g. https://example.com/your-article-link"
            value={searchUrl}
            onChange={(e) => setSearchUrl(e.target.value)}
            className="w-full"
          />
          <Button onClick={handleSearch} disabled={getArticleQuery.isFetching}>
            {getArticleQuery.isFetching ? "Searching..." : "Search"}
          </Button>
        </Flex>
      </AdminSectionBox>

      {foundArticle && (
        <AdminSectionBox>
          <AdminSectionTitle description="You can edit or delete this article.">
            Edit Found Article
          </AdminSectionTitle>

          <ArticleManagementForm
            currentArticle={foundArticle}
            onSubmitFinish={() => {
              handleCloseForm();
            }}
          />
        </AdminSectionBox>
      )}
    </div>
  );
}
