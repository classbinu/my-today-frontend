"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { AppContext } from "@/contexts/AppContext";
import { PostListCard } from "@/components/post/postListCard";
import { get } from "http";
import { getAccessTokenAndValidate } from "@/lib/utils";

export default function PostListPage() {
  const [isLoading, setIsLoading] = useState(false);
  const limit = 20;
  const { myOffset, setMyOffset } = useContext(AppContext);
  const { myPosts, setMyPosts } = useContext(AppContext);
  const { myAllDataLoaded, setMyAllDataLoaded } = useContext(AppContext);

  const fetchPosts = useCallback(async () => {
    if (myPosts.length > 0 && myPosts.length > myOffset) {
      return; // 이미 충분한 게시글이 로드되었으므로 fetch하지 않습니다.
    }

    if (isLoading) {
      console.log("already loading");
      return;
    }
    setIsLoading(true);
    try {
      const accessToken = await getAccessTokenAndValidate();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API}/posts/my?offset=${myOffset}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const newPosts = await response.json();

      if (newPosts.length < limit) {
        setMyAllDataLoaded(true);
      }
      // 특정 조건에서는 중복 렌더링 문제가 발생해서 중복 제거 로직을 추가함. offset 관리 방식 변경하면서 해결될 수도 있음.
      setMyPosts((prevPosts) => {
        const existingPostIds = new Set(prevPosts.map((post) => post.id));
        const uniqueNewPosts = newPosts.filter(
          (post) => !existingPostIds.has(post.id)
        );
        return [...prevPosts, ...uniqueNewPosts];
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [myPosts.length, myOffset, isLoading, setMyPosts, setMyAllDataLoaded]);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (
          window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 400 &&
          !myAllDataLoaded
        ) {
          setMyOffset((prevOffset) => prevOffset + limit);
        }
      }, 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [myAllDataLoaded, setMyOffset]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, myOffset, setMyPosts]);

  return (
    <>
      {myPosts.map((post) => (
        <PostListCard
          key={post.id}
          id={post.id}
          title={post.title}
          content={post.content}
        />
      ))}
    </>
  );
}
