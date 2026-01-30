import FeatureCards from "@/components/modules/dashboard/FeatureCards";

const DashboardPage = async () => {
    return (
        <main className="h-full overflow-y-auto space-y-4 md:space-y-12">
            <FeatureCards />
        </main>
    );
};

export default DashboardPage;
