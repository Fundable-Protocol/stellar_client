import FeatureCard from "./FeatureCard";

const FeatureCards = () => {
  const stream =
    "Set up automated crypto payments once, run forever. Handle subscriptions, salaries, and recurring transfers automatically on Stellar.";

  const balances =
    "View all your Stellar token balances in one place. Track your XLM and custom tokens with real-time updates and easy-to-read formatting.";

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4 md:gap-8">
      <FeatureCard
        title="Payment Stream"
        linkText="Create Stream"
        description={stream}
        link="/payment-stream"
      />
      <FeatureCard
        title="My Balances"
        linkText="View Balances"
        description={balances}
        link="/balances"
      />
    </div>
  );
};

export default FeatureCards;
