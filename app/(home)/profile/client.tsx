'use client';
import { ChangeEventHandler, useRef, useState } from "react";
import Image from "next/image";
import { GoPencil, GoTrash } from "react-icons/go";
import { IoBuildOutline, IoEllipsisHorizontalOutline, IoSaveOutline } from "react-icons/io5";

import { cropAvatar, focusable } from "@/utils";
import { Bio, Button, C } from "@/components";
import { Database } from "@/supabase/types";

import styles from "./styles.module.scss";


const LabelTitle = ({ title, subtitle }:{ title:string; subtitle?:string; }) => {
  return (
    <span>
      <C.ACCENT>
        {'> '}
      </C.ACCENT>
      {title}
      {
        subtitle ?
          <C.SECONDARY style={{ fontSize: 12 }}>
            {` (${subtitle})`}
          </C.SECONDARY>
        : null
      }
    </span>
  );
};

export function UserInfo({ user }:{ user:Database['public']['Tables']['users']['Row'] }) {
  const [editing, setEditing] = useState<boolean>(false);
  const [avatarData, setAvatarData] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>(user.display_name ?? user.username);
  const [bio, setBio] = useState<string>(user.bio);

  const imgInputRef = useRef<HTMLInputElement>(null);

  const onSubmitImage:ChangeEventHandler<HTMLInputElement> = e => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file)
      return;

    const reader = new FileReader;
    reader.readAsDataURL(file);
    reader.onload = r => {
      cropAvatar(reader.result as string, s => {
        setAvatarData(s);
      });
    };
  }

  const handleEditButton = async () => {
    if (editing)
      alert("still working on it...");

    setEditing(e => !e);
  };
  return (
    <>
      <div className={`${styles.avatar} ${editing ? styles.editing : ""}`}>
        <Image
          alt={`${user.username}'s profile picture.`}
          src={editing ? avatarData ?? user.avatar : user.avatar}
          width={128}
          height={128}
        />
        {
          editing ?
          <div className={styles.avatarEdit} {...focusable(styles.active, () => imgInputRef.current?.click())}>
            <div className={styles.avatarEditIcon}>
              <GoPencil />
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={onSubmitImage}
              ref={imgInputRef}
            />
          </div>
          : null
        }
        {
          editing && avatarData ?
          <div className={styles.avatarRemoveIcon} {...focusable("", () => setAvatarData(null))}>
            <GoTrash />
          </div>
          : null
        }
      </div>
      {
        editing ?
        <div className={styles.form}>
          <label>
            <LabelTitle title="Display name"/>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onBlur={() => setDisplayName(d => d.trim())}
              name="username"
              autoComplete="off"
              spellCheck={false}
              type="text"
              placeholder={(user.display_name ?? user.username) + ` (max. 32)`}
              maxLength={32}
            />
            <div className={styles.maxLength}>
              <C.SECONDARY>
                { displayName.length === 0 || displayName.length === 32 ?
                  <C.RED>{displayName.length}</C.RED> :
                  <C.ACCENT>{displayName.length}</C.ACCENT> }
                /32
              </C.SECONDARY>
            </div>
          </label>
          <label>
            <LabelTitle title="About me"/>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              onBlur={() => setBio(b => b.trim())}
              name="description"
              autoComplete="off"
              placeholder={user.bio + ` (max. 256)`}
              maxLength={256}
            />
            <div className={styles.maxLength}>
              <C.SECONDARY>
                { bio.length === 0 || bio.length === 256 ?
                  <C.RED>{bio.length}</C.RED> :
                  <C.ACCENT>{bio.length}</C.ACCENT> }
                /256
              </C.SECONDARY>
            </div>
          </label>
        </div>
        :
        <div className={styles.textStuff}>
          <div className={styles.names}>
            <span>
              {user.display_name ?? user.username}
            </span>
            <span>
              <C.QUINARY>
                u:
              </C.QUINARY>
              <C.ACCENT>
                {user.username}
              </C.ACCENT>
            </span>
          </div>
          <Bio content={user.bio} />
        </div>
      }
      <div className={styles.buttonRack}>
        <Button
          title={editing ? "Save Changes" : "Edit Profile"}
          icon={{ element: editing ? IoSaveOutline : IoBuildOutline }}
          className={styles.button}
          onClick={handleEditButton}
          noBrackets
          noMinimum
        />
        <Button
          icon={{ element: IoEllipsisHorizontalOutline }}
          className={`${styles.button} ${styles.bigIcon}`}
          iconBackground
          noMinimum
        />
      </div>
    </>
  );
}
