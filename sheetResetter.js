class SheetResetter {
  static reset(dryRun = false) {
    // If this is NOT a dry run, ensure the day is Friday (5).
    if (dryRun === false) {
      const today = new Date;
      if (today.getDay() !== 5) return;
    }

    const allDelinquents = this.getAllDelinquents();

    // Real changes are applied here:
    if (dryRun === false) {
      for (const day in allDelinquents) {
        this.logDelinquents(allDelinquents[day], day);
        DailySlots[day].call().clearContent();
        DailyWaitlistSlots[day].call().clearContent();
      }

      this.addCommishDefaultDays();
      this.updateDates();
    }

    Emailer.sendFridayResetEmail(allDelinquents, dryRun);
  }

  static getAllDelinquents() {
    return {
      monday: this.getDelinquents('monday'),
      tuesday: this.getDelinquents('tuesday'),
      wednesday: this.getDelinquents('wednesday'),
      thursday: this.getDelinquents('thursday'),
      friday: this.getDelinquents('friday')
    }
  }

  static getDelinquents(day) {
    const signUpSlots = DailySlots[day].call();
    return signUpSlots.getDisplayValues().flat().filter(str => {
      const trimmedStr = str.trim();
      return trimmedStr.length > 0 && trimmedStr.toLowerCase() !== 'erik';
    });
  }

  static logDelinquents(arr, day) {
    if (!arr || !arr.length) return;

    const sheet = Finder.findSheet(SheetNames.delinquents);
    const dateStr = Finder.findContent(SheetNames.signUp, DateCells[day])

    arr.forEach(delinquent => {
      const rowToFill = sheet.getLastRow() + 1;
      const range = sheet.getRange(`A${rowToFill}:B${rowToFill}`);
      range.setValues([[dateStr, delinquent]]);
    });
  }

  static addCommishDefaultDays() {
    const mb = 'Barsotti';
    const ea = 'Erik';

    // Barsotti defaults
    DailySlots.monday().getCell(1, 1).setValue(mb)
    DailySlots.wednesday().getCell(1, 1).setValue(mb)
    DailySlots.friday().getCell(1, 1).setValue(mb)

    // Erik defaults
    DailySlots.tuesday().getCell(1, 1).setValue(ea)
    DailySlots.friday().getCell(2, 1).setValue(ea)
  }

  static updateDates() {
    const mondayRange = Finder.findNamedRange('monDateCells').getRange();
    const lastMonday = new Date(mondayRange.getValue());
    lastMonday.setDate(lastMonday.getDate() + 7);
    mondayRange.setValue(lastMonday);
  }
}
