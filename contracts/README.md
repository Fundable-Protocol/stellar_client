# Soroban Smart Contracts

This directory contains the Soroban smart contracts for the Fundable Protocol, written in Rust. The contracts are organized as a Cargo workspace.

## Workspace Structure

The `contracts` directory is a Cargo workspace with the following members:

-   `payment-stream`: A contract for creating and managing continuous token streams.
-   `distributor`: A contract for distributing tokens to multiple recipients.

Shared dependencies, such as the `soroban-sdk`, are managed in the root `Cargo.toml` of this workspace.

---

## Contracts

### 1. Payment Stream (`payment-stream`)

The `payment-stream` contract allows for the creation of linear payment streams, where a specified amount of tokens is released to a recipient over a defined period.

#### Core Concepts

-   **Stream:** A `Stream` is the central data structure, containing details about the sender, recipient, token, total amount, withdrawn amount, start and end times, and the stream's status.
-   **Status:** A stream can have one of the following statuses: `Active`, `Paused`, `Canceled`, or `Completed`.

#### Key Functions

-   `initialize(admin: Address)`: Initializes the contract with an administrative address.
-   `create_stream(...)`: Creates a new payment stream with specified parameters.
-   `get_stream(stream_id: u64)`: Retrieves the details of a specific stream.
-   `withdrawable_amount(stream_id: u64)`: Calculates the amount that can be withdrawn from a stream at the current time.
-   `withdraw(stream_id: u64, amount: i128)`: Allows the recipient to withdraw available funds.
-   `pause_stream(stream_id: u64)`: Pauses an active stream (sender only).
-   `resume_stream(stream_id: u64)`: Resumes a paused stream (sender only).
-   `cancel_stream(stream_id: u64)`: Cancels a stream (sender only), allowing for the recovery of unvested funds.

### 2. Distributor (`distributor`)

The `distributor` contract provides functionality for sending tokens to multiple recipients in a single transaction.

#### Core Concepts

The contract supports two modes of distribution:

-   **Equal Distribution:** A total amount is divided equally among a list of recipients.
-   **Weighted Distribution:** Each recipient in a list receives a corresponding specified amount.

#### Key Functions

-   `initialize(admin: Address)`: Initializes the contract with an administrative address.
-   `distribute_equal(...)`: Distributes a total amount equally among a list of recipients.
-   `distribute_weighted(...)`: Distributes specified amounts to a list of recipients.
-   `get_admin()`: Retrieves the admin address.

---

## Building and Testing

To build and test the contracts, you can use the following commands from the **root of the project**:

-   **Build Contracts:**
    ```bash
    pnpm build:contracts
    ```
    This command runs `cargo build --release` within the `contracts` workspace.

-   **Run Contract Tests:**
    ```bash
    pnpm test:contracts
    ```
    This command runs `cargo test` for all contracts in the workspace.
