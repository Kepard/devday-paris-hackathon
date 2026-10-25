// Shared by the browser and API so a preference survives trimmed chat history.
export function meetingDeclined(messages, initiallyDeclined = false) {
  let declined = initiallyDeclined;
  let meetingDiscussed = false;
  for (const message of messages) {
    if (message.role === 'assistant') {
      if (/(?:meet|coffee)/i.test(message.content)) meetingDiscussed = true;
      continue;
    }
    const text = message.content;
    const saysNo = /(?:no thanks|not ready|not comfortable|(?:don['’]?t|cannot|can['’]?t|not|never).{0,22}(?:meet|coffee|in person)|rather.{0,20}(?:chat|online))/i.test(text) ||
      (/^(?:no|nope|nah)[.! ]*$/i.test(text.trim()) && meetingDiscussed);
    const optsBackIn = /(?:let['’]?s|shall we|can we|could we|happy to|ready to|want to|would like to).{0,24}(?:meet|grab (?:a )?coffee|have (?:a )?coffee)/i.test(text);
    if (saysNo) declined = true;
    else if (declined && optsBackIn) declined = false;
  }
  return declined;
}
