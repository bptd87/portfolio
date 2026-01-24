import { redirect } from "next/navigation";

export default function PostRedirect() {
  redirect("/articles");
}
