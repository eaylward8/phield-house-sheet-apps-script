const venmoNames = Object.keys(venmoNameMap);

class PaymentLogger {
  constructor() {
    this.today = new Date;
    this.month = this.today.getMonth();
    this.dayOfMonth = this.today.getDate();
    this.dayOfWeek = this.today.getDay();
    this.peopleWhoPaid = [];
    this.nameCellMap = this.generateNameCellMap();
    this.paymentLog = Finder.findSheet(SheetNames.paymentLog);
    this.signUpSheet = Finder.findSheet(SheetNames.signUp);
    this.label = GmailApp.getUserLabelByName('Venmo Received');
  }

  logPayments() {
    const threads = this.todaysUnreadThreads;
    if (threads.length === 0) return;

    threads.forEach(thread => {
      const msg = thread.getMessages()[0];
      const timestamp = msg.getDate().toLocaleString();
      const subject = msg.getSubject();
      let [name, amountStr] = subject.split(/paid you/);
      name = name.trim();

      if (!name || !amountStr) {
        Logger.log(`Unexpected subject: ${subject}`);
        return;
      }

      if (!venmoNames.includes(name.toLowerCase())) {
        Emailer.emailMe('PH: Name not in venmoNames list', `Name: ${name}`)
        Logger.log(`Name not in list: ${name}`);
        return;
      }

      let amount = Number(amountStr.match(/\d+\.\d{2}/)[0]);
      if (amount < 9 || amount > 12) {
        Emailer.emailMe('PH: Unexpected amount received', `Name: ${name}, Amount: ${amount}`);
        return;
      }

      const [sheetName, cellA1Notation] = this.findCellForName(name);
      this.logPayment(name, amount, timestamp, sheetName, cellA1Notation);
      this.peopleWhoPaid.push(name);

      // If a cell has been identified, clear it
      if (cellA1Notation) {
        this.signUpSheet.getRange(cellA1Notation).clearContent();
      }
      msg.markRead();
    })

    if (this.peopleWhoPaid.length > 0) {
      Emailer.emailMe(`PH: Logged ${this.peopleWhoPaid.length} payments`, `Logged payments for: ${this.peopleWhoPaid.join(', ')}`);
    }
  }

  logPayment(venmoName, amount, timeStr, sheetName = '', cellA1Notation = '') {
    const rowToFill = this.paymentLog.getLastRow() + 1;
    const range = this.paymentLog.getRange(`A${rowToFill}:E${rowToFill}`);
    range.setValues([[venmoName, amount, timeStr, sheetName, cellA1Notation]]);
  }

  sendReminders() {
    this.nameCellMap = this.generateNameCellMap();
    const delinquents = Object.keys(this.nameCellMap);
    let emails = delinquents.map(delinquent => {
      for (let name in venmoNameMap) {
        if (delinquent === name || venmoNameMap[name].aliases.includes(delinquent)) {
          return venmoNameMap[name].email;
        }
      }
    })
    emails = emails.filter(email => !!email);
    Emailer.sendPaymentReminders(emails);
  }

  // Expects a Venmo name (first/last) as an argument.
  // Based on that name, it tries to find a match in the sheet, using the "normal" sheet names people use.
  findCellForName(name) {
    const venmoName = name.trim().toLowerCase();
    const aliases = venmoNameMap[venmoName]['aliases'];
    aliases.push(venmoName);
    const matches = [];

    aliases.forEach(alias => {
      const cell = this.nameCellMap[alias];
      if (cell) matches.push(alias, cell);
    });
    // Returning both alias and cell for logging purposes in the Payment Log sheet.
    // If there is anything other than 1 match (alias, cell), return empty array.
    // Don't want to auto-clear any cells in this scenario.
    return matches.length === 2 ? matches : [];
  }

  generateNameCellMap() {
    let todaysSlots;
    let map = {};
    switch(this.dayOfWeek) {
      case 1:
        todaysSlots = DailySlots.monday();
        break;
      case 2:
        todaysSlots = DailySlots.tuesday();
        break;
      case 3:
        todaysSlots = DailySlots.wednesday();
        break;
      case 4:
        todaysSlots = DailySlots.thursday();
        break;
      case 5:
        todaysSlots = DailySlots.friday();
        break;
    }

    for (let i = 1; i < 15; i++) {
      const cell = todaysSlots.getCell(i, 1);
      const name = cell.getDisplayValue().toLowerCase().trim();
      if (!name || name === '') continue;

      map[name] = cell.getA1Notation();
    }
    return map;
  }

  clearErik() {
    const cellA1Notation = this.nameCellMap['erik'];
    if (!cellA1Notation) return;

    this.signUpSheet.getRange(cellA1Notation).clearContent();
  }

  get todaysUnreadThreads() {
    return this.label.getThreads().filter(thread => {
      const lastMsgDate = thread.getLastMessageDate();
      const msgMonth = lastMsgDate.getMonth();
      const msgDayOfMonth = lastMsgDate.getDate();
      return thread.isUnread() && msgMonth === this.month && msgDayOfMonth === this.dayOfMonth;
    });
  }
}
