import Link from "next/link";

export default function Index() {
  return (
    <div className="m-8">
      <h1 className="font-bold text-2xl">Teaching Tools</h1>
      <ul className="list-disc list-inside ml-4 my-2">
        <ToolLink href="/big-message">Big Message</ToolLink>
        <ToolLink href="/calculator">Calculator</ToolLink>
        <ToolLink href="/timer">Countdown Timer</ToolLink>
        <ToolLink href="/quiz-editor">Quiz Editor</ToolLink>
      </ul>
      <footer className="mt-16">
        Made by{" "}
        <a
          href="https://www.joshuapullen.com/"
          className="text-blue-600 hover:underline"
        >
          Josh Pullen
        </a>
      </footer>
    </div>
  );
}

function ToolLink({ href, children }) {
  return (
    <li>
      <Link href={href}>
        <a className="text-blue-600 hover:underline">{children}</a>
      </Link>
    </li>
  );
}
