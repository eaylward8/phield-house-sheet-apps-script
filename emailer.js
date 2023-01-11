class Emailer {
  // NOTE: Google does not let you send an automated email with more than 50 recipients, so the below method is not useful right now.
  // NOTE: If we switch to Google Groups, it could become useful with some modifications.
  //
  // static getPhieldHouseThread() {
  //   const threads = GmailApp.getStarredThreads(0,15);
  //   const phieldHouseThread = threads.find(thread => thread.getFirstMessageSubject().match(/phield house/i));
  //   if (!phieldHouseThread) {
  //     throw 'Phield House thread not found';
  //   }
  //   return phieldHouseThread;
  // }

  static sendFridayResetEmail(delinquentsObj, dryRun) {
    let htmlBody = '';

    if (dryRun === true) {
      htmlBody += '<h3>** DRY RUN **</h3>';
      htmlBody += `Value of dryRun: ${dryRun}, type of dryRun: ${typeof(dryRun)}`
    }

    htmlBody += '<h3>Sheet is live!</h3>';
    htmlBody += this.formatDelinquents(delinquentsObj);
    htmlBody += "<br><br><i>This is an automated email. If you already paid, I probably haven't updated the sheet yet. Email me with any concerns.</i>"

    if (dryRun === true) {
      this.emailMe('** DRY RUN ** Friday Reset', htmlBody);
    } else {
      this.emailMe('Friday Reset', htmlBody);
    }
  }

  static formatDelinquents(delinquentsObj) {
    let htmlStr = '';
    if (Object.values(delinquentsObj).flat().length === 0) return htmlStr;

    htmlStr += '<b><u>Missing Payments</u></b>'
    for (const day in delinquentsObj) {
      if (delinquentsObj[day].length === 0) continue;

      const dayStr = `${day.slice(0, 1).toUpperCase()}${day.slice(1)}`;
      htmlStr += `<br><b>${dayStr}:</b> ${delinquentsObj[day].join(', ')}`;
    }
    htmlStr += '<br><br>Venmo: <b>@Erik-Aylward</b>'

    return htmlStr;
  }

  static sendPaymentReminders(emailArr) {
    let htmlBody = '<p>Friendly reminder: did you pay for ball today? If not, shoot me a venmo: @Erik-Aylward.</p>';
    htmlBody += '<p>This is an automated email. If you already paid, feel free to tell me to kick rocks.</p>';

    MailApp.sendEmail({
      bcc: emailArr.join(','),
      subject: 'Phield House Payment Reminder',
      htmlBody: htmlBody
    })

    this.emailMe('Sent payment reminders', `Sent payment reminders to ${emailArr.join(', ')}`);
  }

  static emailMe(subject, htmlBody = '') {
    MailApp.sendEmail({to: 'eaylward8@gmail.com', subject: subject, htmlBody: htmlBody});
  }
}
