// import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const config = {};

export default withNextIntl(config);

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;
