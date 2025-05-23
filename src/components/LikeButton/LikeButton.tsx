"use client";

import { useContext, useState } from "react";
import { Like } from "@/lib/like";
import { Heart } from "lucide-react";
import { setCookieClientSide } from "@/lib/cookiesClient";
import { getRelativeDate } from "@/utils/getRelativeDate";
import { HasLikedKey } from "@/constants/app";
import { DictionariesContext } from "@/utils/DictionariesProvider";
import { makeWordEnding } from "@/utils/makeWordEnding";

const likedClassNames = "bg-rose-950 text-rose-500";
const defaultClassNames = "bg-neutral-800 hover:bg-neutral-700";

export default function LikeButton({
    likes,
    initialStatus,
}: {
    likes: number | null;
    initialStatus: "liked" | null;
}) {
    const { dictionaries } = useContext(DictionariesContext);
    const [isLoading, setIsLoading] = useState(false);
    const [likesData, setLikesData] = useState<{
        count: number | null;
        action: "liked" | "disliked" | null;
    }>({
        count: likes,
        action: initialStatus,
    });
    const status = likesData.action;
    const likesWord = makeWordEnding({
        replies: likesData.count ?? 0,
        wordTypes: [
            dictionaries?.["components.like-button.likes-single"] as string,
            dictionaries?.["components.like-button.likes-few"] as string,
            dictionaries?.["components.like-button.likes-many"] as string,
        ],
    });

    async function handleClick(currentStatus: typeof status) {
        if (isLoading) {
            return;
        }

        const action = currentStatus === "liked"
            ? "dislike"
            : "like";

        setIsLoading(true);

        const { action: changedStatus, count } = await Like({ action });

        if (action === "like") {
            setCookieClientSide({
                key: HasLikedKey,
                value: "yeah bro",
                expiresAt: getRelativeDate({ days: 365 }),
                httpOnly: false,
            });
        } else {
            setCookieClientSide({
                key: HasLikedKey,
                value: "",
                expiresAt: getRelativeDate({ milliseconds: 0 }),
                httpOnly: false,
            });
        }

        setLikesData({
            action: changedStatus,
            count,
        });
        setIsLoading(false);

        return;
    }

    return (
        <>
            <button
                className={`${status === "liked" ? likedClassNames : defaultClassNames} px-2 py-1 rounded-full flex items-center transition cursor-pointer active:opacity-60 active:cursor-default disabled:opacity-60 disabled:cursor-default gap-2`}
                onClick={() => handleClick(status)}
                disabled={isLoading}
                aria-label={`${likesData.count ?? "?"} ${likesWord}`}
                title={`${likesData.count ?? "?"} ${likesWord}`}
            >
                <Heart className="shrink-0" size={18} />
                <p>
                    {
                        likesData.count === null
                            ? dictionaries?.["components.like-button.error"]
                            : likesData.count
                    }
                </p>
            </button>
        </>
    );
}