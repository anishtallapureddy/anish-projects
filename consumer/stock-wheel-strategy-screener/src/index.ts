import { runDailyPipeline } from './orchestrator';

(async () => {
  try {
    const { email } = await runDailyPipeline();
    console.log('\n' + '='.repeat(50));
    console.log('📧 EMAIL PREVIEW:');
    console.log('='.repeat(50));
    console.log(email);
  } catch (err) {
    console.error('❌ Pipeline failed:', err);
    process.exit(1);
  }
})();
