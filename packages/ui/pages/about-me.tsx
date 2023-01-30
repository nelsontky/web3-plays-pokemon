import Head from "next/head";
import tw from "twin.macro";

const styles = {
  root: tw`
    max-w-screen-md
    w-full
    mx-auto
    px-4
    pb-8
  `,
  h1: tw`
    text-7xl
  `,
  h2: tw`
    text-5xl
    mt-4
  `,
  h3: tw`
    text-4xl
    mt-3
  `,
  h4: tw`
    text-3xl
    mt-2
  `,
  text: tw`
    text-2xl
    text-justify
  `,
};

const DESCRIPTION =
  "Gm sers, I am sol_idity and I created Solana Plays Pokemon.";

export default function UiAboutMe() {
  return (
    <div css={styles.root}>
      <Head>
        <title>About Me</title>
        <meta name="description" content={DESCRIPTION} key="desc" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/og-image.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
      </Head>
      <h1 css={styles.h1}>GM.</h1>
      <span css={styles.text}>
        I am{" "}
        <a
          href="https://twitter.com/sol_idity"
          target="_blank"
          rel="noreferrer"
          css={tw`underline`}
        >
          sol_idity
        </a>{" "}
        and I created Solana Plays Pokemon.
      </span>
      <h2 css={styles.h2}>About Me</h2>
      <p css={styles.text}>
        I am a fullstack engineer with an interest in web3 technologies, and I
        have been experimenting and working on web3 technologies for two years
        now. While most of my work is centered on frontend technologies used for
        web3 dapps and scripts, I am very interested in smart contract
        development and wish to get build more novel applications of smart
        contract technology. In the subsequent sections, I will be showcasing
        some of my projects and professional experience.
      </p>
      <h2 css={styles.h2}>Projects</h2>
      <h3 css={styles.h3}>
        Solana Plays Pokemon{" "}
        <span css={styles.text}>
          (
          <a
            css={tw`underline whitespace-nowrap`}
            href="https://github.com/nelsontky/web3-plays-pokemon"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
          )
        </span>
      </h3>
      <p css={styles.text}>
        While I initially intended Solana Plays Pokemon to be a fun exercise on
        onchain voting and blockchain oracle implementations, as more features
        got added, it became the best showcase of all the skills I acquired as
        an engineer. Solana Plays Pokemon is built with a mixture of web2 and
        web3 technologies, and is also the first time I deployed a Solana
        program to mainnet. Additionally, I was invited on a podcast (
        <a
          css={tw`underline`}
          href="https://phantom.app/"
          target="_blank"
          rel="noreferrer"
        >
          Phantom&apos;s
        </a>{" "}
        Zeitgeist podcast) where I shared more on my motivations and experience
        building the dapp!
      </p>
      <iframe
        height="200px"
        width="100%"
        seamless
        src="https://player.simplecast.com/1319ab1a-3de8-4bcf-9ed6-baada5f38974?dark=false"
      ></iframe>
      <h4 css={styles.h4}>Tech stack:</h4>
      <ul css={styles.text}>
        <li>
          Frontend: ReactJS (
          <a
            css={tw`underline`}
            href="https://nextjs.org/"
            target="_blank"
            rel="noreferrer"
          >
            Next.js
          </a>
          )
        </li>
        <li>
          Backend (web2): NodeJS ({" "}
          <a
            css={tw`underline`}
            href="https://nestjs.com/"
            target="_blank"
            rel="noreferrer"
          >
            NestJS
          </a>
          )
        </li>
        <li>
          Smart contracts: Rust ({" "}
          <a
            css={tw`underline`}
            href="https://www.anchor-lang.com/"
            target="_blank"
            rel="noreferrer"
          >
            Anchor
          </a>
          )
        </li>
        <li>
          Database:{" "}
          <a
            css={tw`underline`}
            href="https://firebase.google.com/docs/database"
            target="_blank"
            rel="noreferrer"
          >
            Firebase Realtime Database
          </a>
        </li>
      </ul>
      <h4 css={styles.h4}>Key statistics:</h4>
      <ul css={styles.text}>
        <li>17 GitHub stars</li>
        <li>871+ unique wallet addresses participated in the game</li>
        <li>100k+ transactions sent by players</li>
      </ul>
      <h3 css={styles.h3}>
        GitHub Pages URL Shortener{" "}
        <span css={styles.text}>
          (
          <a
            css={tw`underline whitespace-nowrap`}
            href="https://github.com/nelsontky/gh-pages-url-shortener"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
          )
        </span>
      </h3>
      <p css={styles.text}>
        My proudest web2 contribution on GitHub was a URL shortener I wrote that
        currently has 1162+ stars! This URL shortener uses GitHub issues as a
        &apos;database&apos; of sorts and can be easily deployed on GitHub
        pages.
      </p>
      <h4 css={styles.h4}>Demo:</h4>
      <p css={styles.text}>
        <a
          css={tw`underline font-bold`}
          href="https://nlsn.cf/1"
          target="_blank"
          rel="noreferrer"
        >
          nlsn.cf/1
        </a>{" "}
        will redirect to{" "}
        <span css={tw`font-bold`}>
          https://github.com/nelsontky/gh-pages-url-shortener
        </span>
      </p>
      <h4 css={styles.h4}>Tech stack:</h4>
      <ul css={styles.text}>
        <li>Just plain old HTML and JavaScript!</li>
      </ul>
      <h3 css={styles.h3}>
        Avente Virtual Carnival{" "}
        <span css={styles.text}>
          (
          <a
            css={tw`underline whitespace-nowrap`}
            href="https://github.com/nelsontky/virtual-carnival"
            target="_blank"
            rel="noreferrer"
          >
            Source code
          </a>
          )
        </span>
      </h3>
      <p css={styles.text}>
        My first attempt at game creation, this is a top-down carnival game made
        for a virtual welfare day. Completed the project in a short span of 9
        days without any prior game dev experience!
      </p>
      <h4 css={styles.h4}>Demo:</h4>
      <a
        css={[styles.text, `underline font-bold`]}
        href="https://nelsontky.github.io/virtual-carnival/"
        target="_blank"
        rel="noreferrer"
      >
        https://nelsontky.github.io/virtual-carnival/
      </a>
      <h4 css={styles.h4}>Tech stack:</h4>
      <ul css={styles.text}>
        <li>Phaser</li>
        <li>Database: Firebase Cloud Firestore</li>
      </ul>
      <h2 css={styles.h2}>Professional Experience</h2>
      <h3 css={styles.h3}>
        Frontend Developer,{" "}
        <a
          css={tw`underline`}
          href="https://friktion.fi/"
          target="_blank"
          rel="noreferrer"
        >
          Friktion
        </a>{" "}
        <span css={[styles.text, tw`whitespace-nowrap`]}>
          (Mar 2022 – Jan 2023)
        </span>
      </h3>
      <ul css={[styles.text, tw`list-disc`]}>
        <li>
          Implemented various third party integrations like Wormhole bridge
          integration for cross chain deposits
        </li>
        <li>Integrated wallet libraries across various chains</li>
        <li>
          Led the redesign process of the website with various stakeholders and
          design agency
        </li>
        <li>Reduced network requests by a factor of 3</li>
        <li>Improved site performance by optimizing animations and effects</li>
        <li>Implemented various SVG animations and hover effects on site</li>
      </ul>
      <h3 css={styles.h3}>
        Full Stack Software Engineering Intern,{" "}
        <a
          css={tw`underline`}
          href="https://www.vouchconcierge.com/en/"
          target="_blank"
          rel="noreferrer"
        >
          Vouch
        </a>{" "}
        <span css={[styles.text, tw`whitespace-nowrap`]}>
          (Jan 2021 – June 2021)
        </span>
      </h3>
      <ul css={[styles.text, tw`list-disc`]}>
        <li>
          Worked on mobile Shopify store fronts for museums ({" "}
          <a
            css={tw`underline`}
            href="https://v360.nhb.gov.sg/ccm/"
            target="_blank"
            rel="noreferrer"
          >
            Link
          </a>
          )
        </li>
        <li>
          Learnt VueJS (and Vuex) in 2 days so as to effectively work with the
          company&apos;s tech stack
        </li>
        <li>
          Facilitate communication between remote engineers and on-site product
          managers
        </li>
        <li>
          Helped product managers draw up timelines and scope out expected
          difficulty of projects/features
        </li>
      </ul>
      <h3 css={styles.h3}>
        Full Stack Software Engineering Intern,{" "}
        <a
          css={tw`underline`}
          href="https://constantbearing.com/"
          target="_blank"
          rel="noreferrer"
        >
          Constant Bearing
        </a>{" "}
        <span css={[styles.text, tw`whitespace-nowrap`]}>
          (May 2022 – Aug 2020)
        </span>
      </h3>
      <ul css={[styles.text, tw`list-disc`]}>
        <li>
          Oversaw the development process of the app from scratch with ReactJS
          and MeteorJS
        </li>
        <li>Completed MVP with co-founder within 3 months</li>
        <li>
          Secured a quarter million (Singapore dollars) contract with the MVP
          demo
        </li>
      </ul>
    </div>
  );
}
