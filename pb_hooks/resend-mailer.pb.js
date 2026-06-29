/// <reference path="../pb_data/types.d.ts" />

onMailerSend((e) => {
  const apiKey = $os.getenv("RESEND_API_KEY")
  if (!apiKey) throw new Error("RESEND_API_KEY not set")

  const res = $http.send({
    method: "POST",
    url: "https://api.resend.com/emails",
    body: JSON.stringify({
      from: (e.message.from.name || "OTTracker") + " <" + e.message.from.address + ">",
      to: e.message.to.map((a) => a.address),
      subject: e.message.subject,
      html: e.message.html,
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey,
    },
  })

  if (res.statusCode >= 300) {
    throw new Error("Resend API error " + res.statusCode + ": " + res.raw)
  }
  // Intentionally no e.next() -- this fully replaces the default SMTP mailer
  // (Railway blocks outbound SMTP ports; HTTPS/443 to Resend's API works).
})
