import { redirect } from "next/navigation";

export default function AdminRugsRedirect() {
  redirect("/admin/products");
}
