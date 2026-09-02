# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top. In `ExpenseList.jsx`, the sort subtracted `dateValue(a.date) - dateValue(b.date)` (ascending order). In addition, `dateValue` in `src/lib/format.js` returned the raw date string without converting to epoch timestamps, causing subtraction on strings to evaluate to `NaN`.

**What I changed:** Updated `ExpenseList.jsx` to sort descending using `dateValue(b.date) - dateValue(a.date)` and updated `dateValue` in `src/lib/format.js` to parse date strings and `Date` objects into millisecond epoch timestamps for accurate numerical sorting.

---

## Bug 2

**How to reproduce:** Look at the Balances panel for members with positive or negative balances (e.g. Ben Okonkwo who paid $276 vs his $217 share, and Aisha Khan who paid $148 vs her $233.01 share).

**What is wrong:** The balances UI is inverted: Ben (who is owed $59.00) is displayed with label `owes $59.00` in red (`.owe`), while Aisha (who owes $85.01) is displayed with label `is owed $85.01` in green (`.owed`).

**What I changed:** In `src/components/BalancesPanel.jsx`, swapped the conditional branches so positive balances (`bal > 0.005`) render `is owed ${formatMoney(bal)}` with CSS class `owed`, and negative balances (`bal < -0.005`) render `owes ${formatMoney(-bal)}` with CSS class `owe`.

---

## Bug 3

**How to reproduce:** Check expense "Uber to airport" ($60 paid by Diya Patel, split between Aisha and Ben). Check Diya's balance in the Balances panel.

**What is wrong:** When a payer covers an expense for others without participating in the split themselves, `computeBalances` in `src/lib/balances.js` contained an erroneous block (`if (!(exp.paidBy in shares) ...) bal[exp.paidBy] -= Number(exp.amount) / n;`) that deducted an equal share from the payer. This caused Diya to be credited only $30 instead of $60 and broke group balance cancellation (the sum of all balances equaled -$30.00 instead of $0.00).

**What I changed:** Removed the non-participant payer deduction block from `computeBalances` in `src/lib/balances.js` so that payers receive full credit for what they paid and only members included in `shares` are debited their shares.

---

## Bug 4

**How to reproduce:** Split $100 equally among 3 people, or create a custom percentage split of $20 with 33.33%, 33.33%, 33.34%.

**What is wrong:** In `src/lib/money.js`, `splitEqual` divided `amount / n` and rounded each share independently with `toFixed(2)` ($33.33 each), causing the sum of shares to equal $99.99 (losing $0.01). `splitByPercent` similarly rounded individual shares independently without reconciling rounding remainders to the total bill amount.

**What I changed:** Refactored `splitEqual` and `splitByPercent` in `src/lib/money.js` to compute shares in integer cents and distribute remainder cents among split participants so the sum of individual shares always matches the total bill amount down to the exact penny.

---

## Bug 5

**How to reproduce:** In the "Add expense" form, select "Custom %" with 3 members set to 33.33%, 33.33%, and 33.34%, then try to submit.

**What is wrong:** `percentsSumTo100` checked `values.reduce((a, b) => a + b, 0) === 100`. In JavaScript, `33.33 + 33.33 + 33.34 === 100.00000000000001 !== 100`, falsely rejecting valid 100% distributions with the error "Percentages must add to 100.".

**What I changed:** Updated `percentsSumTo100` in `src/lib/money.js` to use an epsilon comparison: `Math.abs(sum - 100) < 0.01`.

---

## Bug 6

**How to reproduce:** Settle up a group where a debtor owes the exact amount a creditor is owed (e.g. Member A owes $50 and Member B is owed $50).

**What is wrong:** In `src/lib/settle.js`, when `d.amount === c.amount` (the `else` branch in the settlement loop), `i` and `j` were incremented without pushing a transfer object to `transfers`. This silently dropped equal settlement transactions and left members unsettled.

