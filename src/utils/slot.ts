export function generateSlotTimeIntervals(
  startTime: string,
  endTime: string,
  slotDuration: number,
  breakStart?: string | null,
  breakEnd?: string | null
): string[] {
  const slots: string[] = [];

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let current = new Date();
  current.setHours(startHour, startMinute, 0, 0);

  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };

  const breakStartMin = breakStart ? toMinutes(breakStart) : null;
  const breakEndMin = breakEnd ? toMinutes(breakEnd) : null;

  while (current < end) {
    const hours = current.getHours().toString().padStart(2, "0");
    const minutes = current.getMinutes().toString().padStart(2, "0");
    const slotLabel = `${hours}:${minutes}`;

    const slotStartMin = toMinutes(slotLabel);
    const inBreak =
      breakStartMin != null &&
      breakEndMin != null &&
      slotStartMin >= breakStartMin &&
      slotStartMin < breakEndMin;

    if (!inBreak) {
      slots.push(slotLabel);
    }

    current.setMinutes(current.getMinutes() + slotDuration);
  }

  return slots;
}
