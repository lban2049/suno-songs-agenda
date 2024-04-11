import { Agenda } from '@hokify/agenda';
import getDailyTrendingData from './jobs/getDailyTrendingData.js';
import createWeeklyTrending from './jobs/createWeeklyTrending.js';
import createMonthlyTrending from './jobs/createMonthlyTrending.js';

function time() {
  return new Date().toTimeString().split(' ')[0];
}

const mongoConnectionString = process.env.AGENDA_MONGODB_URL;
if (!mongoConnectionString) {
  console.error('AGENDA_MONGODB_URL environment variable is not defined');
  process.exit(1);
}

const agenda = new Agenda({db: {address: mongoConnectionString}});

// agenda.define('example', (job, done) => {
//   console.log(new Date(), 'Example job');
//   done();
// });

// Obtain the trending list daily at midnight.
agenda.define('getDailyTrendingData', async (job) => {
  console.log(new Date(), 'Get daily trending data');
  await getDailyTrendingData();
});

// Add Language Weekly Ranking List.
agenda.define('createWeeklyTrending', async (job) => {
  console.log(new Date(), 'Create weekly trending');
  await createWeeklyTrending();
});

// Add Language Monthly Ranking List.
agenda.define('createMonthlyTrending', async (job) => {
  console.log(new Date(), 'Create monthly trending');
  await createMonthlyTrending();
});

(async function () {
  console.log(new Date(), 'Agenda started');
  agenda.processEvery('1 second');
	// IIFE to give access to async/await
	await agenda.start();

  // Obtain the trending list daily at midnight.
  await agenda.every('0 0 * * *', 'getDailyTrendingData');
  // await agenda.every('10 seconds', 'getDailyTrendingData'); // test

  // Add Language Weekly Ranking List.
  await agenda.every('10 0 * * 3', 'createWeeklyTrending');

  // Add Monthly Ranking List.
  await agenda.every('30 0 1 * *', 'createMonthlyTrending');

  agenda.on('start', (job) => {
    console.log(time(), `Job <${job.attrs.name}> starting`);
  });
  agenda.on('success', (job) => {
    console.log(time(), `Job <${job.attrs.name}> succeeded`);
  });
  agenda.on('fail', (error, job) => {
    console.log(time(), `Job <${job.attrs.name}> failed:`, error);
  });

})();
