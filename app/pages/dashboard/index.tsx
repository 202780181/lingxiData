export interface DashboardPageData {
  seo: {
    title: string;
    description: string;
  };
}

const dashboardPageData: DashboardPageData = {
  seo: {
    title: "鲸选工作台 - Dashboard",
    description: "鲸选数据工作台空页面。",
  },
};

export async function loadDashboardPageData() {
  return dashboardPageData;
}

export function getDashboardMeta(data?: DashboardPageData) {
  const title = data?.seo.title ?? dashboardPageData.seo.title;
  const description =
    data?.seo.description ?? dashboardPageData.seo.description;

  return [
    { title },
    { name: "description", content: description },
  ];
}

export function DashboardPage(_props: { data: DashboardPageData }) {
  return <main className="min-h-svh bg-white" />;
}
