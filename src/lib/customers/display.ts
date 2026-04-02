export function isDeletedAccountEmail(email: string | null | undefined) {
  if (!email) {
    return false
  }

  return /^deleted\+[a-f0-9]{32}@redacted\.local$/i.test(email)
}

export function getCustomerDisplay(customerName: string | null | undefined, customerEmail: string | null | undefined) {
  if (isDeletedAccountEmail(customerEmail)) {
    return {
      primary: 'Deleted account',
      secondary: 'Personal details redacted',
      isDeleted: true,
    }
  }

  return {
    primary: customerName || customerEmail || 'Unknown customer',
    secondary: customerEmail || 'No email provided',
    isDeleted: false,
  }
}