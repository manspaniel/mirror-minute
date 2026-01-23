import { motion } from "motion/react";
import { appState } from "~/state/app-state";
import { Button, buttonStyles } from "~/ui/Button";
import { BURST, DIAMOND } from "~/ui/svgs";
import { useEscape } from "~/utils/useEscape";
import { ShareImage } from "./ShareImage";
import { Tracking } from "~/utils/tracking";

export function SummaryScreen() {
  useEscape(() => {
    appState.openShare();
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 overflow-auto"
    >
      <div className="relative flex flex-col min-h-full md:flex-row">
        {/* Left side/Share Trigger */}
        <div className="md:w-1/2 min-h-[60vh] flex items-center justify-center md:pl-20 md:pr-20 text-indigo-950">
          <div className="flex flex-col max-md:py-10 gap-3 md:justify-between md:h-[80vh] max-w-[80vw] w-full">
            {/* Header */}
            <motion.div className="flex text-[6.5vw] md:text-[3.5vw] leading-[1.2] text-center items-center flex-col">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  transition: {
                    delay: 0.5,
                    duration: 1,
                    restDelta: 0.01,
                    ease: "anticipate",
                  },
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="font-sans uppercase text-[5vw] md:text-[2vw] 2xl:text-[35px] will-change-transform relative"
              >
                Capture
                <br />
                your minute
                <motion.div
                  initial={{ rotate: "90deg", scale: 0.5, opacity: 0 }}
                  animate={{
                    rotate: "0",
                    scale: 1,
                    opacity: 1,
                    transition: { delay: 1.5 },
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute left-[-0.8em] bottom-[-0.4em] size-[0.8em]"
                >
                  {DIAMOND}
                </motion.div>
                <motion.div
                  initial={{ rotate: "-45deg", scale: 0.5, opacity: 0 }}
                  animate={{
                    rotate: "0",
                    scale: 1,
                    opacity: 1,
                    transition: { delay: 1.8 },
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute left-[100%] bottom-[30%] size-[1.2em]"
                >
                  {BURST}
                </motion.div>
              </motion.div>
            </motion.div>
            <div className="flex max-md:mt-10 flex-col items-center justify-center">
              <motion.div
                initial={{
                  scale: 0.8,
                  rotate: "-20deg",
                  translateY: "50%",
                  opacity: 0,
                  filter: "blur(20px)",
                }}
                animate={{
                  scale: 1,
                  translateY: "0",
                  rotate: "-10deg",
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: { delay: 1.5, type: "spring", stiffness: 30 },
                }}
                exit={{
                  scale: 0.4,
                  translateY: "0",
                  rotate: "10deg",
                  opacity: 0,
                  filter: "blur(20px)",
                }}
                className="aspect-[303/540] flex-none max-md:w-[40vw] md:h-[50vh]"
              >
                <ShareImage />
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.2 } }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 max-md:pt-10"
            >
              <Button
                variant="dark"
                onClick={() => {
                  Tracking.trackEvent("Summary - Customize & Share Clicked");
                  appState.openShare();
                }}
              >
                Customise & Share
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Separator */}
        <div className="flex-none">
          {/* Mobile separator */}
          <svg
            width="392"
            height="65"
            viewBox="0 0 392 65"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block md:hidden w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M392 4.06723e-06C392 57.0757 392 65 392 65L2.76763e-05 65C2.76763e-05 65 0.000301747 55.4375 0.000305176 -7.56566e-06C69.3234 0.000128913 157.598 -1.0246e-05 189.018 51.3807C220.937 -0.000320283 316.692 -0.000598957 392 4.06723e-06Z"
              fill="#6357FF"
            />
          </svg>

          {/* Desktop separator */}
          <svg
            width="133"
            height="786"
            viewBox="0 0 133 786"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hidden md:block h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M7.41303e-06 0C83.184 0 133 0 133 0V786C133 786 80.1982 786 1.74411e-05 786C0.000260667 647 0 470 93.6478 407C-0.000570062 343 -0.00108567 151 7.41303e-06 0Z"
              fill="#6357FF"
            />
          </svg>
        </div>

        {/* Right side/Campaign stuff */}
        <div className="md:w-1/2 min-h-[60vh] bg-[#6357FF] flex items-center justify-center text-white md:pr-10">
          <div className="flex flex-col max-md:py-10 gap-3 md:justify-between md:h-[80vh] max-w-[80vw] md:max-w-[500px] w-full">
            {/* Logo */}
            <div className="relative flex items-center justify-center mb-8 text-[5vw] md:text-[2vw] 2xl:text-[35px] font-semibold">
              <span className="flex items-center">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: "9.5em",
                    transition: {
                      duration: 1,
                      ease: "easeInOut",
                      delay: 0,
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
                      delay: 0,
                    },
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  <path
                    d="M14.7386 29.4943C6.61713 29.6768 -0.0294013 22.8993 9.78163e-05 14.704C0.029597 6.61745 6.63372 -0.0549701 14.8658 0.000341425C22.8988 0.0538093 29.5822 6.64879 29.4992 14.9363C29.4181 22.9546 22.8693 29.6842 14.7386 29.4962V29.4943ZM6.42538 23.1427C7.14442 22.5546 7.85424 21.959 8.58066 21.3819C9.79566 20.4177 11.0383 19.4903 12.4653 18.8505C13.1678 18.5352 13.1991 18.5537 13.4554 19.2617C13.7142 19.9736 13.9194 20.7039 14.0693 21.4465C14.4196 23.1925 14.5395 24.968 14.7368 26.7379C14.899 25.3035 15.0096 23.8654 15.2364 22.4402C15.4245 21.2658 15.6512 20.1024 16.1195 18.998C16.2578 18.6735 16.4459 18.5961 16.763 18.7454C17.152 18.928 17.5502 19.0828 17.9245 19.3022C19.2225 20.0582 20.4117 20.9653 21.5658 21.9203C22.0655 22.3333 22.5651 22.7463 23.0629 23.1593C22.5577 22.4034 21.9825 21.7193 21.4331 21.0169C20.4043 19.7005 19.3773 18.3822 18.7468 16.8077C18.6177 16.4869 18.6601 16.3099 19.0012 16.1698C19.7682 15.8508 20.5592 15.6222 21.3704 15.4618C23.1348 15.1115 24.9269 14.9658 26.7171 14.7851C25.8008 14.6653 24.8826 14.5897 23.9681 14.4809C22.3623 14.291 20.7564 14.0937 19.2391 13.4816C18.5477 13.2032 18.544 13.2069 18.8408 12.5303C19.4271 11.1936 20.2771 10.0228 21.1731 8.88522C21.8756 7.99102 22.6075 7.12078 23.4224 6.12149C22.4784 6.89585 21.6635 7.58356 20.8265 8.24361C19.5691 9.23737 18.2822 10.185 16.7777 10.7916C16.4053 10.941 16.2523 10.8322 16.1214 10.4985C15.6807 9.36827 15.4171 8.19567 15.2382 7.00094C15.0299 5.60525 14.9156 4.19849 14.7663 2.79358C14.6464 3.71543 14.569 4.63914 14.4639 5.55915C14.2795 7.18531 14.0601 8.80779 13.4536 10.3454C13.2139 10.9557 13.1788 10.9631 12.5944 10.7216C11.0807 10.0965 9.80487 9.10094 8.53272 8.10164C7.85056 7.56696 7.18867 7.00647 6.51756 6.45889C6.67797 6.81473 6.91396 7.1005 7.14626 7.38628C8.40366 8.93869 9.70347 10.4598 10.5774 12.2814C11.0125 13.1885 10.9922 13.2511 10.0446 13.5793C8.20639 14.2173 6.2871 14.4016 4.36966 14.5897C3.86264 14.6395 3.35563 14.6856 2.84861 14.7335C3.7299 14.8847 4.60196 14.9529 5.47034 15.0561C7.17761 15.259 8.87934 15.4876 10.4907 16.155C10.8779 16.3154 10.9019 16.4887 10.7525 16.8114C10.4852 17.3903 10.2105 17.9655 9.87125 18.5057C8.84247 20.1411 7.59981 21.6124 6.42354 23.1445L6.42538 23.1427Z"
                    fill="currentColor"
                  />
                </motion.svg>
              </span>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.2 } }}
              exit={{ opacity: 0 }}
              className="text-xl md:text-2xl flex flex-col gap-[0.8em] text-pretty [text-rendering:optimizeLegibility]"
            >
              <p>
                We're photographing 1000 women around the world make-up free -
                to challenge beauty standards, reclaim self-worth and dismantle
                the idea that beauty needs fixing.
              </p>
              <p>This is more than a photo series, It’s a global movement. </p>
              <p>And you're invited...</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.2 } }}
              exit={{ opacity: 0 }}
              className="flex flex-col max-md:items-stretch items-center gap-4 max-md:pt-10"
            >
              <a
                href="https://laughlines.com.au/"
                target="_blank"
                onClick={() => {
                  Tracking.trackEvent("Summary - Visit Laugh Lines Website");
                }}
                className={buttonStyles({ variant: "light" }).base({
                  className: "max-md:w-full max-md:px-2",
                })}
              >
                Visit Laugh Lines Website
              </a>
              <a
                href="https://www.instagram.com/laughlinesproject/"
                onClick={() => {
                  Tracking.trackEvent("Summary - Follow on Instagram");
                }}
                className={buttonStyles({
                  variant: "dark",
                  className: "max-md:w-full max-md:px-2",
                }).base()}
              >
                Follow on Instagram
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
