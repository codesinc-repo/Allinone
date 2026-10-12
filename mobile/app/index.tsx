import { Redirect } from "expo-router";
import { useStore } from "@/lib/store";

export default function Index() {
  const { currentUser } = useStore();
  return <Redirect href={currentUser ? "/(tabs)" : "/(auth)/login"} />;
}
