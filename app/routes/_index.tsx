import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  {
    title: "Financial Goals - Index",
  },
];

export default function () {
  return (
    <>
      <p>This is basic route.</p>
      <input />
    </>
  );
}
