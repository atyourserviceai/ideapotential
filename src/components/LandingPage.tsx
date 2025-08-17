interface LandingPageProps {
  onSignIn: () => void;
  authError?: string | null;
}

export function LandingPage({ onSignIn, authError }: LandingPageProps) {
  return (
    <div className="w-full py-4 md:py-6 px-3 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-block max-w-4xl w-full mx-auto rounded-2xl bg-transparent supports-[backdrop-filter]:backdrop-blur-[8px] px-4 md:px-6 lg:px-10 py-6 md:py-8 lg:py-10">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              The #1 Idea Grader for Pre-Revenue Indie Founders & Bootstrapped
              Startups
            </h1>
            <p className="text-lg md:text-xl text-gray-800 dark:text-gray-200 mb-2">
              Spend two minutes to know if your mountain is worth climbing.
            </p>
            <p className="text-blue-700 dark:text-blue-400 italic mb-6 md:mb-8 text-sm md:text-base">
              Free AI credits to get you going.
            </p>

            {authError && (
              <div className="mb-4 md:mb-6 p-3 bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 rounded-lg max-w-md mx-auto">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {authError}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onSignIn}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 px-6 md:px-8 rounded-lg text-base md:text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              Get My Scorecard →
            </button>
          </div>
        </div>

        {/* What You Get Section */}
        <div className="bg-white/90 dark:bg-black/60 rounded-2xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-blue-500/20 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 text-center">
            What you get in one quick session
          </h2>
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-3 md:space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  10-factor reality check
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  See exactly which basics you're missing and why they matter.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Evidence, not opinions
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  We auto-pull backlinks, social stats, and a live landing-page
                  snapshot while you answer 15 rapid-fire questions.
                </p>
              </div>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  One smart tweak
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  A single, smallest-effort change proven to lift your weakest
                  score.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Shareable proof
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Download a polished PDF or post your public link for instant
                  peer feedback.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist Table */}
        <div className="bg-white/90 dark:bg-black/60 rounded-2xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8 border border-gray-200 dark:border-blue-500/20 shadow-2xl">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 text-center">
            The Checklist We Grade You Against
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="text-left py-2 font-bold text-gray-900 dark:text-white">
                    #
                  </th>
                  <th className="text-left py-2 font-bold text-gray-900 dark:text-white">
                    Factor
                  </th>
                  <th className="text-left py-2 font-bold text-gray-900 dark:text-white">
                    What "5/5" Looks Like
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-700 dark:text-gray-300">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">1</td>
                  <td className="py-2 font-medium">Problem Clarity</td>
                  <td className="py-2">
                    One-sentence JTBD anyone could repeat
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">2</td>
                  <td className="py-2 font-medium">Outcome Satisfaction Gap</td>
                  <td className="py-2">
                    Users rate pain "important 5 / satisfied &le;2"
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">3</td>
                  <td className="py-2 font-medium">
                    Solution Evidence & Value
                  </td>
                  <td className="py-2">
                    Working demo + profitable unit economics
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">4</td>
                  <td className="py-2 font-medium">Founder–Solution Fit</td>
                  <td className="py-2">
                    Deep domain edge & high personal passion
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">5</td>
                  <td className="py-2 font-medium">Team-Scope & Market Fit</td>
                  <td className="py-2">
                    Current team can ship MVP in &le;3 months; market big enough
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">6</td>
                  <td className="py-2 font-medium">
                    Competitive Moat (Hamilton's 7 Powers)
                  </td>
                  <td className="py-2">At least one power rated &ge;4</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">7</td>
                  <td className="py-2 font-medium">Market-Pain Mentions</td>
                  <td className="py-2">
                    50+ public posts <em>and</em> 5 direct conversations
                    confirming pain
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">8</td>
                  <td className="py-2 font-medium">Early Demand (+Social)</td>
                  <td className="py-2">
                    Paid pre-orders or 100+ wait-list with engaged followers
                  </td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">9</td>
                  <td className="py-2 font-medium">Traffic Authority (SEO)</td>
                  <td className="py-2">
                    Domain Rating &gt; 50 or 10k/mo organic visits
                  </td>
                </tr>
                <tr>
                  <td className="py-2">10</td>
                  <td className="py-2 font-medium">Marketing-Product Fit</td>
                  <td className="py-2">Proven CAC &lt; LTV/3 on real spend</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center mt-4 font-medium text-gray-900 dark:text-white">
            Your overall <strong>Readiness %</strong> dial is the average of
            these ten scores.
          </p>
        </div>

        {/* How It Works */}
        <div className="bg-white/90 dark:bg-black/60 rounded-2xl p-6 md:p-8 mb-8 border border-gray-200 dark:border-blue-500/20 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            How it works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                1. Chat.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Describe your idea—no rigid forms.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🔍</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                2. Enrich.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We fetch SEO & social signals while you type.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                3. Grade.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Instant color-coded grid + Readiness % dial.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                4. Act & Share.
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Apply your tweak, invite peers to verify, or post your scorecard
                badge online.
              </p>
            </div>
          </div>
        </div>

        {/* Zero-risk Pricing */}
        <div className="bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-xl p-8 mb-8 border border-gray-200 dark:border-blue-500/20 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Zero-risk pricing
          </h2>
          <p className="text-center text-gray-700 dark:text-gray-300 mb-6">
            Unlimited ideas • Free starter credits • Pay only for extra AI
            usage—
            <br />
            or plug in your own OpenAI key for <strong>$0</strong> platform fee.
          </p>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <p className="text-xl font-medium text-gray-900 dark:text-white mb-6">
            Stop guessing. Know before you build.
          </p>
          <button
            type="button"
            onClick={onSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Start Assessment →
          </button>
        </div>
      </div>
    </div>
  );
}
