import { App } from "~/app/App";
import type { Route } from "./+types/privacy";
import { Link } from "react-router";
import { motion } from "motion/react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mirror Minute ⬩ Laugh Lines" },
    {
      name: "description",
      content:
        "For one minute, there's nothing to fix, perform or hide from. This mirror doesn’t want your good side —it wants your honesty.",
    },
  ];
}

export default function Privacy() {
  return (
    <div>
      <div className="max-w-[1300px] px-5 md:px-20 mx-auto text-indigo-950">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 py-5 md:grid md:grid-cols-3 md:items-center md:py-10">
          <Link
            to="/"
            className="text-sm text-indigo-950 font-serif md:text-md"
          >
            Back to the Mirror Minute
          </Link>
          <Link to="/" className="flex justify-center items-center">
            <svg
              width="230"
              height="32"
              viewBox="0 0 230 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M204.863 16.6246H197.067V18.5314L206.28 18.4639V21.4846H192.898V8.99707H206.28L206.297 12.0177H197.067V13.6714H204.863V16.6246Z"
                fill="#2C2953"
              />
              <path
                d="M177.023 12.3721V8.99707H191.772L177.023 12.3721ZM191.772 8.99707V12.3889H186.507V21.4846H182.356V12.3889H177.023V8.99707H191.772Z"
                fill="#2C2953"
              />
              <path
                d="M171.716 8.99707H175.969V15.3927C175.969 16.6077 175.631 17.7046 174.956 18.6833C174.281 19.6621 173.37 20.4327 172.223 20.9952C171.075 21.5464 169.821 21.8221 168.459 21.8221C166.997 21.8221 165.669 21.5464 164.477 20.9952C163.284 20.4439 162.339 19.6846 161.642 18.7171C160.956 17.7383 160.607 16.6414 160.596 15.4264V8.99707H164.916V15.4264C164.916 16.4502 165.264 17.2039 165.962 17.6877C166.671 18.1714 167.509 18.4133 168.476 18.4133C168.983 18.4133 169.483 18.3177 169.978 18.1264C170.473 17.9239 170.884 17.5977 171.21 17.1477C171.548 16.6977 171.716 16.1239 171.716 15.4264V8.99707Z"
                fill="#2C2953"
              />
              <path
                d="M147.496 21.4846H143.328V8.99707L147.496 21.4846ZM159.275 21.4846H155.124H159.275ZM155.124 16.6414V8.99707H159.275V21.4846H155.124L147.496 13.8402V21.4846H143.328V8.99707H147.496L155.124 16.6414Z"
                fill="#2C2953"
              />
              <path
                d="M141.942 21.4846H137.773V8.99707H141.942V21.4846Z"
                fill="#2C2953"
              />
              <path
                d="M136.38 8.99707V21.4846H132.229V15.8483L129.478 21.4846H125.647L122.711 15.7808V21.4846H118.543V8.99707H123.302L127.554 17.5864L131.739 8.99707H136.38Z"
                fill="#2C2953"
              />
              <path
                d="M107.391 21.4675L103.932 17.4344H101.35V21.4675H97.3672V8.97998H106.8C107.847 8.97998 108.769 9.15436 109.568 9.50311C110.378 9.85186 111.002 10.3412 111.441 10.9712C111.891 11.59 112.116 12.31 112.116 13.1312V13.1987C112.116 14.2675 111.801 15.1506 111.171 15.8481C110.552 16.5456 109.692 17.0125 108.589 17.2487L112.217 21.4675H107.391ZM108.201 13.2325C108.201 12.7937 108.105 12.4731 107.914 12.2706C107.734 12.0681 107.498 11.9444 107.205 11.8994C106.913 11.8544 106.485 11.8319 105.923 11.8319H105.315C104.483 11.8544 103.161 11.8656 101.35 11.8656V14.5487H105.889H105.923C106.485 14.5487 106.913 14.5262 107.205 14.4812C107.498 14.4362 107.734 14.3237 107.914 14.1437C108.105 13.9525 108.201 13.6487 108.201 13.2325Z"
                fill="#2C2953"
              />
              <path
                d="M88.1895 8.72705C89.7308 8.72705 91.1202 9.01393 92.3577 9.58768C93.6064 10.1502 94.5795 10.9321 95.277 11.9333C95.9858 12.9233 96.3402 14.0427 96.3402 15.2914C96.3402 16.5289 95.9858 17.6427 95.277 18.6327C94.5795 19.6227 93.612 20.4046 92.3745 20.9783C91.137 21.5408 89.7477 21.8221 88.2064 21.8221C86.7214 21.8221 85.3489 21.5408 84.0889 20.9783C82.8289 20.4046 81.8277 19.6227 81.0852 18.6327C80.3539 17.6314 79.9883 16.5177 79.9883 15.2914C79.9883 14.0539 80.3539 12.9346 81.0852 11.9333C81.8277 10.9321 82.8233 10.1502 84.072 9.58768C85.332 9.01393 86.7045 8.72705 88.1895 8.72705ZM88.2064 18.6664C88.8364 18.6664 89.4383 18.5314 90.012 18.2614C90.597 17.9914 91.0695 17.6033 91.4295 17.0971C91.7895 16.5908 91.9695 15.9889 91.9695 15.2914C91.9695 14.5939 91.7839 13.9921 91.4127 13.4858C91.0527 12.9683 90.5802 12.5802 89.9952 12.3214C89.4102 12.0514 88.8027 11.9164 88.1727 11.9164C87.5314 11.9164 86.9239 12.0514 86.3502 12.3214C85.7764 12.5914 85.3095 12.9852 84.9495 13.5027C84.6008 14.0089 84.4264 14.6052 84.4264 15.2914C84.4264 15.9889 84.6064 16.5908 84.9664 17.0971C85.3264 17.6033 85.7933 17.9914 86.367 18.2614C86.952 18.5314 87.5652 18.6664 88.2064 18.6664Z"
                fill="#2C2953"
              />
              <path
                d="M74.4808 21.4675L71.0214 17.4344H68.4395V21.4675H64.457V8.97998H73.8902C74.9364 8.97998 75.8589 9.15436 76.6577 9.50311C77.4677 9.85186 78.092 10.3412 78.5308 10.9712C78.9808 11.59 79.2058 12.31 79.2058 13.1312V13.1987C79.2058 14.2675 78.8908 15.1506 78.2608 15.8481C77.642 16.5456 76.7814 17.0125 75.6789 17.2487L79.307 21.4675H74.4808ZM75.2908 13.2325C75.2908 12.7937 75.1952 12.4731 75.0039 12.2706C74.8239 12.0681 74.5877 11.9444 74.2952 11.8994C74.0027 11.8544 73.5752 11.8319 73.0127 11.8319H72.4052C71.5727 11.8544 70.2508 11.8656 68.4395 11.8656V14.5487H72.9789H73.0127C73.5752 14.5487 74.0027 14.5262 74.2952 14.4812C74.5877 14.4362 74.8239 14.3237 75.0039 14.1437C75.1952 13.9525 75.2908 13.6487 75.2908 13.2325Z"
                fill="#2C2953"
              />
              <path
                d="M58.5941 21.4675L55.1347 17.4344H52.5528V21.4675H48.5703V8.97998H58.0034C59.0497 8.97998 59.9722 9.15436 60.7709 9.50311C61.5809 9.85186 62.2053 10.3412 62.6441 10.9712C63.0941 11.59 63.3191 12.31 63.3191 13.1312V13.1987C63.3191 14.2675 63.0041 15.1506 62.3741 15.8481C61.7553 16.5456 60.8947 17.0125 59.7922 17.2487L63.4203 21.4675H58.5941ZM59.4041 13.2325C59.4041 12.7937 59.3084 12.4731 59.1172 12.2706C58.9372 12.0681 58.7009 11.9444 58.4084 11.8994C58.1159 11.8544 57.6884 11.8319 57.1259 11.8319H56.5184C55.6859 11.8544 54.3641 11.8656 52.5528 11.8656V14.5487H57.0922H57.1259C57.6884 14.5487 58.1159 14.5262 58.4084 14.4812C58.7009 14.4362 58.9372 14.3237 59.1172 14.1437C59.3084 13.9525 59.4041 13.6487 59.4041 13.2325Z"
                fill="#2C2953"
              />
              <path
                d="M47.1857 21.4846H43.0176V8.99707H47.1857V21.4846Z"
                fill="#2C2953"
              />
              <path
                d="M41.622 8.99707V21.4846H37.4708V15.8483L34.7202 21.4846H30.8895L27.9533 15.7808V21.4846H23.7852V8.99707H28.5439L32.7964 17.5864L36.9814 8.99707H41.622Z"
                fill="#2C2953"
              />
              <path
                d="M8.48641 0H9.51359C9.9212 2.44399 10.9606 4.41955 12.6318 5.92668C14.3111 7.43381 16.1005 8.28921 18 8.49287V9.51935C16.0598 9.72301 14.2582 10.5866 12.5951 12.11C10.9402 13.6253 9.91304 15.5886 9.51359 18H8.48641C8.10326 15.5479 7.06793 13.5723 5.38043 12.0733C3.69293 10.5662 1.89946 9.71487 0 9.51935V8.49287C1.91576 8.28106 3.71332 7.42159 5.39266 5.91446C7.08016 4.39919 8.11141 2.4277 8.48641 0Z"
                fill="#2C2953"
              />
              <path
                d="M221.571 21.6311C223.165 20.8132 225.603 20.545 229.5 20.2634C225.603 19.9818 223.165 19.7002 221.571 18.8957C222.121 17.1928 223.661 15.2619 226.219 12.312C223.259 14.8597 221.344 16.4017 219.629 16.9514C218.812 15.3558 218.545 12.9154 218.263 9C217.982 12.902 217.701 15.3424 216.897 16.9514C215.196 16.4017 213.268 14.8597 210.321 12.312C212.866 15.2753 214.406 17.1928 214.955 18.8957C213.348 19.7002 210.897 19.9684 207 20.25C210.897 20.5316 213.335 20.8132 214.942 21.6177C214.393 23.3206 212.853 25.2515 210.295 28.2014C213.254 25.6538 215.17 24.1117 216.871 23.5486C217.687 25.1442 217.955 27.5846 218.237 31.5C218.518 27.598 218.799 25.1576 219.603 23.5486C221.304 24.0983 223.232 25.6403 226.179 28.2014C223.661 25.2515 222.121 23.334 221.571 21.6311Z"
                fill="#2C2953"
              />
            </svg>
          </Link>
        </div>
        {/* Content */}
        <div className="mx-auto md:max-w-[60%] pt-5 md:pt-10 privacy-text">
          <h1 className="font-sans uppercase text-4xl mb-5">Your Privacy</h1>

          <p>
            At{" "}
            <strong>
              Laugh Lines Film Pty Ltd ABN # 39684054251 ( we , us , or our)
            </strong>
            , we are committed to protecting your privacy and making sure your
            personal information is secure to the best of our ability. This
            Privacy Policy explains how we collect, use, store and disclose your
            information to comply with the Privacy Act 1988 (Cth) ( Act ) and
            includes recent amendments made to the Act under the Privacy and
            Other Legislation Amendment Bill 2024 (Cth).
          </p>
          <p>
            When you visit our website or social media accounts, interact with
            us to use our services and/or buy any products from us and provide
            us with your information, you agree to the collection of that
            information and our use of it as set out in this privacy policy.
          </p>

          <h2>Types of personal information we collect</h2>
          <p>
            The types of personal information we may collect about you include:
          </p>
          <ul>
            <li>your name, images and complete contact details;</li>
            <li>your age and/or date of birth;</li>
            <li>payment details;</li>
            <li>any customer survey results and customer service history;</li>
            <li>website access and usage information;</li>
            <li>
              information required for automated decision making processes
              (including where we use
            </li>
            <li>artificial intelligence or other software); and</li>
            <li>
              additional personal information that you or a third party provide
              to us.
            </li>
          </ul>
          <h2>Collection and use of personal information</h2>
          <h3>The Mirror Minute Experience</h3>
          <p>
            The Mirror Minute is designed to be a private, self-guided
            experience. While we may collect personal information across our
            broader services as outlined in this policy, The Mirror Minute
            itself does not record, store, or capture any video, audio, or
            images of you by default. Any camera access is used solely to enable
            the experience and is processed locally on your device. We do not
            collect or retain this data unless you actively choose to submit
            content and provide explicit consent. Where you choose to submit
            content, we will explain how it will be used before collecting it,
            including any potential use across our platforms or creative
            projects. Participation is entirely voluntary, and The Mirror Minute
            is not a medical or mental health service.
          </p>
          <p>We may collect, hold, use and disclose personal information to:</p>
          <ul>
            <li>provide access to and use our website and services;</li>
            <li>communicate with you;</li>
            <li>
              conduct administrative activities such as invoicing and record
              keeping;
            </li>
            <li>conduct marketing, analytics and research;</li>
            <li>fulfill legal obligations and respond to disputes; and</li>
            <li>consider employment applications.</li>
          </ul>
          <h3>Disclosure of personal information to third parties</h3>
          <p>We may disclose personal information to:</p>
          <ul>
            <li>
              third party service providers to enable them to provide their
              services;
            </li>
            <li>our employees and contractors;</li>
            <li>our existing or potential agents or business partners;</li>
            <li>sponsors or promoters of any competition we run;</li>
            <li>
              anyone to whom our business or assets (or any part of them) are,
              or may (in good faith)
            </li>
            <li>be, transferred;</li>
            <li>
              credit reporting agencies, courts, tribunals, and regulatory
              authorities, in the event you fail to pay for goods or services we
              have provided to you;
            </li>
            <li>
              courts, tribunals, regulatory authorities and law enforcement
              officers, as required by law, in connection with any actual or
              prospective legal proceedings, or to establish, exercise, or
              defend our legal rights;
            </li>
            <li>
              third parties, including agents or sub-contractors, who assist us
              in providing information, products, services, or direct marketing
              to you. This may include parties located, or that store data,
              outside of Australia; and
            </li>
            <li>
              third parties for collection and processing of data, such as
              Google Analytics or other relevant businesses. This may include
              parties that store data outside of Australia.
            </li>
          </ul>
        </div>
      </div>
      <div className="my-20">
        <div className="relative flex items-center justify-center text-xs md:text-md font-semibold">
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
      </div>
    </div>
  );
}
