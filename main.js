function generateOutput(status, msg = '') {
  let output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.append(JSON.stringify({status: status, msg: msg}));
  return output;
}

function shouldLogPayments() {
  const today = new Date;
  const dayOfWeek = today.getDay();

  // Safe to log payments any time M-Th
  if ([1, 2, 3, 4].includes(dayOfWeek)) return true;

  // On Fridays, stop logging payments after 5:15 pm so as not to interfere with sheet reset
  if (dayOfWeek === 5) {
    return today.getHours() <= 17 && today.getMinutes() <= 15;
  }

  return false;
}

function shouldSendReminderEmails() {
  const today = new Date;
  const day = today.getDay();
  const hour = today.getHours();

  // Send reminders at 12, 4, and 8pm M-Th
  if ([1, 2, 3, 4].includes(day) && [12, 16, 20].includes(hour)) {
    return true;
  }

  // Send reminders at 12 and 4pm on Friday
  if ([5].includes(day) && [12, 16].includes(hour)) {
    return true;
  }
}

function doPost(e) {
  const validActions = ['resetSheet', 'logPayments'];

  if (!SanityChecker.check()) {
    Emailer.emailMe('ERROR: Sanity check failed', 'Check the sheet. Some cells do not have the expected values.');
    return generateOutput('error', 'Sheet is screwed up')
  }

  // Handle no event (not sure how this would happen)
  if (!e) {
    Emailer.emailMe('ERROR: No doPost event object', `Value of e: ${e}`);
    return generateOutput('error', 'https://youtu.be/j58V2vC9EPc');
  }

  // Request body should have key and action
  const {key, action, dryRun} = JSON.parse(e.postData.contents);

  // Handle missing/incorrect key. This would mean something unknown is POSTing to this URL.
  if (key !== ApiKey) {
    Emailer.emailMe('ERROR: doPost unexpected key', `Value of key: ${key}`);
    return generateOutput('error', 'https://youtu.be/QjL7D33xpS4');
  }

  // Handle missing/invalid action (action should be list of things I accept)
  if (!validActions.includes(action)) {
    Emailer.emailMe('ERROR: doPost unexpected action', `Value of action: ${action}`);
    return generateOutput('error', 'https://youtu.be/rvNAwoYhzjM');
  }

  // If we make it here, execute whatever function corresponds to the action
  try {
    if (action === 'resetSheet') {
      SheetResetter.reset(dryRun);
      Emailer.emailMe(`${action} succeeded`)
    }

    if (action === 'logPayments') {
      // Don't log payments/clear names on Fridays after 5 - can interfere with sheet reset
      if (shouldLogPayments()) {
        const paymentLogger = new PaymentLogger;
        paymentLogger.logPayments();
        paymentLogger.clearErik();
      }

      if (shouldSendReminderEmails()) {
        const paymentLogger = new PaymentLogger;
        paymentLogger.sendReminders();
      }
    }

    return generateOutput('ok');
  } catch(e) {
    Emailer.emailMe('ERROR: Something went wrong', `Value of e: ${e}`);
    return generateOutput('error', 'https://youtu.be/dQw4w9WgXcQ');
  }
}
