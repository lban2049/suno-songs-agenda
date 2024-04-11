import getDailyTrendingData from "./jobs/getDailyTrendingData.js";

import createWeeklyTrending from "./jobs/createWeeklyTrending.js";

import createMonthlyTrending from "./jobs/createMonthlyTrending.js";

async function testJob() {
  await getDailyTrendingData();

  await createWeeklyTrending();

  await createMonthlyTrending();

}

testJob();