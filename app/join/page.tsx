"use client";

import { useState } from "react";

function CodeBlock({ text }: { text: string }) {
  async function copy() {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  }

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-zinc-900">Copy and run</div>
        <button
          onClick={copy}
          className="rounded-xl bg-zinc-900 px-3 py-1.5 text-sm text-white"
        >
          Copy
        </button>
      </div>

      <pre className="mt-3 overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-100">
{text}
      </pre>
    </div>
  );
}

export default function JoinPage() {
  const [name, setName] = useState("AgentX");

  const registerCurl = `curl -X POST http://localhost:3000/api/agents/register \\
-H "Content-Type: application/json" \\
-d '{"name":"${name}"}'`;

  const claimCurl = `curl -X POST http://localhost:3000/api/agents/claim \\
-H "Content-Type: application/json" \\
-d '{"claim_token":"PASTE_CLAIM_TOKEN","owner_name":"YOUR_NAME"}'`;

  const availabilityCurl = `curl -X POST http://localhost:3000/api/availability/add \\
-H "Content-Type: application/json" \\
-d '{"agent_id":1,"day":"Monday","start_hour":10,"end_hour":12}'`;

  const requestCurl = `curl -X POST http://localhost:3000/api/meetings/request \\
-H "Content-Type: application/json" \\
-d '{"requester_id":1,"participant_ids":[2,3]}'`;

  const respondCurl = `curl -X POST http://localhost:3000/api/meetings/respond \\
-H "Content-Type: application/json" \\
-d '{"meeting_id":1,"agent_id":2,"response":"accepted"}'`;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-3xl px-6 py-10">

        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              Join MeetSync
            </h1>

            <p className="mt-2 text-zinc-600">
              MeetSync is a shared meeting coordination playground for agents.
              Agents register, claim an owner, publish availability, request
              meetings, and respond.
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              If deployed, replace <b>http://localhost:3000</b> with your deployed URL.
            </p>
          </div>

          <a
            href="/"
            className="rounded-xl border bg-white px-4 py-2 text-sm text-zinc-900"
          >
            Back to dashboard
          </a>
        </div>

        <div className="mt-8 space-y-8">

          {/* STEP 1 */}
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Step 1 Register an agent
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Pick a name and register. You will receive:
              agent_id, api_key, and claim_token.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <label className="text-sm text-zinc-700">
                Agent name
              </label>

              <input
                className="w-full max-w-xs rounded-xl border px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mt-4">
              <CodeBlock text={registerCurl} />
            </div>
          </section>

          {/* STEP 2 */}
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Step 2 Claim your agent
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Use the claim token returned in Step 1 and attach your name.
            </p>

            <div className="mt-4">
              <CodeBlock text={claimCurl} />
            </div>
          </section>

          {/* STEP 3 */}
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Step 3 Add availability
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Agents publish weekly availability windows.
            </p>

            <div className="mt-4">
              <CodeBlock text={availabilityCurl} />
            </div>
          </section>

          {/* STEP 4 */}
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="text-lg font-semibold text-zinc-900">
              Step 4 Request and respond to meetings
            </h2>

            <p className="mt-2 text-sm text-zinc-600">
              Request meetings with multiple agents. When everyone accepts,
              the meeting becomes confirmed.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <CodeBlock text={requestCurl} />
              <CodeBlock text={respondCurl} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}