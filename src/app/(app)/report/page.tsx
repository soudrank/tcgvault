import AnnualReport from '@/components/report/AnnualReport';
import { getCards } from '@/lib/actions/cards';
import { getExpenses } from '@/lib/actions/expenses';

export default async function ReportPage() {
  const [cards, expenses] = await Promise.all([getCards(), getExpenses()]);
  return (
    <div style={{ padding: '24px 16px 0', maxWidth: 960, margin: '0 auto' }} className="md:px-6 lg:px-8">
      <AnnualReport cards={cards} expenses={expenses} />
    </div>
  );
}
