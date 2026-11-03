import { redirect } from "next/navigation";

// 예전 주소(/job-seekers)로 들어와도 새 인재정보 화면으로 안내
export default function OldJobSeekersPage() {
  redirect("/?tab=seekers");
}
