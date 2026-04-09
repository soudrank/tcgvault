import ExpensePage from '@/components/expenses/ExpensePage';
import { getCards } from '@/lib/actions/cards';
import { getExpenses } from '@/lib/actions/expenses';
import { ExpensesHeader } from '@/components/expenses/ExpensesHeader';

export default async function ExpensesRoute() {
  const [cards, expenses] = await Promise.all([getCards(), getExpenses()]);

  const totalPurchase = cards.reduce(
    (sum, c) => sum + c.purchase_price + c.purchase_shipping,
    0
  );
  const totalSales = cards
    .filter((c) => c.sold_price !== null)
    .reduce((sum, c) => sum + (c.sold_price ?? 0), 0);

  return (
    <div style={{ padding: '24px 16px 0', maxWidth: 960, margin: '0 auto' }} className="md:px-6 lg:px-8">
      <ExpensesHeader />
      <ExpensePage
        initialExpenses={expenses}
        totalPurchase={totalPurchase}
        totalSales={totalSales}
      />
    </div>
  );
}
