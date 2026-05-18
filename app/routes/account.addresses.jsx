import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {useState} from 'react';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Addresses · sellanything'}];
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

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {status: 401},
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address = {};
    const keys = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        try {
          const {data: result, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );
          if (errors?.length) throw new Error(errors[0].message);
          if (result?.customerAddressCreate?.userErrors?.length)
            throw new Error(result.customerAddressCreate.userErrors[0].message);
          if (!result?.customerAddressCreate?.customerAddress)
            throw new Error('Customer address create failed.');
          return {
            error: null,
            createdAddress: result.customerAddressCreate.customerAddress,
            defaultAddress,
          };
        } catch (error) {
          return data(
            {error: {[addressId]: error?.message ?? String(error)}},
            {status: 400},
          );
        }
      }

      case 'PUT': {
        try {
          const {data: result, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );
          if (errors?.length) throw new Error(errors[0].message);
          if (result?.customerAddressUpdate?.userErrors?.length)
            throw new Error(result.customerAddressUpdate.userErrors[0].message);
          if (!result?.customerAddressUpdate?.customerAddress)
            throw new Error('Customer address update failed.');
          return {error: null, updatedAddress: address, defaultAddress};
        } catch (error) {
          return data(
            {error: {[addressId]: error?.message ?? String(error)}},
            {status: 400},
          );
        }
      }

      case 'DELETE': {
        try {
          const {data: result, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );
          if (errors?.length) throw new Error(errors[0].message);
          if (result?.customerAddressDelete?.userErrors?.length)
            throw new Error(result.customerAddressDelete.userErrors[0].message);
          if (!result?.customerAddressDelete?.deletedAddressId)
            throw new Error('Customer address delete failed.');
          return {error: null, deletedAddress: addressId};
        } catch (error) {
          return data(
            {error: {[addressId]: error?.message ?? String(error)}},
            {status: 400},
          );
        }
      }

      default:
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {status: 405},
        );
    }
  } catch (error) {
    return data(
      {error: error?.message ?? String(error)},
      {status: 400},
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext();
  const {defaultAddress, addresses} = customer;
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div>
      {/* Heading */}
      <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
        <div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 block">
            Saved locations
          </span>
          <h2 className="font-black tracking-tight uppercase text-2xl lg:text-3xl text-foreground m-0">
            Addresses
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Set a default shipping address for faster checkout.
          </p>
        </div>
        {!showNewForm && (
          <button
            type="button"
            onClick={() => setShowNewForm(true)}
            className="bg-foreground text-background font-bold text-xs uppercase tracking-[0.18em] px-5 py-3 rounded-md hover:bg-foreground/85 transition"
          >
            + Add address
          </button>
        )}
      </div>

      {/* New address form (collapsible) */}
      {showNewForm && (
        <div className="bg-secondary border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">
              New address
            </h3>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          <NewAddressForm onCreated={() => setShowNewForm(false)} />
        </div>
      )}

      {/* Existing addresses */}
      {!addresses.nodes.length ? (
        <div className="border border-dashed border-border rounded-lg p-12 text-center bg-secondary/50">
          <p className="text-foreground font-medium mb-2">
            No saved addresses yet.
          </p>
          <p className="text-sm text-muted-foreground">
            Click <strong>+ Add address</strong> above to create one.
          </p>
        </div>
      ) : (
        <ExistingAddresses
          addresses={addresses}
          defaultAddress={defaultAddress}
        />
      )}
    </div>
  );
}

function NewAddressForm({onCreated}) {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <div className="flex gap-3 pt-2">
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
            className="bg-foreground text-background font-bold text-xs uppercase tracking-[0.18em] px-6 py-3 rounded-md hover:bg-foreground/85 transition disabled:opacity-60"
          >
            {stateForMethod('POST') !== 'idle' ? 'Creating…' : 'Create address'}
          </button>
        </div>
      )}
    </AddressForm>
  );
}

/**
 * @param {Pick<CustomerFragment, 'addresses' | 'defaultAddress'>}
 */
function ExistingAddresses({addresses, defaultAddress}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {addresses.nodes.map((address) => (
        <AddressCard
          key={address.id}
          address={address}
          defaultAddress={defaultAddress}
        />
      ))}
    </div>
  );
}

function AddressCard({address, defaultAddress}) {
  const [editing, setEditing] = useState(false);
  const isDefault = defaultAddress?.id === address.id;

  if (editing) {
    return (
      <div className="bg-secondary border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground uppercase tracking-wider text-sm">
            Edit address
          </h3>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
        <AddressForm
          addressId={address.id}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                disabled={stateForMethod('PUT') !== 'idle'}
                formMethod="PUT"
                type="submit"
                className="bg-foreground text-background font-bold text-xs uppercase tracking-[0.18em] px-6 py-3 rounded-md hover:bg-foreground/85 transition disabled:opacity-60"
              >
                {stateForMethod('PUT') !== 'idle' ? 'Saving…' : 'Save'}
              </button>
              <button
                disabled={stateForMethod('DELETE') !== 'idle'}
                formMethod="DELETE"
                type="submit"
                className="border border-destructive text-destructive font-bold text-xs uppercase tracking-[0.18em] px-6 py-3 rounded-md hover:bg-destructive hover:text-white transition disabled:opacity-60"
              >
                {stateForMethod('DELETE') !== 'idle' ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}
        </AddressForm>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-5 flex flex-col">
      {isDefault && (
        <span className="self-start text-[10px] uppercase tracking-[0.2em] font-bold bg-foreground text-background px-2 py-1 rounded-sm mb-3">
          Default
        </span>
      )}
      <div className="flex-1">
        <p className="font-semibold text-foreground">
          {address.firstName} {address.lastName}
        </p>
        {address.company && (
          <p className="text-sm text-muted-foreground">{address.company}</p>
        )}
        <address className="not-italic text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
          {address.formatted ? (
            address.formatted
          ) : (
            <>
              {address.address1}
              {address.address2 ? `, ${address.address2}` : ''}
              {'\n'}
              {address.city}
              {address.zoneCode ? `, ${address.zoneCode}` : ''}{' '}
              {address.zip}
              {'\n'}
              {address.territoryCode}
            </>
          )}
        </address>
        {address.phoneNumber && (
          <p className="text-sm text-muted-foreground mt-2">
            {address.phoneNumber}
          </p>
        )}
      </div>
      <div className="pt-4 mt-4 border-t border-border">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs uppercase tracking-wider font-semibold text-foreground hover:underline"
        >
          Edit →
        </button>
      </div>
    </div>
  );
}

/**
 * @param {{
 *   addressId: AddressFragment['id'];
 *   address: CustomerAddressInput;
 *   defaultAddress: CustomerFragment['defaultAddress'];
 *   children: (props: {
 *     stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
 *   }) => React.ReactNode;
 * }}
 */
export function AddressForm({addressId, address, defaultAddress, children}) {
  const {state, formMethod} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <Form id={addressId} className="space-y-4">
      <input type="hidden" name="addressId" defaultValue={addressId} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="First name *"
          id={`${addressId}-firstName`}
          name="firstName"
          autoComplete="given-name"
          defaultValue={address?.firstName ?? ''}
          required
        />
        <Field
          label="Last name *"
          id={`${addressId}-lastName`}
          name="lastName"
          autoComplete="family-name"
          defaultValue={address?.lastName ?? ''}
          required
        />
      </div>

      <Field
        label="Company"
        id={`${addressId}-company`}
        name="company"
        autoComplete="organization"
        defaultValue={address?.company ?? ''}
      />

      <Field
        label="Address line 1 *"
        id={`${addressId}-address1`}
        name="address1"
        autoComplete="address-line1"
        defaultValue={address?.address1 ?? ''}
        required
      />

      <Field
        label="Address line 2"
        id={`${addressId}-address2`}
        name="address2"
        autoComplete="address-line2"
        defaultValue={address?.address2 ?? ''}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="City *"
          id={`${addressId}-city`}
          name="city"
          autoComplete="address-level2"
          defaultValue={address?.city ?? ''}
          required
        />
        <Field
          label="State / Province *"
          id={`${addressId}-zoneCode`}
          name="zoneCode"
          autoComplete="address-level1"
          defaultValue={address?.zoneCode ?? ''}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="ZIP / Postal *"
          id={`${addressId}-zip`}
          name="zip"
          autoComplete="postal-code"
          defaultValue={address?.zip ?? ''}
          required
        />
        <Field
          label="Country code *"
          id={`${addressId}-territoryCode`}
          name="territoryCode"
          autoComplete="country"
          defaultValue={address?.territoryCode ?? ''}
          required
          maxLength={2}
          placeholder="US"
        />
      </div>

      <Field
        label="Phone"
        id={`${addressId}-phoneNumber`}
        name="phoneNumber"
        type="tel"
        autoComplete="tel"
        defaultValue={address?.phoneNumber ?? ''}
        pattern="^\+?[1-9]\d{3,14}$"
        placeholder="+16135551111"
      />

      <label
        htmlFor={`${addressId}-defaultAddress`}
        className="flex items-center gap-2.5 cursor-pointer select-none pt-1"
      >
        <input
          defaultChecked={isDefaultAddress}
          id={`${addressId}-defaultAddress`}
          name="defaultAddress"
          type="checkbox"
          className="w-4 h-4 accent-foreground"
        />
        <span className="text-sm text-foreground">
          Set as default address
        </span>
      </label>

      {error && (
        <div className="border border-destructive/40 bg-destructive/5 text-destructive text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {children({
        stateForMethod: (method) => (formMethod === method ? state : 'idle'),
      })}
    </Form>
  );
}

function Field({label, id, name, type = 'text', ...rest}) {
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
        type={type}
        aria-label={label}
        className="w-full h-11 px-4 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:border-foreground transition"
        {...rest}
      />
    </div>
  );
}

/**
 * @typedef {{
 *   addressId?: string | null;
 *   createdAddress?: AddressFragment;
 *   defaultAddress?: string | null;
 *   deletedAddress?: string | null;
 *   error: Record<AddressFragment['id'], string> | null;
 *   updatedAddress?: AddressFragment;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerAddressInput} CustomerAddressInput */
/** @typedef {import('customer-accountapi.generated').AddressFragment} AddressFragment */
/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('./+types/account.addresses').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */
