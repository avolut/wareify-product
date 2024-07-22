import { FC } from "react";

export const DetailView: FC<{ children: any; PassProp: any }> = ({
  children,
  PassProp,
}) => {
  const w = window as unknown as {
    user: any;
  };

  const searchParams = new URLSearchParams(window.location.search);
  let mode = searchParams.get("mode") || "edit";
  if (w?.user?.role !== "admin") {
    mode = "view";
  }
  return (
    <>
      <PassProp children={children} mode="edit" />
    </>
  );
};
