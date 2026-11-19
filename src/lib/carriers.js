export function providerTone(name) {
  return name === 'Delhivery'
    ? 'delhivery'
    : name === 'India Post'
      ? 'indiapost'
      : name === 'Shadowfax'
        ? 'shadowfax'
        : 'amazon';
}

export function providerLetter(name) {
  return name === 'India Post'
    ? 'i'
    : name === 'Shadowfax'
      ? 's'
      : name === 'Amazon Shipping'
        ? 'a'
        : 'd';
}
