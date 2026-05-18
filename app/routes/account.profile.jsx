import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Profile · sellanything'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();
  return {};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer = {};
    const validInputKeys = ['firstName', 'lastName'];
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key] = value;
      }
    }

    const {data: result, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!result?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: result.customerUpdate.customer,
      success: true,
    };
  } catch (error) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext();
  const {state} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const customer = action?.customer ?? account?.customer;
  const isSubmitting = state !== 'idle';

  return (
    <div className="max-w-2xl">
      {/* Page heading */}
      <div className="mb-8">
        <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 block">
          Personal information
        </span>
        <h2 className="font-black tracking-tight uppercase text-2xl lg:text-3xl text-foreground m-0">
          My profile
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your name appears on order confirmations and shipping labels. To
          change your email or password, use Shop&apos;s account settings.
        </p>
      </div>

      {/* Form */}
      <Form method="PUT" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="First name"
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={customer?.firstName ?? ''}
            minLength={2}
            placeholder="First name"
          />
          <Field
            label="Last name"
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={customer?.lastName ?? ''}
            minLength={2}
            placeholder="Last name"
          />
        </div>

        {/* Feedback */}
        {action?.error && (
          <div className="border border-destructive/40 bg-destructive/5 text-destructive text-sm rounded-md px-4 py-3">
            {action.error}
          </div>
        )}
        {action?.success && !action?.error && (
          <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm rounded-md px-4 py-3">
            Profile updated.
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-foreground text-background font-bold text-sm uppercase tracking-[0.18em] px-8 py-3.5 rounded-md hover:bg-foreground/85 transition disabled:opacity-60 disabled:pointer-events-none"
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </Form>

      {/* Note about email/password */}
      <div className="mt-12 pt-8 border-t border-border">
        <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 block">
          Security
        </span>
        <h3 className="font-bold text-foreground mb-2">
          Email, password &amp; 2FA
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
          These are managed by Shop on Shopify&apos;s secure account page. Visit{' '}
          <a
            href="https://shop.app/account"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-foreground"
          >
            shop.app/account
          </a>{' '}
          to update them.
        </p>
      </div>
    </div>
  );
}

function Field({label, id, name, ...rest}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type="text"
        aria-label={label}
        className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:border-foreground transition"
        {...rest}
      />
    </div>
  );
}

/**
 * @typedef {{
 *   error: string | null;
 *   customer: CustomerFragment | null;
 *   success?: boolean;
 * }} ActionResponse
 */

/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerUpdateInput} CustomerUpdateInput */
/** @typedef {import('./+types/account.profile').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */
