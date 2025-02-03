Passkeys
Passkeys are cryptographic key pairs created on end-user devices. Apple and Google are two major industry players pushing for the passkeys standard, which means that passkeys are widely available on consumer devices such as:

iPhones / iPads / Macbooks
Android phones / tablets
Chrome (on Windows / Mac / Android)
See here for a full list of systems that support passkeys.

The biggest value-add of passkeys, in the context of Web3, is saving users from manually managing and securing their private keys. Instead of writing down 12-word seed phrases, your user can simply use a passkey-enabled device to manage their wallet, and trust that the hardware will safely store the passkey, and the hardware vendor (e.g. Apple/Google) will securely backup the keys.

Demo
Passkeys

Demo
Source code
Passkeys + Session Keys

Demo
Source code
Read here for why you want to use passkeys with session keys.
How ZeroDev supports passkeys
ZeroDev/Kernel supports using passkeys as signers. The support comes in two flavors:

Native passkeys using the ERC-7212 precompile. Native passkeys are the best option when available, since it uses the least amount of gas (only 3450 gas for verifying a P256 signature). Currently only a small number of networks support ERC-7212, but it's expected that most networks will support it over time.

Smart contract passkeys using either the Daimo or FCL implementation. Smart contract passkeys can work on all EVM networks, but they are expensive (300-400k gas for verifying a P256 signature).

ZeroDev implements passkey supports through a progressive passkey validator, which uses native passkeys if ERC-7212 is available, and falls back to smart contract passkeys otherwise. Notably, this means that if you use passkeys on a network where ERC-7212 isn't available, and the network later adds support for ERC-7212, you don't need to upgrade your validator -- it will automatically start taking advantage of the ERC-7212 precompile.

Quickstart
Follow this tutorial to get started with passkey smart accounts.

Installation
npm
yarn
pnpm
bun

npm i @zerodev/passkey-validator
API
Setting up passkey server
In this tutorial, we will be using ZeroDev's passkey server. If you want to use your own passkey server, read this. If you wonder why a passkey server is needed at all, read this.

Head to the ZeroDev dashboard, select a project, and copy the passkey server URL:



If you are testing on localhost, just leave the domain empty. If you are deploying to a domain, enter and save the domain.

Creating a new passkey

import { toPasskeyValidator, toWebAuthnKey, WebAuthnMode, PasskeyValidatorContractVersion } from "@zerodev/passkey-validator"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
 
const webAuthnKey = await toWebAuthnKey({
  passkeyName: "passkey name",
  passkeyServerUrl: "your passkey server URL",
  mode: WebAuthnMode.Register,
  passkeyServerHeaders: {}
})
 
const passkeyValidator = await toPasskeyValidator(publicClient, {
  webAuthnKey,
  entryPoint: getEntryPoint("0.7"),
  kernelVersion: KERNEL_V3_1,
  validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
})
toWebAuthnKey will prompt the user to create a passkey with the given name.

Using an existing passkey

import { toPasskeyValidator, toWebAuthnKey, WebAuthnMode, PasskeyValidatorContractVersion } from "@zerodev/passkey-validator"
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants"
 
const webAuthnKey = await toWebAuthnKey({
  passkeyName: "passkey name",
  passkeyServerUrl: "your passkey server URL",
  mode: WebAuthnMode.Login,
  passkeyServerHeaders: {}
})
 
const passkeyValidator = await toPasskeyValidator(publicClient, {
  webAuthnKey,
  entryPoint: getEntryPoint("0.7"),
  kernelVersion: KERNEL_V3_1,
  validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
})
toWebAuthnKey will prompt the user to select an existing passkey.

Creating Kernel accounts
Now you can proceed to create Kernel accounts using the passkey validator as the sudo validator.

FAQs
Can I use passkeys with session keys?
Yes! Check out this demo and the source code.

Using passkeys with ECDSA session keys has multiple benefits:

If ERC-7212 hasn't been deployed on your network, passkeys can be expensive. With session keys, UserOps can be sent through ECDSA keys very cheaply. You only need to pay for the passkey validation cost once when you create a session key.

Your users don't have to deal with passkey signing prompts for every UserOp.

Why do we need a passkeys server?
A passkey is generated from a client-server handshake. In theory, we could simulate the handshake on the frontend, then store the public key on-chain. However, storing the public key on-chain involves sending a transaction, so you would want to do that as a part of deploying the account. However, if you must deploy a passkey account before you can use it, that breaks one of the core optimizations of AA which is counterfactual deployment -- the ability to use the address of a smart account without first deploying it.

We are working on ways to remove the dependency on a passkey server. In the mean time, keep in mind that the centralization concern is mitigated by the following:

You can use your own passkeys server.
The passkeys server only stores the public authentication data. Even if it's compromised, your users's keys are stored on their devices only.
If the passkey server is lost, only users who have not yet deployed their accounts (i.e. users who have been using accounts counterfactually) will be unable to recover their accounts. Users who have deployed their accounts will have their authentication data stored on-chain, so their accounts will be safe even if the passkey server is lost.

How do I use my own passkeys server?
You can optionally implement your own passkey server. To do that, make sure that your server implements the following URLs:

/register/options: Generate and return registration options to the client. The client will use these options to prompt the user to create a passkey. If you are utilizing the @simplewebauthn/server library, the generateRegistrationOptions function can be used for this purpose. During this process, consider generating and storing a unique userID for later database reference.

import { generateRegistrationOptions } from "@simplewebauthn/server"
 
const options = await generateRegistrationOptions({
  rpName, // your app name
  rpID, // your app domain
  userID, // a unique user ID
  userName, // user name (passkey name)
  userDisplayName,
  authenticatorSelection: {
    residentKey: "required",
    userVerification: "required",
    authenticatorAttachment: "platform",
  },
})
 
return options
/register/verify: Verify the registration response (cred) and return the results to the client. The verifyRegistrationResponse function is also available for this verification. Upon successful verification, store the user's credentials, such as pubKey and credentialId, in your database.

import { verifyRegistrationResponse } from "@simplewebauthn/server"
 
// get credential from request
const { cred } = await request.json<{
  cred: RegistrationResponseJSON
}>()
 
const clientData = JSON.parse(atob(cred.response.clientDataJSON))
 
const verification = await verifyRegistrationResponse({
  response: cred,
  expectedChallenge: clientData.challenge,
  expectedRPID, // your app domain
  expectedOrigin: c.req.header("origin")!, //! Allow from any origin
  requireUserVerification: true,
})
 
if (verification.verified) {
  // save the user credential like pubKey, credentialId to your database
  // ...
 
  // return the verification result
  return { verification }
}
 
// return 401 error if the verification is failed
/login/options: Generate login options, including a challenge for verification, and return them to the client. The generateAuthenticationOptions function will assist you in creating these options.

import { generateAuthenticationOptions } from "@simplewebauthn/server"
 
const options = await generateAuthenticationOptions({
  userVerification: "required",
  rpID: domainName,
})
 
return options
/login/verify: Verify the login response (cred) and report the outcome to the client. Use the verifyAuthenticationResponse for the verification process. In the event of successful verification, retrieve the new counter from authenticationInfo and update the user's credentials in your database. It's crucial to send both the verification result and the user's public key back to the client, as the public key is not known to the client during the login process.

import { verifyAuthenticationResponse } from "@simplewebauthn/server"
 
const cred = await request.json<{
  cred: AuthenticationResponseJSON
}>()
 
const clientData = JSON.parse(atob(cred.response.clientDataJSON))
 
// get user credential from your database
const user = await userRepo.get(userId)
const credential = user.credentials[cred.id]
 
const verification = await verifyAuthenticationResponse({
  response: cred,
  expectedChallenge: clientData.challenge,
  expectedOrigin: c.req.header("origin")!, //! Allow from any origin
  expectedRPID: domainName,
  authenticator: credential,
})
 
if (verification.verified) {
  // get new counter
  const { newCounter } = verification.authenticationInfo
 
  // update the user credential in your database
  // ...
 
  // return the verification result and the user's public key
  return { verification, pubKey: credential.pubKey }
}
 
// return 401 error if the verification is failed
Then, you can pass your server URL as passkeyServerUrl.


// creating a new passkey
const webAuthnKey = await toWebAuthnKey({
    passkeyName: "passkey name",
    passkeyServerUrl: "your passkey server URL",
    mode: WebAuthnMode.Register,
    passkeyServerHeaders: {}
})
 
// using an existing passkey
const webAuthnKey = await toWebAuthnKey({
    passkeyName: "passkey name",
    passkeyServerUrl: "your passkey server URL",
    mode: WebAuthnMode.Login,
    passkeyServerHeaders: {}
})
 
// create passkey validator
const passkeyValidator = await toPasskeyValidator(publicClient, {
  webAuthnKey,
  entryPoint: ENTRYPOINT_ADDRESS_V07,
  kernelVersion: KERNEL_V3_1,
  validatorContractVersion: PasskeyValidatorContractVersion.V0_0_2
})
If you want to refer to the ZeroDev passkey server implementation, you can find it here

How are passkeys sync-ed and recovered?
Synchronization and recovery are both supported natively by Apple and Google:

With Apple, Passkeys created on one device are synced through iCloud Keychain as long as the user is logged in with their Apple ID. Apple covers both syncing and recovery in "About the security of passkeys". For some additional detail, see this Q&A with the passkey team. Apple's account recovery process is documented in this support page.

With Google, Google Password Manager syncs passkeys across devices seamlessly. Google has plans to support syncing more broadly across different operating systems, see this support summary. Recovery is covered in this FAQ ("What happens if a user loses their device?"): it relies on Google's overall account recovery process because passkeys are attached to Google accounts.


Session Keys
EntryPoint v0.7 (Kernel v3)
Impatient? Check out complete examples here.

In EntryPoint 0.7 (Kernel v3), session keys have been upgraded into a more powerful "permissions system." Please refer to these docs.

EntryPoint v0.6 (Kernel v2)
Impatient? Check out complete examples here.

The following document is for session keys for EntryPoint 0.6 (Kernel v2). If you are using EntryPoint 0.7 (Kernel v3), please refer to permissions instead.

Session keys are keys assigned with specific permissions. Some examples are:

A key that can only interact with Uniswap
A key that can only use up to 1000 USDC
A key that expires in 3 days
Of course, the permissions can be composed, so you can create a key that can only interact with Uniswap, while only using up to 1000 USDC, while expiring in 3 days, for instance.

Session keys have two primary use cases:

Skipping confirmations: if you don't want your users to have to confirm every single transaction, you can create a session key that's only allowed to send specific transactions, and store the key in local storage. Now, your user can interact with your app with the session key without dealing with signing prompts. This experience is sometimes known as "one-click trading."

Automating transactions: if you want to execute transactions for your users automatically, they can create a session key and give it to you. You can then store the session keys on your server and execute transactions for your users. Your users don't have to fully trust you since the session keys are bounded by permissions.

The possibility with transaction automation is endless. Some examples are:

Subscriptions
Stop orders
Automatically paying back loans when the user is in danger of liquidation
Installation
npm
yarn
pnpm
bun

npm i @zerodev/session-key
API
When using session keys, it's helpful to distinguish between the owner and the agent.

The owner is whoever controls the master key of the account. The owner is the person that is able to create session keys.
The agent is whoever using the session key.
There are two typical flows for how the owner and the agent interact:

Owner-created: The owner creates the session key and shares it with the agent.

Agent-created: The agent creates a key pair and shares the public key with the owner. The owner creates a partial session key based on the public key, then shares the partial session key with the agent. Finally, the agent combines the private key wih the partial session key to form a full session key.

Let's walk through how each flow works.

Owner-created
Check out the code example for the owner-created pattern.

We assume that you have created a Kernel account. If you only have a kernelClient, the Kernel account can be accessed as kernelClient.account.

First, create a signer for the session key:


import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
 
const sessionPrivateKey = generatePrivateKey()
const sessionKeySigner = privateKeyToAccount(sessionPrivateKey)
Note that while we are using a local private key in this example, the session key signer can be any Viem account object.

Now, create a session key validator:


const sessionKeyValidator = await signerToSessionKeyValidator(publicClient, {
  signer: sessionKeySigner,
  validatorData: {
    // Set session key params
  },
})
Refer to the session key params section to learn about session key params.

Now, construct a Kernel account using your sudo validator and the session key validator:


const sessionKeyAccount = await createKernelAccount(publicClient, {
  plugins: {
    sudo: ecdsaValidator,
    regular: sessionKeyValidator,
  },
})
In this example, the sudo validator is ecdsaValidator.

If you want to use the session key on the same node, you can already construct a Kernel client from this Kernel account and start using it. If you want to share the session key with an agent or store it for use later, you can serialize the session key:


import { serializeSessionKeyAccount } from "@zerodev/session-key"
 
const serializedSessionKey = await serializeSessionKeyAccount(sessionKeyAccount, sessionPrivateKey)
Now, when the agent needs to use the session key (or when you want to use your stored session key later), deserialize it:


const sessionKeyAccount = await deserializeSessionKeyAccount(publicClient, serializedSessionKey)
Now you can create a Kernel client using the sessionKeyAccount as you normally would.

Agent-created
Check out the code example for the agent-created pattern.

In the agent-created pattern, the agent creates a public-private key pair and shares the public key with the owner. The owner authorizes the public key (by signing it), and shares the signed data with the agent. Finally, the agent creates the full session key by combining the signed data with the private key. This pattern is powerful because the agent never had to share the private part of the session key with anyone.

First, the agent creates a key pair:


import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
 
const sessionPrivateKey = generatePrivateKey()
const sessionKeySigner = privateKeyToAccount(sessionPrivateKey)
const sessionKeyAddress = sessionKeySigner.address
Note that while we are using a local private key in this example, the session key signer can be any Viem account object.

Then, the agent shares the public key (address) of this signer with the owner. In this case, it would be sessionKeySigner.address.

With this address, the owner can authorize the session key as such:


// Construct an "empty signer" that only has the address
const emptySessionKeySigner = addressToEmptyAccount(sessionKeyAddress)
 
const sessionKeyValidator = await signerToSessionKeyValidator(publicClient, {
  signer: emptySessionKeySigner,
  validatorData: {
    // Set session key params
  },
})
Refer to the session key params section to learn about session key params.

Now, the owner can construct a Kernel account using the sudo validator and the session key validator:


const sessionKeyAccount = await createKernelAccount(publicClient, {
  plugins: {
    sudo: ecdsaValidator,
    regular: sessionKeyValidator,
  },
})
Finally, the owner can serialize the session key and share it with the agent.


import { serializeSessionKeyAccount } from "@zerodev/session-key"
 
const serializedSessionKey = await serializeSessionKeyAccount(sessionKeyAccount)
Now, when the agent needs to use the session key, they deserialize it:


const sessionKeyAccount = await deserializeSessionKeyAccount(publicClient, serializedSessionKey, sessionKeySigner)
Note how we pass sessionKeySigner to deserializeSessionKeyAccount. This is the private part of the session key that only the agent knows about.

Now you can create a Kernel client using the sessionKeyAccount as you normally would.

Revoking Session Keys

import { revokeSessionKey } from "@zerodev/session-key"
 
// Revoke all session keys
const userOpHash = await revokeSessionKey(kernelClient)
 
// Revoke a specific session key
const userOpHash = await revokeSessionKey(kernelClient, sessionKeySigner.address)
Note that kernelClient in this case must be using the master signer (instead of the session key signer). If you want to revoke session keys using the session key signer itself, you must explicitly set up the session key permissions so that it's allowed to revoke itself. You can do so by including this permission:


import { SESSION_KEY_VALIDATOR_ADDRESS } from "@zerodev/session-key"
import { parseAbi } from "viem"
 
const sessionKeyValidator = await signerToSessionKeyValidator(publicClient, {
  // other options...
 
  validatorData: {
    // other options...
 
    permissions: [
      // other permissions...
 
      // Allow the session key to revoke itself
      {
        target: SESSION_KEY_VALIDATOR_ADDRESS,
        abi: parseAbi([
          'function disable(bytes calldata _data)',
        ]),
        functionName: 'disable',
        args: [
          {
            operator: ParamOperator.EQUAL,
            value: sessionKeySigner.address,
          },
        ],
      },
    ],
  },
})
Session Key Parameters
When creating a session key validator, you specify parameters under the validatorData flag:


const sessionKeyValidator = await signerToSessionKeyValidator(publicClient, {
  signer: sessionKeySigner,
  validatorData: {
    validUntil,
    validAfter,
    paymaster,
    permissions,
  },
})
Now we go over each parameter.

validUntil
validUntil is a UNIX timestamp (in seconds) that specifies when the session key should expire.

If not set or set to 0, then the session key will never expire.

validAfter
validAfter is a UNIX timestamp (in seconds) that specifies when the session key should start taking effect.

If not set or set to 0, then the session key will be valid immediately.

paymaster
paymaster specifies whether the session key must be used with a paymaster. It's highly recommended that you set this flag unless 1) you fully trust the agent holding the session key, or 2) you don't expect your users to hold any ETH (or whatever native token for the network). Otherwise, a malicious agent can set arbitrarily high gas price for UserOps sent with the session key, and then submit the UserOps themselves in order to profit from the gas, completely draining the user of ETH in the process.

By setting the paymaster flag to a non-zero value, you ensure that the session key can only be used with a paymaster, and the paymaster (if properly set up) should have defense against arbitrarily high gas prices.

If not set or set to address(0) (you can use zeroAddress from viem), the session key will work with or without paymaster.

If set to address(1) (you can use oneAddress from @zerodev/session-key), the session key will only work with a paymaster, but it can be any paymaster.

If set to a specific paymaster address, then the session key can only be used with that paymaster.

permissions
Permissions are at the core of session keys. By specifying permissions, you limit the types of transactions that the session key can send.

Permissions look like this:


import { ParamOperator } from "@zerodev/session-key"
 
const sessionKeyValidator = await signerToSessionKeyValidator(publicClient, {
  signer: sessionKeySigner,
  validatorData: {
    permissions: [
      {
        // Target contract to interact with
        target: contractAddress,
 
        // Maximum value that can be transferred.  In this case we
        // set it to zero so that no value transfer is possible.
        valueLimit: 0,
 
        // Contract ABI
        abi: contractABI,
 
        // Function name
        functionName: 'mint',
 
        // An array of conditions, each corresponding to an argument for
        // the function.
        args: [
          {
            // Argument operator and value.
            operator: ParamOperator.EQUAL,
            value: argumentValue,
          }
        ],
 
        // (optional) whether this is a call or a delegatecall.  Defaults to call
        operation: Operation.Call,
      },
      {
        // another permission...
      },
    ]
  },
})
Here's what each flag means:

target: the target contract to call or address to send ETH to. If this is zeroAddress, then the target can be any contract as long as the ABI matches (or it can be any address if no ABI is specified).
valueLimit: the maximum value that can be transmitted.
abi: the contract ABI
functionName: the function name
args: an array of conditions, each corresponding to an argument, in the order that the arguments are laid out. use null to skip an argument.
operator: this can be EQUAL, GREATER_THAN, LESS_THAN, GREATER_THAN_OR_EQUAL, LESS_THAN_OR_EQUAL, NOT_EQUAL.
value: the value of the argument to use with the operator. For instance, operator = EQUAL and value = 2 would mean "the value must be equal to 2".
operation: (optional) whether this is a call or a delegatecall. Defaults to call.
Batching and Delegatecall
To use session keys with batching, specify the following action when constructing the account:


import { zeroAddress, toFunctionSelector } from "viem"
import { KernelAccountAbi } from "@zerodev/sdk"
 
const sessionKeyAccount = await createKernelAccount(publicClient, {
  plugins: {
    sudo: ecdsaValidator,
    regular: sessionKeyValidator,
    action: {  
      address: zeroAddress,  
      selector: toFunctionSelector(getAbiItem({ abi: KernelAccountAbi, name: "executeBatch" })),  
    },  
  },
})
Then you can send batched UserOps with sendUserOperation([userops]) as usual.

To use session keys with delegatecall:


import { zeroAddress, toFunctionSelector } from "viem"
 
const sessionKeyAccount = await createKernelAccount(publicClient, {
  plugins: {
    sudo: ecdsaValidator,
    regular: sessionKeyValidator,
    action: { 
      address: zeroAddress, 
      selector: toFunctionSelector("executeDelegateCall(address, bytes)"), 
    }, 
  },
})
Transferring ETH
If you want to transfer ETH with a session key, specify the data field as such:


import { pad } from 'viem'
 
await sessionKeyAccountClient.sendTransaction({
  to: address,
  data: pad("0x", { size: 4 }),
  value: amountToTransfer,
})
FAQs
Does creating session keys cost gas?
No. Creating a session key entails simply signing a message, which is done off-chain and doesn't involve any gas cost.

Is it possible to use session keys with a not-yet-deployed account?
Yes. If you do so, the first UserOp sent with the session key will deploy the account.


