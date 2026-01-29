import Image from "next/image";
import AuthComponent from "@/components/AuthComponent/authComponent";

export default function Home() {
  return (
    <>
    <AuthComponent />
    <div className="h-screen">
      <h1>Home page</h1>
    </div>
    </>
  );
}
