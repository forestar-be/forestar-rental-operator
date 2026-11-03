import { formatRentalDay, isRentalDay, rentalDays } from './rentalDates.util';
test('PDF date labels and inclusive duration retain civil days across DST and year boundaries', () => {
  expect(isRentalDay('2026-02-30')).toBe(false);
  expect(isRentalDay('2024-02-29')).toBe(true);
  expect(formatRentalDay('2026-11-04')).toBe('04/11/2026');
  expect(rentalDays('2026-11-04', '2026-11-05')).toBe(2);
  expect(rentalDays('2026-03-29', '2026-03-30')).toBe(2);
  expect(rentalDays('2026-10-25', '2026-10-26')).toBe(2);
  expect(rentalDays('2026-12-31', '2027-01-01')).toBe(2);
  expect(rentalDays('2026-11-04', null)).toBe(1);
});
