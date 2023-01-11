# Phield House Basketball Sign-Up Sheet Automation

This repo holds a copy of [Google Apps Script](https://developers.google.com/apps-script/) code that provides automation
to a Google Sheet used for managing pickup basketball signups at the Phield House in Philadelphia, PA.

Prior to implementing this code, all of the steps listed below needed to happen manually. This was a quick-n-dirty solution written in a short period of time, and so far it has worked well. If I had more time on my hands, perhaps I'd create an entire web app for managing this process. For now, this is good enough.

## How it works
Pickup games happen every morning, Monday through Friday. We use a Google Sheet for signups. Every Friday around 5:30 pm, the sheet needs to be reset so people can sign up for the next week. After playing, each person sends a payment for that day (typically via Venmo).

This code (along with a few jobs in Google Cloud Scheduler) provides the following automations:
- On Fridays around 5:30 pm, it:
  - Moves any remaining names on the Sign-Up Sheet to the Delinquents sheet. This is to track people who have not yet paid.
  - Clears the Waitlist cells
  - Adds default sign-ups for the "commissioners"
  - Updates the date cells to next week's dates
- On an hourly basis on weekdays, it:
  - Checks for unread "Venmo received" emails
  - Attempts to match the Venmo payer to a name on the Sign-Up sheet
  - Removes the name from the Sign-Up sheet (if a single match was found), and logs the payment activity on the Payment Log sheet
  - Sends email reminders to anyone who has not paid by 5 pm, if possible

## Note
This code is not able to be run on its own. It needs to be run in Google Apps Script, in the context of a specific Google Sheet.

Also, for privacy reasons, some code has been omitted.