import { getSession } from "@/lib/session";
import { getAnnouncement } from "@/lib/content";
import { getNavMenus } from "@/lib/navigation";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const [menus, session, announcement] = await Promise.all([getNavMenus(), getSession(), getAnnouncement()]);
  return <HeaderClient menus={menus} session={session} announcement={announcement} />;
}
