const DateCells = {
  monday: 'A3',
  tuesday: 'C3',
  wednesday: 'E3',
  thursday: 'G3',
  friday: 'I3'
}

const SheetNames = {
  signUp: 'Sign-Up Sheet',
  delinquents: 'Delinquents',
  paymentLog: 'Payment Log'
}

class Finder {
  static findSheet(name) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
    if (!sheet) {
      throw `Sheet not found. Sheet name: ${name}`;
    }
    return sheet;
  }

  static findNamedRange(name) {
    return Finder.findSheet(SheetNames.signUp).getNamedRanges().find(range => range.getName() == name);
  }

  static findContent(sheetName, rangeStr) {
    return Finder.findSheet(sheetName).getRange(rangeStr).getDisplayValue();
  }
}

const DailySlots = {
  monday() {
    return Finder.findNamedRange('monSlots').getRange();
  },
  tuesday() {
    return Finder.findNamedRange('tueSlots').getRange();
  },
  wednesday() {
    return Finder.findNamedRange('wedSlots').getRange();
  },
  thursday() {
    return Finder.findNamedRange('thuSlots').getRange();
  },
  friday() {
    return Finder.findNamedRange('friSlots').getRange();
  },
}

const DailyWaitlistSlots = {
  monday() {
    return Finder.findNamedRange('monWaitlistSlots').getRange();
  },
  tuesday() {
    return Finder.findNamedRange('tueWaitlistSlots').getRange();
  },
  wednesday() {
    return Finder.findNamedRange('wedWaitlistSlots').getRange();
  },
  thursday() {
    return Finder.findNamedRange('thuWaitlistSlots').getRange();
  },
  friday() {
    return Finder.findNamedRange('friWaitlistSlots').getRange();
  },
}
