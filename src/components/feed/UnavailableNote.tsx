"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PUMP_PUBLIC_CALLOUTS_PAGE } from "@/lib/pumpfun/endpoints";

export function LimitButton({ title, detail }: { title: string; detail: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button className="chip" type="button" onClick={() => dialog.current?.showModal()}>
        {title}
      </button>
      <dialog className="dialog" ref={dialog}>
        <h2 className="m-0 text-lg font-semibold">{title}</h2>
        <p className="lede">{detail}</p>
        <form method="dialog" className="mt-3">
          <button className="btn" type="submit">
            Close
          </button>
        </form>
      </dialog>
    </>
  );
}

export function CalloutUnavailable({ detail }: { detail: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      className="callout-empty"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <p className="badge official">Official data</p>
      <h2 className="mt-2 mb-1 text-xl font-semibold tracking-tight">Callouts stay on Pump.fun for now</h2>
      <p className="lede m-0">{detail}</p>
      <div className="row mt-3">
        <a className="btn" href={PUMP_PUBLIC_CALLOUTS_PAGE} target="_blank" rel="noreferrer">
          View callouts on Pump.fun
        </a>
        <a className="btn btn-primary" href="/explore">
          Look up a mint
        </a>
      </div>
    </motion.section>
  );
}
