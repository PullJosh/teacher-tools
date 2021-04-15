import Link from "next/link";

export default function Index() {
  return (
    <div className="m-8">
      <h1 className="font-bold text-2xl">Teaching Tools</h1>
      <ul className="list-disc list-inside ml-4 my-2">
        <li>
          <Link href="/big-message">
            <a className="text-blue-600 hover:underline">Big Message</a>
          </Link>
        </li>

        <li>
          <Link href="/calculator">
            <a className="text-blue-600 hover:underline">Calculator</a>
          </Link>
        </li>

        <li>
          <Link href="/timer">
            <a className="text-blue-600 hover:underline">Countdown Timer</a>
          </Link>
        </li>

        <li>
          <Link href="/quiz-editor">
            <a className="text-blue-600 hover:underline">Quiz Editor</a>
          </Link>
        </li>

        <li>
          <Link href="/ui-builder">
            <a className="text-blue-600 hover:underline">UI Builder</a>
          </Link>
        </li>
      </ul>
    </div>
  );
}
