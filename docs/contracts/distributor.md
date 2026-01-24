# Distributor Contract

## Overview

The Distributor contract is a Soroban smart contract designed to facilitate the distribution of tokens to multiple recipients. It supports two main distribution methods: equal distribution, where a total amount is divided evenly among recipients, and weighted distribution, where specific amounts are sent to individual recipients.

## Functions

### `initialize(env: Env, admin: Address)`

Initializes the contract by setting the administrative address. This function must be called once after contract deployment.

-   `env`: The contract environment.
-   `admin`: The `Address` of the account that will have administrative privileges over the contract.

### `distribute_equal(env: Env, sender: Address, token: Address, total_amount: i128, recipients: Vec<Address>)`

Distributes an equal share of a `total_amount` of a specified `token` to a list of `recipients`. The `sender` must authorize this transaction.

-   `env`: The contract environment.
-   `sender`: The `Address` from which the `total_amount` of tokens will be deducted.
-   `token`: The `Address` of the token contract to be distributed.
-   `total_amount`: The total amount of tokens to be distributed. This amount will be divided equally among all recipients.
-   `recipients`: A `Vec` of `Address`es that will receive an equal share of the tokens.

**Note**: The actual token transfer logic from the sender to each recipient is marked as `TODO` in the current implementation and would typically involve calling the `transfer` function of the specified token contract.

### `distribute_weighted(env: Env, sender: Address, token: Address, recipients: Vec<Address>, amounts: Vec<i128>)`

Distributes specific, pre-defined `amounts` of a `token` to a corresponding list of `recipients`. The `sender` must authorize this transaction.

-   `env`: The contract environment.
-   `sender`: The `Address` from which the total sum of `amounts` will be deducted.
-   `token`: The `Address` of the token contract to be distributed.
-   `recipients`: A `Vec` of `Address`es that will receive tokens.
-   `amounts`: A `Vec` of `i128` values, where each value corresponds to the amount of tokens to be sent to the recipient at the same index in the `recipients` vector.

**Note**: Similar to `distribute_equal`, the actual token transfer logic from the sender to each recipient with their specified amount is marked as `TODO` in the current implementation.

### `get_admin(env: Env) -> Option<Address>`

Retrieves the current administrator `Address` of the contract.

-   `env`: The contract environment.
-   Returns: An `Option<Address>` containing the admin's address if set, otherwise `None`.
