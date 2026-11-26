/** Company facts shown on more than one page. Safe to import from client code. */
export const SITE = {
  name: "InfinityID Labs",
  legalName: "InfinityID Labs Ltd",
  companyNumber: "16544998",
  jurisdiction: "England and Wales",
  address: "3rd Floor, 86–90 Paul Street, London EC2A 4NE",
  contactEmail: "hello@infinityidlabs.xyz",
} as const;

export const CONTACT_MAILTO = `mailto:${SITE.contactEmail}`;
