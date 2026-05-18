// Minimal Customer Account API query for the header avatar.
//
// We only need firstName / lastName to show the initial-letter avatar
// in the header. Kept separate from CustomerDetailsQuery so root loader
// doesn't pull addresses/defaultAddress on every page load.
//
// NOTE: This file lives in app/graphql/customer-account/ so Hydrogen's
// codegen validates it against the Customer Account API schema
// (which doesn't require the legacy `customerAccessToken` argument).
export const CUSTOMER_HEADER_QUERY = `#graphql
  query CustomerHeader {
    customer {
      firstName
      lastName
    }
  }
`;