**What I changed:** In `src/lib/settle.js`, updated the settlement loop to calculate `Math.min(d.amount, c.amount)` in integer cents, record the transfer for equal balances as well as partial balances, and accurately deduct the settled amounts.

---

## Bug 7

**How to reproduce:** In the "Filter" section, select any member from the "Paid by" dropdown.

**What is wrong:** The expense list shows "No expenses match these filters" regardless of how many expenses that member paid. The `<select>` element emits a string value (e.g. `"1"`), whereas `expense.paidBy` is stored as a number (`1`), causing strict inequality `e.paidBy !== paidBy` (`1 !== "1"`) to evaluate to `true` for every expense.

**What I changed:** In `src/App.jsx`, updated the filter condition to compare numeric values: `Number(e.paidBy) !== Number(paidBy)`.

---

## Bug 8

**How to reproduce:** Filter the list or view the sorted list (where display order differs from the raw state order). Click "Delete" on the top expense (Board game, 15 Mar) or edit its amount.

**What is wrong:** `ExpenseList` passed the array index in the filtered/sorted view (`onDeleteAt(index)`), and the reducer spliced `state.expenses[action.index]`. This deleted or modified a completely different expense in `state.expenses` (e.g., deleting "Groceries" instead of "Board game").

**What I changed:** Refactored `DELETE_EXPENSE` and `UPDATE_EXPENSE` in `src/state/store.js` and `src/App.jsx` to identify and update expenses by unique `id` rather than array index.

---

## Bug 9

**How to reproduce:** Edit the amount in an expense row, then filter the list or delete an item above it.

**What is wrong:** `ExpenseList.jsx` rendered `ExpenseRow` with `key={index}` instead of `key={expense.id}`. Because React reused the component instances at each index, the internal `draft` state retained values from previously positioned rows.

**What I changed:** Used `key={expense.id}` in `src/components/ExpenseList.jsx` and added an effect in `ExpenseRow` to synchronize `draft` with `expense.amount`. Also added Enter key handling and draft reset on invalid blur.

---

## Bug 10

**How to reproduce:** Enter a name into "Add member" in the Summary card and click "Add".

**What is wrong:** The new member is added to the group, but they do not appear in the "Paid so far" list in the Summary card. `perPerson` was wrapped in `useMemo(..., [expenses])`, which lacked `members` in its dependency array.

**What I changed:** In `src/components/SummaryCards.jsx`, added `members` to the `useMemo` dependency array (`[members, expenses]`).

---

## Bug 11

**How to reproduce:** Fill out and submit the "Add expense" form.

**What is wrong:** The description and amount input fields remain filled with the previous values instead of clearing for the next entry.

**What I changed:** In `src/components/AddExpenseForm.jsx`, reset `description` to `""`, `amount` to `""`, and `error` to `""` upon successful submission.

---

## Bug 12

**How to reproduce:** Refresh the page after state has been saved to `localStorage`. Look at the expense dates in the list.

**What is wrong:** `loadState` in `src/state/store.js` returned raw `JSON.parse(raw)` without calling `hydrate`. Dates became strings instead of Date objects. Furthermore, `formatDate` in `src/lib/format.js` only checked `if (date instanceof Date)` and returned raw ISO slices (`"2026-03-12"`) for string dates instead of localized formatted dates (`"12 Mar 2026"`).

**What I changed:** Updated `loadState` in `src/state/store.js` to hydrate loaded data, and updated `formatDate` in `src/lib/format.js` to parse both `Date` objects and date strings into localized date strings without timezone shifts.

---

## Bug 13

**How to reproduce:** In "Add expense", select "Custom %", unselect a member chip, and adjust the remaining selected members to sum to 100%. Click "Save expense".

**What is wrong:** `percentsSumTo100` summed all keys in the `percents` state object (including unselected members), causing validation to fail because the total was over 100%.

**What I changed:** In `src/components/AddExpenseForm.jsx`, filtered `percents` to only include members currently present in `splitWith` before validating and dispatching.

