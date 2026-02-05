import { animate, motion, useMotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { appState, useAppState } from "~/state/app-state";
import { Button } from "~/ui/Button";
import { BURST, DIAMOND } from "~/ui/svgs";
import { useEscape } from "~/utils/useEscape";
import { useIsMobile } from "~/utils/useIsMobile";
import { Tracking } from "~/utils/tracking";

export function LandingScreen() {
  const app = useAppState();

  const [state, setState] = useState({
    step: "breathe" as "breathe" | "splash",
  });

  useEscape(() => {
    appState.dismissLanding();
  });

  const isMobile = useIsMobile();

  const breatheRef = useRef<HTMLDivElement>(null!);

  async function breatheAnim() {
    const breatheLabel = breatheRef.current.querySelector(
      "[data-breathe-label]",
    )!;
    const lookLabel = breatheRef.current.querySelector("[data-look-label]")!;
    const lookCircle = breatheRef.current.querySelector(
      "[data-yourself-circle]",
    )!;
    const rings = breatheRef.current.querySelectorAll("[data-breathe-ring]");

    await Promise.all([
      animate([
        [breatheLabel, { scale: 0.8, opacity: 0 }, { duration: 0 }],
        [
          breatheLabel,
          { scale: 1, opacity: 1 },
          { duration: 0.8, delay: 0.2, ease: "easeInOut", restDelta: 0.01 },
        ],
        [
          breatheLabel,
          { scale: 0.9, opacity: 0 },
          { duration: 0.5, delay: 1.6, ease: "easeInOut" },
        ],
        [lookLabel, { scale: 1.2, opacity: 0 }, { duration: 0 }],
        [
          lookLabel,
          { scale: 1, opacity: 1 },
          { duration: 0.7, delay: 0.4, ease: "easeInOut" },
        ],
        [lookCircle, { strokeDashoffset: "400px" }, { duration: 0 }],
        [
          lookCircle,
          { strokeDashoffset: "0px" },
          { duration: 1, delay: 0.2, ease: "easeInOut" },
        ],
        [
          [lookCircle, lookLabel],
          { strokeDashoffset: "-400px", opacity: 0 },
          { duration: 0.7, delay: 1.2, ease: "easeOut" },
        ],
      ]),
      ...Array.from(rings).map((ring, index) => {
        return animate([
          [
            ring,
            { scale: 1.15, opacity: 1, strokeWidth: 6 },
            {
              duration: 1.6,
              delay: 0.4 + index * 0.2,
              ease: "easeOut",
              restDelta: 0.01,
            },
          ],
          [
            ring,
            { scale: 0.95, opacity: 0, strokeWidth: 8 },
            {
              duration: 1,
              delay: 0.4 - index * 0.05,
              ease: "easeIn",
              restDelta: 0.01,
            },
          ],
        ]);
      }),
    ]);
  }

  useEffect(() => {
    if (state.step === "breathe") {
      breatheAnim().then(() => {
        setState({ step: "splash" });
      });
    }
  }, [state.step]);

  return (
    <>
      {/* Breathe */}
      {state.step === "breathe" && (
        <div className="fixed inset-0" ref={breatheRef}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-indigo-950 text-3xl opacity-0 will-change-transform isolate"
              data-breathe-label
              style={{ transform: "scale(0.9)" }}
            >
              Take a breath.
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-indigo-950 max-md:text-2xl text-3xl opacity-0 will-change-transform isolate max-md:text-center max-md:px-4"
              data-look-label
              style={{ transform: "scale(1.2)" }}
            >
              Can you look at{" "}
              <span className="inline-flex relative">
                yourself {YOURSELF_VECTOR}
              </span>{" "}
              for 60 seconds?
            </div>
          </div>

          {BREATHE_VECTOR.paths.map((path, index) => {
            return (
              <div
                key={index}
                className="fixed inset-0 flex items-center justify-center will-change-transform isolate opacity-0"
                data-breathe-ring
                style={{ strokeWidth: 8 }}
              >
                <svg
                  viewBox={`0 0 ${BREATHE_VECTOR.width} ${BREATHE_VECTOR.height}`}
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
      {/* Splash */}
      {state.step === "splash" && (
        <div className="fixed inset-0 flex items-center text-indigo-950">
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center mb-8 text-xs md:text-md font-semibold">
            <a
              href="https://laughlines.com.au"
              target="_blank"
              className="flex items-center"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: "9.5em",
                  transition: {
                    duration: 1,
                    ease: "easeInOut",
                    delay: isMobile ? 10 : 3.3,
                  },
                }}
                exit={{ width: 0 }}
                className="font-sans uppercase leading-[1em] mask-[linear-gradient(90deg,black_0%,black_calc(100%-1em),transparent_100%)] overflow-hidden whitespace-nowrap"
              >
                <div className="pr-[1em]">
                  Laugh Lines
                  <br />
                  Project
                </div>
              </motion.div>
              <motion.svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-[2.2em]"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.3,
                    ease: "easeInOut",
                    delay: isMobile ? 10 : 3.3,
                  },
                }}
                exit={{ opacity: 0, scale: 0.5 }}
              >
                <path
                  d="M14.7386 29.4943C6.61713 29.6768 -0.0294013 22.8993 9.78163e-05 14.704C0.029597 6.61745 6.63372 -0.0549701 14.8658 0.000341425C22.8988 0.0538093 29.5822 6.64879 29.4992 14.9363C29.4181 22.9546 22.8693 29.6842 14.7386 29.4962V29.4943ZM6.42538 23.1427C7.14442 22.5546 7.85424 21.959 8.58066 21.3819C9.79566 20.4177 11.0383 19.4903 12.4653 18.8505C13.1678 18.5352 13.1991 18.5537 13.4554 19.2617C13.7142 19.9736 13.9194 20.7039 14.0693 21.4465C14.4196 23.1925 14.5395 24.968 14.7368 26.7379C14.899 25.3035 15.0096 23.8654 15.2364 22.4402C15.4245 21.2658 15.6512 20.1024 16.1195 18.998C16.2578 18.6735 16.4459 18.5961 16.763 18.7454C17.152 18.928 17.5502 19.0828 17.9245 19.3022C19.2225 20.0582 20.4117 20.9653 21.5658 21.9203C22.0655 22.3333 22.5651 22.7463 23.0629 23.1593C22.5577 22.4034 21.9825 21.7193 21.4331 21.0169C20.4043 19.7005 19.3773 18.3822 18.7468 16.8077C18.6177 16.4869 18.6601 16.3099 19.0012 16.1698C19.7682 15.8508 20.5592 15.6222 21.3704 15.4618C23.1348 15.1115 24.9269 14.9658 26.7171 14.7851C25.8008 14.6653 24.8826 14.5897 23.9681 14.4809C22.3623 14.291 20.7564 14.0937 19.2391 13.4816C18.5477 13.2032 18.544 13.2069 18.8408 12.5303C19.4271 11.1936 20.2771 10.0228 21.1731 8.88522C21.8756 7.99102 22.6075 7.12078 23.4224 6.12149C22.4784 6.89585 21.6635 7.58356 20.8265 8.24361C19.5691 9.23737 18.2822 10.185 16.7777 10.7916C16.4053 10.941 16.2523 10.8322 16.1214 10.4985C15.6807 9.36827 15.4171 8.19567 15.2382 7.00094C15.0299 5.60525 14.9156 4.19849 14.7663 2.79358C14.6464 3.71543 14.569 4.63914 14.4639 5.55915C14.2795 7.18531 14.0601 8.80779 13.4536 10.3454C13.2139 10.9557 13.1788 10.9631 12.5944 10.7216C11.0807 10.0965 9.80487 9.10094 8.53272 8.10164C7.85056 7.56696 7.18867 7.00647 6.51756 6.45889C6.67797 6.81473 6.91396 7.1005 7.14626 7.38628C8.40366 8.93869 9.70347 10.4598 10.5774 12.2814C11.0125 13.1885 10.9922 13.2511 10.0446 13.5793C8.20639 14.2173 6.2871 14.4016 4.36966 14.5897C3.86264 14.6395 3.35563 14.6856 2.84861 14.7335C3.7299 14.8847 4.60196 14.9529 5.47034 15.0561C7.17761 15.259 8.87934 15.4876 10.4907 16.155C10.8779 16.3154 10.9019 16.4887 10.7525 16.8114C10.4852 17.3903 10.2105 17.9655 9.87125 18.5057C8.84247 20.1411 7.59981 21.6124 6.42354 23.1445L6.42538 23.1427Z"
                  fill="#2C2953"
                />
              </motion.svg>
            </a>
          </div>

          <div className="absolute inset-0 pointer-events-none -z-10">
            <svg
              width="1280"
              height="527"
              viewBox="0 0 1280 527"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-center object-cover"
            >
              <motion.path
                d="M0 828.003C231.712 417.273 637.76 159.128 612.161 563.855C835.487 126.61 1099.86 88.0881 1146.2 407.767C1246.83 102.096 1749.54 -224.087 1714.23 224.164"
                stroke="white"
                strokeWidth="8"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ pathOffset: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </div>

          <div className="flex md:flex-row md:justify-between md:items-center md:w-[80vw] mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.8 } }}
              exit={{ opacity: 0 }}
              className="text-balance font-serif text-[2.5vw] leading-[1] flex-col gap-[1em] w-[10em] hidden md:flex"
            >
              <p>
                For one minute, there's nothing to fix, perform or hide from.
              </p>
              <p>
                This mirror doesn’t want your good side —it wants your honesty.
              </p>
            </motion.div>
            <div className="flex text-center flex-col md:w-[50%] gap-6">
              <motion.div className="flex text-[6.5vw] md:text-[3.5vw] leading-[1.2] text-center items-center flex-col">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      delay: isMobile ? 1 : 1.5,
                      duration: 0.8,
                      restDelta: 0.01,
                      ease: "anticipate",
                    },
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="font-serif will-change-transform"
                >
                  Welcome to the
                </motion.div>
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
                  className="font-sans uppercase text-[0.9em] will-change-transform relative"
                >
                  Mirror Minute
                  <motion.div
                    initial={{ rotate: "90deg", scale: 0.5, opacity: 0 }}
                    animate={{
                      rotate: "0",
                      scale: 1,
                      opacity: 1,
                      transition: { delay: isMobile ? 1.9 : 2.8 },
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute left-[-1.1em] top-[-0.8em] size-[1em]"
                  >
                    {DIAMOND}
                  </motion.div>
                  <motion.div
                    initial={{ rotate: "-45deg", scale: 0.5, opacity: 0 }}
                    animate={{
                      rotate: "0",
                      scale: 1,
                      opacity: 1,
                      transition: { delay: isMobile ? 2.1 : 3.1 },
                    }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute left-[101%] bottom-[5%] size-[2em]"
                  >
                    {BURST}
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div className="flex md:hidden mx-auto w-[80vw] text-left text-balance gap-5 text-[4vw] leading-none relative z-10">
                <motion.p
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      delay: isMobile ? 3.5 : 2,
                      duration: 0.8,
                      restDelta: 0.01,
                      ease: "anticipate",
                    },
                  }}
                  exit={{ opacity: 0 }}
                >
                  For one minute, there's nothing to fix, perform or hide from.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: {
                      delay: isMobile ? 5.5 : 2.5,
                      duration: 0.8,
                      restDelta: 0.01,
                      ease: "anticipate",
                    },
                  }}
                  exit={{ opacity: 0 }}
                  className="pb-4"
                >
                  This mirror doesn’t want your good side —it wants your
                  honesty.
                </motion.p>
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
              >
                <Button
                  onClick={() => {
                    Tracking.trackEvent("Landing - Get Started Clicked");
                    appState.dismissLanding();
                  }}
                >
                  Get Started
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const BREATHE_VECTOR = {
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
    width="153"
    height="77"
    viewBox="0 0 153 77"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute top-0 left-0 w-full h-full scale-[150%] -z-10"
    data-yourself-circle
    style={{ strokeDashoffset: "400px" }}
  >
    <path
      d="M105.859 66.2048C55.4392 77.1988 10.9397 79.0245 3.61364 60.1149C-3.71237 41.2052 13.5253 16.139 63.9455 6.02451C114.366 -4.08995 155.736 4.70523 150.565 34.1691C146.428 57.7402 117.064 67.5241 88.1908 75"
      stroke="white"
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="400 400"
    />
  </svg>
);
