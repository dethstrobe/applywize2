"use client";
/**
 * This is a minimal welcome page for the starter.
 *
 * _Feel free to delete this file_
 **/

import { useState } from "react";
import styles from "./Welcome.module.css";
import { Button } from "../components/ui/button";

export const Welcome = () => {
  return (
    <div className={styles.container}>
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">
          Welcome to RedwoodSDK
        </h1>
        <p className="text-lg text-gray-600">
          You’ve just installed the starter project. Here’s what to do next.
        </p>
      </header>

      <main className="bg-bg border border-border rounded-lg p-6">
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Next steps</h2>
          <ol className={styles.list}>
            <li>
              Read the{" "}
              <a
                href="https://docs.rwsdk.com/getting-started/quick-start/"
                target="_blank"
                rel="noreferrer"
                className={styles.link}
              >
                Quick Start
              </a>{" "}
              to learn the basics.
            </li>
            <li>
              Explore React Server Components and Server Functions in the{" "}
              <a
                href="https://docs.rwsdk.com/"
                target="_blank"
                rel="noreferrer"
                className={styles.link}
              >
                Docs
              </a>
              .
            </li>
            <li>
              Join the community to ask questions and share what you’re
              building.
            </li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Deploy to Cloudflare</h2>
          <p>
            RedwoodSDK runs on Cloudflare Workers. Here’s the quickest way to
            deploy.
          </p>
          <div className={styles.codeBlock}>
            <span className={styles.codePrompt}>$</span>
            <code className={styles.code}>pnpm release</code>
            <Copy textToCopy="pnpm release" />
          </div>
          <p>
            Need more detail? Read the{" "}
            <a
              href="https://docs.rwsdk.com/core/hosting/"
              target="_blank"
              rel="noreferrer"
              className={styles.link}
            >
              Cloudflare deployment guide
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
};

const Copy = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Button onClick={handleCopy} className={styles.copyButton}>
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
};
