class MessageSetter {
  static getMessageRangeList() {
    const sheet = Finder.findSheet(SheetNames.signUp);
    return sheet.getRangeList([
      MsgCells.monday,
      MsgCells.tuesday,
      MsgCells.wednesday,
      MsgCells.thursday,
      MsgCells.friday
    ]);
  }

  static clearMessages() {
    this.getMessageRangeList().clearContent();
  }

  // Add a flashing message below the date cells.
  // It will flash for a period of time, then stay.
  static flashSheetLive() {
    const rangeList = this.getMessageRangeList();
    const msg = 'SHEET IS LIVE!';
    const color1 = 'red';
    const color2 = 'blue';

    rangeList.setValue(msg);

    for (var i = 0; i <= 100; i++) {
      if (i % 2 == 0) {
        rangeList.setFontColor(color1);
      } else {
        rangeList.setFontColor(color2);
      }
      SpreadsheetApp.flush();
      Utilities.sleep(500);
    }
  }
}


// for (var i = 0; i <= 10; i++) {
    //   if (i % 5 === 0) {
    //     mon.setFontColor('blue');
    //     tue.setFontColor('red');
    //     wed.setFontColor('red');
    //     thu.setFontColor('red');
    //     fri.setFontColor('red');
    //   } else if (i % 5 === 1) {
    //     mon.setFontColor('red');
    //     tue.setFontColor('blue');
    //     wed.setFontColor('red');
    //     thu.setFontColor('red');
    //     fri.setFontColor('red');
    //   } else if (i % 5 === 2) {
    //     mon.setFontColor('red');
    //     tue.setFontColor('red');
    //     wed.setFontColor('blue');
    //     thu.setFontColor('red');
    //     fri.setFontColor('red');
    //   } else if (i % 5 === 3) {
    //     mon.setFontColor('red');
    //     tue.setFontColor('red');
    //     wed.setFontColor('red');
    //     thu.setFontColor('blue');
    //     fri.setFontColor('red');
    //   } else if (i % 5 === 4) {
    //     mon.setFontColor('red');
    //     tue.setFontColor('red');
    //     wed.setFontColor('red');
    //     thu.setFontColor('red');
    //     fri.setFontColor('blue');
    //   }
    //   SpreadsheetApp.flush();
    //   Utilities.sleep(100);
    // }
    // mon.setFontColor('red');