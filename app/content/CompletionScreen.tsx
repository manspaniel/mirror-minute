import { animate, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { appState, useAppState } from "~/state/app-state";
import { shareStore } from "~/state/share-state";
import { Button } from "~/ui/Button";
import { useEscape } from "~/utils/useEscape";
import { useIsMobile } from "~/utils/useIsMobile";

export function CompletionScreen() {
  const app = useAppState();

  const [state, setState] = useState({
    step: "success" as "success" | "reflection",
  });

  useEscape(() => {
    appState.dismissCompletion();
  });

  const isMobile = useIsMobile();

  const successRef = useRef<HTMLDivElement>(null!);

  async function successAnim() {
    const lookLabel = successRef.current.querySelector("[data-look-label]")!;
    const lookCircle = successRef.current.querySelector(
      "[data-yourself-circle]"
    )!;

    await Promise.all([
      animate([
        [lookLabel, { scale: 1.2, opacity: 0 }, { duration: 0 }],
        [
          lookLabel,
          { scale: 1, opacity: 1 },
          { duration: 0.7, delay: 0.4, ease: "easeInOut" },
        ],
        [lookCircle, { strokeDashoffset: "330px" }, { duration: 0 }],
        [
          lookCircle,
          { strokeDashoffset: "0px" },
          { duration: 1, delay: 0.2, ease: "easeInOut" },
        ],
        [
          [lookCircle, lookLabel],
          { strokeDashoffset: "-330px", opacity: 0 },
          { duration: 0.7, delay: 0.7, ease: "easeOut" },
        ],
      ]),
    ]);
  }

  useEffect(() => {
    if (state.step === "success") {
      successAnim().then(() => {
        setState({ step: "reflection" });
      });
    }
  }, [state.step]);

  return (
    <>
      {/* Success */}
      {state.step === "success" && (
        <div className="fixed inset-0" ref={successRef}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-indigo-950 text-4xl opacity-0 will-change-transform isolate"
              data-look-label
              style={{ transform: "scale(1.2)" }}
            >
              <span className="inline-flex relative italic">
                You {YOURSELF_VECTOR}
              </span>{" "}
              did it!
            </div>
          </div>

          {SUCCESS_VECTOR.paths.map((path, index) => {
            return (
              <div
                key={index}
                className="fixed inset-0 flex items-center justify-center will-change-transform isolate opacity-0"
                data-success-ring
                style={{ strokeWidth: 8 }}
              >
                <svg
                  viewBox={`0 0 ${SUCCESS_VECTOR.width} ${SUCCESS_VECTOR.height}`}
                  className="portrait:w-[100vh] landscape:w-[80vw] flex-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {path}
                </svg>
              </div>
            );
          })}
        </div>
      )}
      {/* Reflection */}
      {state.step === "reflection" && (
        <div className="fixed inset-0 flex items-center text-indigo-950">
          <div className="absolute inset-0 pointer-events-none translate-y-[25%] md:translate-y-[10%]">
            <svg
              width="1280"
              height="527"
              viewBox="0 0 1280 527"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-center object-cover opacity-25"
            >
              <motion.path
                d="M0 828.003C231.712 417.273 637.76 159.128 612.161 563.855C835.487 126.61 1099.86 88.0881 1146.2 407.767C1246.83 102.096 1749.54 -224.087 1714.23 224.164"
                stroke="#6357FF"
                strokeWidth="6"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathOffset: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>

          <div className="flex flex-col gap-8 md:gap-0 md:flex-row md:justify-between md:items-center w-[90vw] md:w-[80vw] mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.8 } }}
              exit={{ opacity: 0 }}
              className="text-balance font-serif text-[5vw] md:text-[2.5vw] leading-[1] flex flex-col gap-[1em] md:w-[14em]"
            >
              <p>
                You did it. You just spent 60 seconds with your real self. Most
                people never do.
              </p>
              <p>Thank you for sharing your minute with us.</p>
              <p>Take a moment to reflect on your experience.</p>
            </motion.div>
            <div className="flex text-center flex-col md:w-[60%] gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: isMobile ? 1.5 : 2,
                    duration: 0.8,
                    restDelta: 0.01,
                    ease: "anticipate",
                  },
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="font-serif uppercase text-[0.9em] will-change-transform relative"
              >
                <textarea
                  className="font-serif text-[6.5vw] md:text-[3.5vw] leading-[1.2] appearance-none bg-transparent placeholder:text-[#B6BDE5] outline-0 resize-none w-full field-sizing-content overflow-visible py-[0.1em] text-center text-pretty placeholder-shown:text-left placeholder-shown:w-[12.5em]"
                  onChange={(e) => {
                    shareStore.note = e.target.value;
                  }}
                  autoFocus
                  placeholder="The mirror minute made me feel..."
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: isMobile ? 7.5 : 2.5,
                    duration: 0.8,
                    restDelta: 0.01,
                    ease: "anticipate",
                  },
                }}
                exit={{ opacity: 0 }}
                className="flex gap-3 items-center justify-center"
              >
                <Button
                  variant="dark"
                  onClick={() => {
                    shareStore.note = "";
                    shareStore.includeNote = false;
                    appState.dismissCompletion();
                  }}
                >
                  Skip
                </Button>
                <Button
                  onClick={() => {
                    if (shareStore.note) {
                      shareStore.includeNote = true;
                    } else {
                      shareStore.includeNote = false;
                    }
                    appState.dismissCompletion();
                  }}
                >
                  Continue
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const SUCCESS_VECTOR = {
  width: 1339,
  height: 1286,
  paths: [
    <path
      d="M672.726 471.364C581.36 465.221 507.98 537.852 492.872 631.803C477.765 725.753 556.9 798.385 630.64 810.309C704.38 822.234 819.487 821.511 844.307 682.03C869.126 542.55 764.092 477.507 672.726 471.364Z"
      stroke="white"
      strokeLinejoin="round"
    />,
    <path
      d="M675.454 326.67C506.799 315.348 371.343 449.209 343.455 622.362C315.567 795.516 461.647 929.376 597.767 951.353C733.886 973.331 946.366 971.999 992.181 714.933C1038 457.867 844.11 337.991 675.454 326.67Z"
      stroke="white"
      strokeLinejoin="round"
    />,
    <path
      d="M678.219 179.98C431.25 163.408 232.896 359.343 192.059 612.792C151.222 866.24 365.132 1062.17 564.457 1094.34C763.783 1126.51 1074.92 1124.56 1142.01 748.289C1209.1 372.016 925.188 196.551 678.219 179.98Z"
      stroke="white"
      strokeLinejoin="round"
    />,
    <path
      d="M681.525 5.34891C340.887 -17.4728 67.3035 252.36 10.9776 601.398C-45.3484 950.435 249.692 1220.27 524.617 1264.57C799.541 1308.87 1228.69 1306.19 1321.23 787.999C1413.76 269.812 1022.16 28.1706 681.525 5.34891Z"
      stroke="white"
      strokeLinejoin="round"
    />,
  ],
};

const YOURSELF_VECTOR = (
  <svg
    width="93"
    height="68"
    viewBox="0 0 93 68"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute top-0 left-[0.1em] w-full h-full scale-[150%]"
    data-yourself-circle
    style={{ strokeDashoffset: "330px" }}
  >
    <path
      d="M67.3063 65.2412C115.064 30.8584 81.1417 -2.41357 48.5599 2.47896C23.1183 6.2993 3.92535 20.4888 2.14098 35.7703C0.547813 49.4142 12.8533 63.1188 28.475 65.2412C44.0967 67.3635 64.3284 65.787 78.0177 50.5057"
      stroke="#6357FF"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="330 330"
    />
  </svg>
);
