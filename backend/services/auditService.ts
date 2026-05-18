import axios from "axios";

export interface AuditResult {
  score: number;
  metrics: {
    lcp: string;
    fid?: string;
    tbt: string;
    cls: string;
    fcp: string;
    speedIndex: string;
  };
  details: {
    title: string;
    description: string;
    score: number;
  }[];
}

export const handleSiteAudit = async (url: string): Promise<AuditResult> => {
  const apiKey = process.env.PAGESPEED_API_KEY || "";
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
    url
  )}&category=PERFORMANCE&category=SEO&key=${apiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    const lighthouse = data.lighthouseResult;
    const audits = lighthouse.audits;

    const result: AuditResult = {
      score: lighthouse.categories.performance.score * 100,
      metrics: {
        lcp: audits["largest-contentful-paint"].displayValue,
        tbt: audits["total-blocking-time"].displayValue,
        cls: audits["cumulative-layout-shift"].displayValue,
        fcp: audits["first-contentful-paint"].displayValue,
        speedIndex: audits["speed-index"].displayValue,
      },
      details: [
        {
          title: "Largest Contentful Paint",
          description: audits["largest-contentful-paint"].description,
          score: audits["largest-contentful-paint"].score,
        },
        {
          title: "Cumulative Layout Shift",
          description: audits["cumulative-layout-shift"].description,
          score: audits["cumulative-layout-shift"].score,
        },
        {
          title: "Total Blocking Time",
          description: audits["total-blocking-time"].description,
          score: audits["total-blocking-time"].score,
        },
      ],
    };

    return result;
  } catch (error: any) {
    console.error("PageSpeed API error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || "Failed to audit site. Make sure the URL is valid."
    );
  }
};
