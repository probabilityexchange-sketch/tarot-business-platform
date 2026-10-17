"use client";

import type { CSSProperties } from "react";
import { useEffect, useId, useState } from "react";

const journalLines = [
  "M114 187 C164 163 222 170 301 210 L298 270 C225 234 166 226 105 246 Z",
  "M301 210 C361 162 423 149 476 164 L492 225 C427 210 366 237 298 270",
  "M110 198 L98 254 C164 233 224 243 298 279 C371 244 434 222 499 234 L487 171",
  "M298 270 C294 245 297 224 301 210",
  "M119 194 C179 176 229 186 285 211",
  "M119 211 C175 197 221 206 279 230",
  "M118 225 C165 215 207 222 251 239",
  "M321 207 C365 177 410 168 451 173",
  "M324 223 C365 197 402 187 453 187",
  "M323 239 C357 221 391 207 429 204",
  "M301 273 C303 281 308 288 316 290 L322 276",
];

const branchLines = [
  "M300 210 C321 188 344 165 358 137 C377 102 386 70 404 34",
  "M348 155 C324 142 306 119 298 94 C324 95 345 119 348 155 Z",
  "M369 114 C393 115 421 101 432 77 C405 77 382 91 369 114 Z",
  "M384 77 C365 64 354 48 354 27 C374 36 384 55 384 77 Z",
  "M398 45 C412 46 430 35 435 18 C417 18 405 29 398 45 Z",
  "M329 180 C305 180 280 164 267 143 C294 141 318 158 329 180 Z",
  "M357 142 C385 149 415 139 430 118 C401 112 376 123 357 142 Z",
  "M348 155 C331 132 314 111 298 94",
  "M369 114 C392 99 415 86 432 77",
  "M384 77 C372 57 363 41 354 27",
  "M329 180 C307 165 287 151 267 143",
  "M357 142 C385 131 411 122 430 118",
];

export function LettersIllustration() {
  const titleId = useId();
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(true);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFinished(false);
      setPlaying(true);
      setRun(1);
    }
  }, []);

  function replay() {
    setFinished(false);
    setPlaying(true);
    setRun((value) => value + 1);
  }

  function stroke(path: string, index: number, branch: boolean) {
    const delay = branch ? 1.9 + index * 0.19 : 0.25 + index * 0.13;
    const duration = branch ? 0.75 : 0.9;
    const style: CSSProperties = { animationDelay: `${delay}s`, animationDuration: `${duration}s`, animationPlayState: playing ? "running" : "paused" };
    return <path key={`${branch}-${index}`} d={path} pathLength="1" style={style} className="letters-ink" strokeWidth={branch ? index === 0 ? 2.1 : 1.25 : index < 4 ? 1.6 : 0.9} opacity={branch ? 0.9 : index < 4 ? 0.85 : 0.5} />;
  }

  return (
    <figure className="mt-6" aria-label="An open journal with a botanical branch growing from its pages">
      <svg key={run} viewBox="65 0 480 310" className={`letters-art w-full max-w-xl ${finished ? "" : "letters-art-drawing"}`} role="img" aria-labelledby={titleId} onAnimationEnd={(event) => {
        if (event.animationName === "letters-drawing-duration") {
          setFinished(true);
          setPlaying(false);
        }
      }} style={{ animationPlayState: playing ? "running" : "paused" }}>
        <title id={titleId}>A journal opens into a botanical branch, drawn in plum ink.</title>
        <g className="letters-wash" style={{ animationPlayState: playing ? "running" : "paused" }} fill="#87927a" opacity="0.12">
          <path d="M344 149 C321 137 309 113 301 98 C324 103 341 123 344 149 Z M371 110 C397 111 419 94 428 80 C407 82 386 93 371 110 Z M382 71 C366 58 359 43 357 31 C373 42 381 57 382 71 Z M359 140 C388 143 412 130 424 120 C401 119 377 128 359 140 Z" />
        </g>
        <g className="letters-wash" style={{ animationPlayState: playing ? "running" : "paused" }} fill="#b799a7" opacity="0.12"><path d="M120 194 C173 176 221 181 294 213 L292 259 C232 230 166 217 112 235 Z M307 214 C363 173 424 157 468 169 L480 216 C426 204 365 229 306 259 Z" /></g>
        <g fill="none" stroke="#653c56" strokeLinecap="round" strokeLinejoin="round">
          {journalLines.map((path, index) => stroke(path, index, false))}
          {branchLines.map((path, index) => stroke(path, index, true))}
        </g>
      </svg>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-[#744b65]/15 pt-3 text-[10px] uppercase tracking-[.18em] text-[#744b65]">
        <span>Pause. Notice. Write.</span>
        <span className="letters-motion-controls flex gap-4">
          {!finished && <button type="button" onClick={() => setPlaying(!playing)} className="rounded underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{playing ? "Pause drawing" : "Resume drawing"}</button>}
          <button type="button" onClick={replay} className="rounded underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Replay drawing</button>
        </span>
      </figcaption>
    </figure>
  );
}
