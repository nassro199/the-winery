"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoWine } from "@icons/io5/IoWine";
import { IoWineOutline } from "@icons/io5/IoWineOutline";

import consts from "@/utils/consts";
import { getLogo } from "@/utils";
import { Database } from "@/supabase/types";
import { useToaster } from "@/providers/Toaster";
import { Button } from "@/components/Button";
import { B, C, RI } from "@/components/C";

import styles from "./styles.module.scss";

export function Content({ profile }: { profile:Database['public']['Tables']['profiles']['Row'] | null }) {
  const router = useRouter();
  const toaster = useToaster();

  const [clicks, setClicks] = useState<number>(0);
  const [hrtCls, setHrtCls] = useState<string>(styles.icon);

  const isBeating = hrtCls !== styles.icon;

  useEffect(() => {
    if (clicks) {
      setTimeout(() => {
        setClicks(0);
      }, 1500);
    }

    if (clicks >= 3) {
      setClicks(0);
      setHrtCls(isBeating ? styles.icon : `${hrtCls} ${styles.beating}`);
      toaster.add({ message: `Wish ${isBeating ? "giving someone a cardiac arrest" : "CPR"} was that easy...`});
    }
    }, [clicks, hrtCls, isBeating, toaster]);

  return (
    <>
      <div
        onClick={() => setClicks(c => c + 1)}
        className={hrtCls}
      >
        <Image
          src={getLogo("main")}
          alt={`${consts.name} logo; a purple heart suit with a sharp spiky hexagram on top`}
          className={styles.image}
          priority
        />
      </div>

      <h2 className={styles.hello}>Hello, there!</h2>
      <a href="https://youtu.be/rEq1Z0bjdwc" target="_blank" style={{ color: 'transparent', textDecoration: 'none' }}>
        General Kenobi!
      </a>

      <hr/>

      <div className={styles.desc}>
        <p>
          Welcome to <B title="Such a creative name, right?!"><C.ACCENT>{consts.name}</C.ACCENT></B> where,{' '}
          <span title="Kinda obvious">no sadly, we don't make wine</span>, but where we <span title="And other stuff too">whine!</span>
          <br/>
          <span title="Guess who doesn't care about your opinion? me!!">Close enough for me, I'll take it.</span>
        </p>

        <p>
          You can create and share pieces/posts (or as called here "cards") with others,
          the content of which is whatever pleases you and perhaps other since it's a <span title="☭">social platform.</span>
        </p>

        {
          profile?.username ?
            <p>
              Oh, you seem to be already logged in!
              Welcome back, <C.ACCENT>{profile?.username}</C.ACCENT>!
              <br/>
              No idea what brings you back here, but you're always welcome I guess, and we don't judge
              But aren't you like tired of repetition?
              You've been here once before it's kinda redundant...
              <br/>
              If you came back for the heart easter egg I don't blame you, well then, I don't blame you.
              You don't know what's that?! Dude... <RI><C.QUINARY>tsk tsk tsk</C.QUINARY></RI>.
            </p>
          :
            <p>
              To get started and ferment your own pieces, you can <Link href="/auth/login">log in</Link> to your account.
              Oh you don't have one? <span title="I mean, of course...">expected</span>; you can also <Link href="/auth/signup">create a new account</Link>!
              How fabulous!
            </p>
        }

        <p>
          {profile?.username ? "You" : "Then after that you"} can go ahead and compose some <RI><C.QUINARY>oeuvres d'art</C.QUINARY></RI>{profile?.username ? " though" : ""}:
        </p>
      </div>

      <Button
        title="Compose"
        icon={{ element: isBeating ? IoWine : IoWineOutline }}
        onClick={() => router.push('/compose')}
        className={styles.button}
        disabled={!profile?.username}
        noMinimum
      />
    </>
  );
}
