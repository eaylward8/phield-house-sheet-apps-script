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

      this.updateDates();
      this.addCommishDefaultDays();
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
    const commishDays = {
      'Barsotti': CommishSignUps.for('Barsotti'), // value is array like [true, false, true, false, true]
      'Erik A': CommishSignUps.for('Erik')
    };

    for (const name in commishDays) {
      commishDays[name].forEach((dayBool, idx) => {
        if (!dayBool) return;

        const dailySlots = DailySlotsArr[idx];
        let row = 1;
        let cell = dailySlots.getCell(row, 1);

        // Find next blank cell for that day
        while (!cell.isBlank()) {
          cell = dailySlots.getCell(row++, 1);
        }

        // Once we get to a blank cell, set the name
        cell.setValue(name);
      });
    }
  }

  static updateDates() {
    const mondayRange = Finder.findNamedRange('monDateCells').getRange();
    const lastMonday = new Date(mondayRange.getValue());
    lastMonday.setDate(lastMonday.getDate() + 7);
    mondayRange.setValue(lastMonday);
  }
}
